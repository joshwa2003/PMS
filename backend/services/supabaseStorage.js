const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class SupabaseStorageService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check if Supabase is configured
    this.useSupabase = !!(this.supabaseUrl && this.supabaseKey);
    
    if (this.useSupabase) {
      console.log('Using Supabase for file storage');
      // Use service role key for admin operations if available, otherwise use anon key
      const keyToUse = this.supabaseServiceKey || this.supabaseKey;
      this.supabase = createClient(this.supabaseUrl, keyToUse);
      this.bucketName = 'student-files';
      
      // Initialize bucket on startup
      this.initializeBucket();
    } else {
      console.log('Supabase not configured, using local file storage');
      this.setupLocalStorage();
    }
  }

  /**
   * Setup local storage directories
   */
  setupLocalStorage() {
    const uploadsDir = path.join(__dirname, '../uploads');
    const profileImagesDir = path.join(uploadsDir, 'profile-images');
    const resumesDir = path.join(uploadsDir, 'resumes');

    // Create directories if they don't exist
    [uploadsDir, profileImagesDir, resumesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Initialize storage bucket and set up policies
   */
  async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.log('Could not list buckets:', listError.message);
        return;
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${this.bucketName}`);
        const { data, error } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log('Bucket created successfully:', data);
        }
      } else {
        console.log(`Bucket ${this.bucketName} already exists`);
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  /**
   * Upload profile image to storage (Supabase or local)
   */
  async uploadProfileImage(buffer, filename, userId) {
    try {
      console.log('Starting profile image upload for user:', userId);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
      
      if (this.useSupabase) {
        return await this.uploadToSupabase(buffer, `profile-images/${fileName}`, fileExtension);
      } else {
        return await this.uploadToLocal(buffer, fileName, 'profile-images');
      }
    } catch (error) {
      console.error('Upload profile image error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload to Supabase Storage
   */
  async uploadToSupabase(buffer, fileName, fileExtension) {
    try {
      // Determine content type
      const contentTypeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp'
      };
      const contentType = contentTypeMap[fileExtension] || 'image/jpeg';
      
      console.log('Uploading to Supabase:', fileName, 'Content-Type:', contentType);
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, buffer, {
          contentType: contentType,
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found')) {
          console.log('Bucket not found, attempting to create...');
          await this.initializeBucket();
          
          // Retry upload
          const { data: retryData, error: retryError } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, buffer, {
              contentType: contentType,
              upsert: true,
              cacheControl: '3600'
            });
            
          if (retryError) {
            console.error('Retry upload error:', retryError);
            return { success: false, error: retryError.message };
          }
          
          console.log('Retry upload successful:', retryData);
        } else {
          return { success: false, error: error.message };
        }
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('Supabase upload successful, public URL:', urlData.publicUrl);

      return { 
        success: true, 
        url: urlData.publicUrl,
        path: fileName 
      };
    } catch (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload to local storage
   */
  async uploadToLocal(buffer, fileName, subfolder) {
    try {
      const uploadsDir = path.join(__dirname, '../uploads', subfolder);
      const filePath = path.join(uploadsDir, fileName);
      
      console.log('Uploading to local storage:', filePath);
      
      // Write file to local storage
      fs.writeFileSync(filePath, buffer);
      
      // Generate public URL (assuming server serves static files from /uploads)
      const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/uploads/${subfolder}/${fileName}`;
      
      console.log('Local upload successful, public URL:', publicUrl);
      
      return {
        success: true,
        url: publicUrl,
        path: `${subfolder}/${fileName}`
      };
    } catch (error) {
      console.error('Local upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload resume/PDF to storage (Supabase or local)
   */
  async uploadResume(buffer, filename, userId) {
    try {
      console.log('Starting resume upload for user:', userId);
      
      const fileExtension = filename.split('.').pop().toLowerCase();
      const fileName = `resume-${userId}-${Date.now()}.${fileExtension}`;
      
      if (this.useSupabase) {
        return await this.uploadResumeToSupabase(buffer, `resumes/${fileName}`);
      } else {
        return await this.uploadToLocal(buffer, fileName, 'resumes');
      }
    } catch (error) {
      console.error('Upload resume error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload resume to Supabase Storage
   */
  async uploadResumeToSupabase(buffer, fileName) {
    try {
      console.log('Uploading resume to Supabase:', fileName);
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Supabase resume upload error:', error);
        
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found')) {
          console.log('Bucket not found, attempting to create...');
          await this.initializeBucket();
          
          // Retry upload
          const { data: retryData, error: retryError } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, buffer, {
              contentType: 'application/pdf',
              upsert: true,
              cacheControl: '3600'
            });
            
          if (retryError) {
            console.error('Retry resume upload error:', retryError);
            return { success: false, error: retryError.message };
          }
          
          console.log('Retry resume upload successful:', retryData);
        } else {
          return { success: false, error: error.message };
        }
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('Supabase resume upload successful, public URL:', urlData.publicUrl);

      return { 
        success: true, 
        url: urlData.publicUrl,
        path: fileName 
      };
    } catch (error) {
      console.error('Supabase resume upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(filePath) {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}

module.exports = new SupabaseStorageService();
