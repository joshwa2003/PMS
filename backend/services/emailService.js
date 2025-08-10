const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize Gmail SMTP transporter
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
          pass: (process.env.SMTP_PASSWORD || 'your-app-password').replace(/\s/g, '')
        },
        tls: {
          rejectUnauthorized: false
        },
        authMethod: 'LOGIN'
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP connection error:', error);
        } else {
          console.log('SMTP server is ready to send emails');
        }
      });
    } catch (error) {
      console.error('Error initializing email transporter:', error);
    }
  }

  // Generate HTML email template for staff welcome email
  generateStaffWelcomeEmailTemplate(staffData, password) {
    const { firstName, lastName, email, role, department, designation, employeeId } = staffData;
    
    const roleDisplayNames = {
      placement_staff: 'Placement Staff',
      department_hod: 'Department HOD',
      other_staff: 'Other Staff'
    };

    const departmentDisplayNames = {
      CSE: 'Computer Science & Engineering',
      ECE: 'Electronics & Communication Engineering',
      EEE: 'Electrical & Electronics Engineering',
      MECH: 'Mechanical Engineering',
      CIVIL: 'Civil Engineering',
      IT: 'Information Technology',
      ADMIN: 'Administration',
      HR: 'Human Resources',
      OTHER: 'Other'
    };

    const roleDisplay = roleDisplayNames[role] || role;
    const departmentDisplay = departmentDisplayNames[department] || department;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PMS - Staff Account Created</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #2196F3;
            }
            .header h1 {
                color: #2196F3;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .welcome-message {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #28a745;
            }
            .credentials-box {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .credentials-box h3 {
                color: #856404;
                margin-top: 0;
                display: flex;
                align-items: center;
            }
            .credential-item {
                background-color: #ffffff;
                padding: 12px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .credential-label {
                font-weight: bold;
                color: #495057;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 4px;
                color: #212529;
                font-weight: bold;
            }
            .staff-info {
                background-color: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .staff-info h3 {
                color: #1976d2;
                margin-top: 0;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #bbdefb;
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: bold;
                color: #1565c0;
            }
            .info-value {
                color: #424242;
            }
            .security-notice {
                background-color: #fff5f5;
                border: 1px solid #fed7d7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .security-notice h4 {
                color: #c53030;
                margin-top: 0;
            }
            .next-steps {
                background-color: #f0f8ff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2196F3;
            }
            .next-steps h3 {
                color: #1976d2;
                margin-top: 0;
            }
            .next-steps ol {
                padding-left: 20px;
            }
            .next-steps li {
                margin: 8px 0;
                color: #424242;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
            .contact-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .warning-icon {
                color: #f39c12;
                margin-right: 8px;
            }
            .success-icon {
                color: #28a745;
                margin-right: 8px;
            }
            .info-icon {
                color: #17a2b8;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🎉 Welcome to PMS</h1>
                <p>Placement Management System</p>
            </div>

            <div class="welcome-message">
                <h2><span class="success-icon">✅</span>Your Staff Account Has Been Created!</h2>
                <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p>Welcome to the Placement Management System! Your staff account has been successfully created by the administration team.</p>
            </div>

            <div class="staff-info">
                <h3><span class="info-icon">👤</span>Your Profile Information</h3>
                <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${firstName} ${lastName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Role:</span>
                    <span class="info-value">${roleDisplay}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Department:</span>
                    <span class="info-value">${departmentDisplay}</span>
                </div>
                ${designation ? `
                <div class="info-row">
                    <span class="info-label">Designation:</span>
                    <span class="info-value">${designation}</span>
                </div>
                ` : ''}
                ${employeeId ? `
                <div class="info-row">
                    <span class="info-label">Employee ID:</span>
                    <span class="info-value">${employeeId}</span>
                </div>
                ` : ''}
            </div>

            <div class="credentials-box">
                <h3><span class="warning-icon">🔐</span>Your Login Credentials</h3>
                <p>Please use the following credentials to access the PMS system:</p>
                
                <div class="credential-item">
                    <span class="credential-label">Username (Email):</span>
                    <span class="credential-value">${email}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Temporary Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>

            <div class="security-notice">
                <h4><span class="warning-icon">⚠️</span>Important Security Notice</h4>
                <ul>
                    <li><strong>Change your password immediately</strong> after your first login</li>
                    <li>Do not share your login credentials with anyone</li>
                    <li>Keep this email secure and delete it after changing your password</li>
                    <li>If you suspect unauthorized access, contact the administrator immediately</li>
                </ul>
            </div>

            <div class="next-steps">
                <h3><span class="info-icon">📋</span>Next Steps</h3>
                <ol>
                    <li><strong>Login to the system</strong> using your email and temporary password</li>
                    <li><strong>Change your password</strong> to something secure and memorable</li>
                    <li><strong>Complete your profile</strong> with additional information if required</li>
                    <li><strong>Explore the system</strong> and familiarize yourself with the available features</li>
                    <li><strong>Contact support</strong> if you need any assistance</li>
                </ol>
            </div>

            <div class="contact-info">
                <h4>Need Help?</h4>
                <p>If you have any questions or need assistance, please contact:</p>
                <p><strong>PMS Support Team</strong></p>
                <p>Email: support@saec.edu.in | Phone: +91-XXXXXXXXXX</p>
            </div>

            <div class="footer">
                <p>This is an automated email from the Placement Management System.</p>
                <p>Please do not reply to this email address.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Management System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send welcome email to a single staff member
  async sendStaffWelcomeEmail(staffData, password) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const { firstName, lastName, email } = staffData;
      const htmlContent = this.generateStaffWelcomeEmailTemplate(staffData, password);

      const mailOptions = {
        from: {
          name: 'PMS - Placement Management System',
          address: process.env.SMTP_EMAIL || 'noreply@saec.edu.in'
        },
        to: email,
        subject: `🎉 Welcome to PMS - Your Staff Account is Ready!`,
        html: htmlContent,
        // Plain text fallback
        text: `
Welcome to PMS - Placement Management System!

Dear ${firstName} ${lastName},

Your staff account has been successfully created. Here are your login credentials:

Username (Email): ${email}
Temporary Password: ${password}

Please login to the system and change your password immediately for security.

Important Security Notes:
- Change your password after first login
- Do not share your credentials with anyone
- Keep this information secure

If you need any assistance, please contact the PMS support team.

Best regards,
PMS Administration Team
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        email: email
      };

    } catch (error) {
      console.error(`Error sending welcome email to ${staffData.email}:`, error);
      
      return {
        success: false,
        error: error.message,
        email: staffData.email
      };
    }
  }

  // Send welcome emails to multiple staff members (bulk)
  async sendBulkStaffWelcomeEmails(staffDataArray) {
    const results = {
      successful: [],
      failed: [],
      totalSent: 0,
      totalFailed: 0
    };

    console.log(`Starting bulk email sending for ${staffDataArray.length} staff members...`);

    for (const staffData of staffDataArray) {
      try {
        // Add a small delay between emails to avoid rate limiting
        if (results.successful.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        const emailResult = await this.sendStaffWelcomeEmail(staffData, staffData.defaultPassword);
        
        if (emailResult.success) {
          results.successful.push({
            email: staffData.email,
            name: `${staffData.firstName} ${staffData.lastName}`,
            messageId: emailResult.messageId
          });
          results.totalSent++;
        } else {
          results.failed.push({
            email: staffData.email,
            name: `${staffData.firstName} ${staffData.lastName}`,
            error: emailResult.error
          });
          results.totalFailed++;
        }

      } catch (error) {
        console.error(`Unexpected error sending email to ${staffData.email}:`, error);
        results.failed.push({
          email: staffData.email,
          name: `${staffData.firstName} ${staffData.lastName}`,
          error: error.message
        });
        results.totalFailed++;
      }
    }

    console.log(`Bulk email sending completed. Sent: ${results.totalSent}, Failed: ${results.totalFailed}`);
    
    return results;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generate HTML email template for student welcome email
  generateStudentWelcomeEmailTemplate(studentData, password) {
    const { firstName, lastName, email, studentId } = studentData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PMS - Student Account Created</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #4CAF50;
            }
            .header h1 {
                color: #4CAF50;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 16px;
            }
            .welcome-message {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #28a745;
            }
            .credentials-box {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .credentials-box h3 {
                color: #856404;
                margin-top: 0;
                display: flex;
                align-items: center;
            }
            .credential-item {
                background-color: #ffffff;
                padding: 12px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .credential-label {
                font-weight: bold;
                color: #495057;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 4px;
                color: #212529;
                font-weight: bold;
            }
            .student-info {
                background-color: #e8f5e8;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .student-info h3 {
                color: #2e7d32;
                margin-top: 0;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #c8e6c9;
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: bold;
                color: #1b5e20;
            }
            .info-value {
                color: #424242;
            }
            .security-notice {
                background-color: #fff5f5;
                border: 1px solid #fed7d7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .security-notice h4 {
                color: #c53030;
                margin-top: 0;
            }
            .next-steps {
                background-color: #f0fff4;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #4CAF50;
            }
            .next-steps h3 {
                color: #2e7d32;
                margin-top: 0;
            }
            .next-steps ol {
                padding-left: 20px;
            }
            .next-steps li {
                margin: 8px 0;
                color: #424242;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
            }
            .contact-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .warning-icon {
                color: #f39c12;
                margin-right: 8px;
            }
            .success-icon {
                color: #28a745;
                margin-right: 8px;
            }
            .info-icon {
                color: #17a2b8;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🎓 Welcome to PMS</h1>
                <p>Placement Management System</p>
            </div>

            <div class="welcome-message">
                <h2><span class="success-icon">✅</span>Your Student Account Has Been Created!</h2>
                <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p>Welcome to the Placement Management System! Your student account has been successfully created by the placement staff to help you with your career journey.</p>
            </div>

            <div class="student-info">
                <h3><span class="info-icon">👨‍🎓</span>Your Student Information</h3>
                <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${firstName} ${lastName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Student ID:</span>
                    <span class="info-value">${studentId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
            </div>

            <div class="credentials-box">
                <h3><span class="warning-icon">🔐</span>Your Login Credentials</h3>
                <p>Please use the following credentials to access the PMS system:</p>
                
                <div class="credential-item">
                    <span class="credential-label">Username (Email):</span>
                    <span class="credential-value">${email}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Temporary Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>

            <div class="security-notice">
                <h4><span class="warning-icon">⚠️</span>Important Security Notice</h4>
                <ul>
                    <li><strong>Change your password immediately</strong> after your first login</li>
                    <li>Do not share your login credentials with anyone</li>
                    <li>Keep this email secure and delete it after changing your password</li>
                    <li>If you suspect unauthorized access, contact the placement office immediately</li>
                </ul>
            </div>

            <div class="next-steps">
                <h3><span class="info-icon">📋</span>Next Steps</h3>
                <ol>
                    <li><strong>Login to the system</strong> using your email and temporary password</li>
                    <li><strong>Change your password</strong> to something secure and memorable</li>
                    <li><strong>Complete your profile</strong> with your academic and personal information</li>
                    <li><strong>Upload your resume</strong> and keep it updated</li>
                    <li><strong>Explore placement opportunities</strong> and apply for suitable positions</li>
                    <li><strong>Contact placement staff</strong> if you need any assistance</li>
                </ol>
            </div>

            <div class="contact-info">
                <h4>Need Help?</h4>
                <p>If you have any questions or need assistance, please contact:</p>
                <p><strong>Placement Office</strong></p>
                <p>Email: placement@saec.edu.in | Phone: +91-XXXXXXXXXX</p>
            </div>

            <div class="footer">
                <p>This is an automated email from the Placement Management System.</p>
                <p>Please do not reply to this email address.</p>
                <p>&copy; ${new Date().getFullYear()} Placement Management System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send welcome email to a single student
  async sendStudentWelcomeEmail(studentData, password) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const { firstName, lastName, email } = studentData;
      const htmlContent = this.generateStudentWelcomeEmailTemplate(studentData, password);

      const mailOptions = {
        from: {
          name: 'PMS - Placement Management System',
          address: process.env.SMTP_EMAIL || 'noreply@saec.edu.in'
        },
        to: email,
        subject: `🎓 Welcome to PMS - Your Student Account is Ready!`,
        html: htmlContent,
        // Plain text fallback
        text: `
Welcome to PMS - Placement Management System!

Dear ${firstName} ${lastName},

Your student account has been successfully created by the placement staff. Here are your login credentials:

Username (Email): ${email}
Temporary Password: ${password}
Student ID: ${studentData.studentId}

Please login to the system and change your password immediately for security.

Important Security Notes:
- Change your password after first login
- Do not share your credentials with anyone
- Keep this information secure

Next Steps:
1. Login to the system
2. Change your password
3. Complete your profile
4. Upload your resume
5. Explore placement opportunities

If you need any assistance, please contact the placement office.

Best regards,
Placement Office Team
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to student ${email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        email: email
      };

    } catch (error) {
      console.error(`Error sending welcome email to student ${studentData.email}:`, error);
      
      return {
        success: false,
        error: error.message,
        email: studentData.email
      };
    }
  }

  // Send welcome emails to multiple students (bulk)
  async sendBulkStudentWelcomeEmails(studentDataArray) {
    const results = {
      successful: [],
      failed: [],
      totalSent: 0,
      totalFailed: 0
    };

    console.log(`Starting bulk student email sending for ${studentDataArray.length} students...`);

    for (const studentData of studentDataArray) {
      try {
        // Add a small delay between emails to avoid rate limiting
        if (results.successful.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        const emailResult = await this.sendStudentWelcomeEmail(studentData, studentData.defaultPassword);
        
        if (emailResult.success) {
          results.successful.push({
            email: studentData.email,
            name: `${studentData.firstName} ${studentData.lastName}`,
            studentId: studentData.studentId,
            messageId: emailResult.messageId
          });
          results.totalSent++;
        } else {
          results.failed.push({
            email: studentData.email,
            name: `${studentData.firstName} ${studentData.lastName}`,
            studentId: studentData.studentId,
            error: emailResult.error
          });
          results.totalFailed++;
        }

      } catch (error) {
        console.error(`Unexpected error sending email to student ${studentData.email}:`, error);
        results.failed.push({
          email: studentData.email,
          name: `${studentData.firstName} ${studentData.lastName}`,
          studentId: studentData.studentId,
          error: error.message
        });
        results.totalFailed++;
      }
    }

    console.log(`Bulk student email sending completed. Sent: ${results.totalSent}, Failed: ${results.totalFailed}`);
    
    return results;
  }

  // Send a test email
  async sendTestEmail(toEmail) {
    try {
      const mailOptions = {
        from: {
          name: 'PMS - Placement Management System',
          address: process.env.SMTP_EMAIL || 'noreply@saec.edu.in'
        },
        to: toEmail,
        subject: 'PMS Email Configuration Test',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">PMS Email Test</h2>
          <p>This is a test email from the Placement Management System.</p>
          <p>If you received this email, the email configuration is working correctly.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
        `,
        text: `
PMS Email Configuration Test

This is a test email from the Placement Management System.
If you received this email, the email configuration is working correctly.

Sent at: ${new Date().toLocaleString()}
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Test email sent successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();
module.exports = emailService;
