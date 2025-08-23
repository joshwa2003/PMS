const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from the parent directory (.env file is in backend/)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

// Dummy users data for all roles (excluding company_hr)
const dummyUsers = [
  // Admin Users
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@saec.edu.in',
    password: 'Admin@123',
    role: 'admin',
    department: 'ADMIN',
    phone: '9876543210',
    employeeId: 'ADMIN001',
    designation: 'System Administrator',
    isActive: true,
    isVerified: true,
    bio: 'System administrator with full access to the placement management system.'
  },
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.admin@saec.edu.in',
    password: 'Admin@123',
    role: 'admin',
    department: 'ADMIN',
    phone: '9876543211',
    employeeId: 'ADMIN002',
    designation: 'Senior Administrator',
    isActive: true,
    isVerified: true,
    bio: 'Senior administrator managing overall system operations.'
  },

  // Placement Directors
  {
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    email: 'priya.director@saec.edu.in',
    password: 'Director@123',
    role: 'placement_director',
    department: 'ADMIN',
    phone: '9876543212',
    employeeId: 'PD001',
    designation: 'Placement Director',
    isActive: true,
    isVerified: true,
    bio: 'Placement Director overseeing all placement activities and industry relations.'
  },
  {
    firstName: 'Prof. Arun',
    lastName: 'Patel',
    email: 'arun.director@saec.edu.in',
    password: 'Director@123',
    role: 'placement_director',
    department: 'ADMIN',
    phone: '9876543213',
    employeeId: 'PD002',
    designation: 'Associate Placement Director',
    isActive: true,
    isVerified: true,
    bio: 'Associate Placement Director managing placement strategies and coordination.'
  },

  // Placement Staff (Department-wise)
  {
    firstName: 'Meera',
    lastName: 'Singh',
    email: 'meera.cse@saec.edu.in',
    password: 'Staff@123',
    role: 'placement_staff',
    department: 'CSE',
    phone: '9876543214',
    employeeId: 'PS001',
    designation: 'Placement Officer - CSE',
    isActive: true,
    isVerified: true,
    bio: 'Placement officer for Computer Science and Engineering department.'
  },
  {
    firstName: 'Vikram',
    lastName: 'Reddy',
    email: 'vikram.ece@saec.edu.in',
    password: 'Staff@123',
    role: 'placement_staff',
    department: 'ECE',
    phone: '9876543215',
    employeeId: 'PS002',
    designation: 'Placement Officer - ECE',
    isActive: true,
    isVerified: true,
    bio: 'Placement officer for Electronics and Communication Engineering department.'
  },
  {
    firstName: 'Sunita',
    lastName: 'Gupta',
    email: 'sunita.eee@saec.edu.in',
    password: 'Staff@123',
    role: 'placement_staff',
    department: 'EEE',
    phone: '9876543216',
    employeeId: 'PS003',
    designation: 'Placement Officer - EEE',
    isActive: true,
    isVerified: true,
    bio: 'Placement officer for Electrical and Electronics Engineering department.'
  },

  // Department HODs
  {
    firstName: 'Dr. Ramesh',
    lastName: 'Chandra',
    email: 'ramesh.hod.cse@saec.edu.in',
    password: 'HOD@123',
    role: 'department_hod',
    department: 'CSE',
    phone: '9876543217',
    employeeId: 'HOD001',
    designation: 'Head of Department - CSE',
    isActive: true,
    isVerified: true,
    bio: 'Head of Computer Science and Engineering department with 15+ years of experience.'
  },
  {
    firstName: 'Dr. Kavitha',
    lastName: 'Nair',
    email: 'kavitha.hod.ece@saec.edu.in',
    password: 'HOD@123',
    role: 'department_hod',
    department: 'ECE',
    phone: '9876543218',
    employeeId: 'HOD002',
    designation: 'Head of Department - ECE',
    isActive: true,
    isVerified: true,
    bio: 'Head of Electronics and Communication Engineering department.'
  },
  {
    firstName: 'Dr. Suresh',
    lastName: 'Babu',
    email: 'suresh.hod.eee@saec.edu.in',
    password: 'HOD@123',
    role: 'department_hod',
    department: 'EEE',
    phone: '9876543219',
    employeeId: 'HOD003',
    designation: 'Head of Department - EEE',
    isActive: true,
    isVerified: true,
    bio: 'Head of Electrical and Electronics Engineering department.'
  },

  // Other Staff
  {
    firstName: 'Anita',
    lastName: 'Joshi',
    email: 'anita.staff@saec.edu.in',
    password: 'Staff@123',
    role: 'other_staff',
    department: 'ADMIN',
    phone: '9876543220',
    employeeId: 'OS001',
    designation: 'Administrative Assistant',
    isActive: true,
    isVerified: true,
    bio: 'Administrative assistant supporting placement activities.'
  },
  {
    firstName: 'Ravi',
    lastName: 'Tiwari',
    email: 'ravi.staff@saec.edu.in',
    password: 'Staff@123',
    role: 'other_staff',
    department: 'IT',
    phone: '9876543221',
    employeeId: 'OS002',
    designation: 'IT Support Specialist',
    isActive: true,
    isVerified: true,
    bio: 'IT support specialist maintaining placement portal and systems.'
  },

  // Students
  {
    firstName: 'Arjun',
    lastName: 'Krishnan',
    email: 'arjun.2021cse001@saec.edu.in',
    password: 'Student@123',
    role: 'student',
    department: 'CSE',
    phone: '9876543222',
    studentId: '2021CSE001',
    batch: '2021-2025',
    cgpa: 8.5,
    isActive: true,
    isVerified: true,
    bio: 'Final year CSE student interested in software development and AI.'
  },
  {
    firstName: 'Priyanka',
    lastName: 'Mehta',
    email: 'priyanka.2021cse002@saec.edu.in',
    password: 'Student@123',
    role: 'student',
    department: 'CSE',
    phone: '9876543223',
    studentId: '2021CSE002',
    batch: '2021-2025',
    cgpa: 9.2,
    isActive: true,
    isVerified: true,
    bio: 'CSE student with expertise in web development and machine learning.'
  },
  {
    firstName: 'Rohit',
    lastName: 'Sharma',
    email: 'rohit.2021ece001@saec.edu.in',
    password: 'Student@123',
    role: 'student',
    department: 'ECE',
    phone: '9876543224',
    studentId: '2021ECE001',
    batch: '2021-2025',
    cgpa: 8.8,
    isActive: true,
    isVerified: true,
    bio: 'ECE student specializing in embedded systems and IoT.'
  },
  {
    firstName: 'Sneha',
    lastName: 'Agarwal',
    email: 'sneha.2021eee001@saec.edu.in',
    password: 'Student@123',
    role: 'student',
    department: 'EEE',
    phone: '9876543225',
    studentId: '2021EEE001',
    batch: '2021-2025',
    cgpa: 8.3,
    isActive: true,
    isVerified: true,
    bio: 'EEE student interested in power systems and renewable energy.'
  },
  {
    firstName: 'Karthik',
    lastName: 'Raj',
    email: 'karthik.2022cse001@saec.edu.in',
    password: 'Student@123',
    role: 'student',
    department: 'CSE',
    phone: '9876543226',
    studentId: '2022CSE001',
    batch: '2022-2026',
    cgpa: 8.7,
    isActive: true,
    isVerified: true,
    bio: 'Third year CSE student passionate about cybersecurity and blockchain.'
  },

  // Alumni
  {
    firstName: 'Deepak',
    lastName: 'Verma',
    email: 'deepak.alumni@gmail.com',
    password: 'Alumni@123',
    role: 'alumni',
    department: 'CSE',
    phone: '9876543227',
    graduationYear: 2020,
    currentCompany: 'Google India',
    currentPosition: 'Software Engineer',
    isActive: true,
    isVerified: true,
    bio: 'CSE graduate working at Google India, passionate about mentoring current students.'
  },
  {
    firstName: 'Neha',
    lastName: 'Kapoor',
    email: 'neha.alumni@gmail.com',
    password: 'Alumni@123',
    role: 'alumni',
    department: 'ECE',
    phone: '9876543228',
    graduationYear: 2019,
    currentCompany: 'Microsoft',
    currentPosition: 'Senior Software Developer',
    isActive: true,
    isVerified: true,
    bio: 'ECE graduate at Microsoft, specializing in cloud technologies and AI.'
  },
  {
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'amit.alumni@gmail.com',
    password: 'Alumni@123',
    role: 'alumni',
    department: 'CSE',
    phone: '9876543229',
    graduationYear: 2018,
    currentCompany: 'Amazon',
    currentPosition: 'Principal Engineer',
    isActive: true,
    isVerified: true,
    bio: 'Senior engineer at Amazon with expertise in distributed systems.'
  },
  {
    firstName: 'Pooja',
    lastName: 'Rao',
    email: 'pooja.alumni@gmail.com',
    password: 'Alumni@123',
    role: 'alumni',
    department: 'EEE',
    phone: '9876543230',
    graduationYear: 2021,
    currentCompany: 'Tesla',
    currentPosition: 'Electrical Engineer',
    isActive: true,
    isVerified: true,
    bio: 'EEE graduate working at Tesla on electric vehicle technologies.'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use environment variable with fallback to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    
    // Log the connection attempt (without exposing sensitive credentials)
    const uriForLogging = mongoURI.includes('@') 
      ? mongoURI.replace(/:([^:@]{1,})@/, ':****@') 
      : mongoURI;
    console.log(`🔗 Attempting to connect to MongoDB: ${uriForLogging}`);
    
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found in environment variables, using fallback: mongodb://localhost:27017/pms');
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is running locally or check your MONGODB_URI');
    console.error('   2. Verify the .env file exists in the backend directory');
    console.error('   3. Check if MONGODB_URI is properly set in the .env file');
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding process...');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users with hashed passwords
    const usersToCreate = [];
    
    for (const userData of dummyUsers) {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Fix department field - move string value to departmentCode and set department to null
      const userDataFixed = { ...userData };
      if (userDataFixed.department && typeof userDataFixed.department === 'string') {
        userDataFixed.departmentCode = userDataFixed.department;
        userDataFixed.department = null;
      }
      
      usersToCreate.push({
        ...userDataFixed,
        password: hashedPassword,
        permissions: User.getRolePermissions(userDataFixed.role),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert users
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Successfully created ${createdUsers.length} users`);

    // Display summary
    const roleCount = {};
    createdUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    console.log('\n📊 User Summary by Role:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    console.log('\n🔐 Default Login Credentials:');
    console.log('   Admin: admin@saec.edu.in / Admin@123');
    console.log('   Placement Director: priya.director@saec.edu.in / Director@123');
    console.log('   Student: arjun.2021cse001@saec.edu.in / Student@123');
    console.log('   Alumni: deepak.alumni@gmail.com / Alumni@123');

    console.log('\n🎉 User seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedUsers();
  process.exit(0);
};

// Check if this file is being run directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedUsers, dummyUsers };
