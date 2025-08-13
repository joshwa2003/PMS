const nodemailer = require('nodemailer');

class AlternativeEmailService {
  constructor() {
    this.transporters = [];
    this.initializeTransporters();
  }

  // Initialize multiple email transporters for better deliverability
  initializeTransporters() {
    console.log('🔧 Initializing alternative email transporters...');

    // Primary Gmail transporter with enhanced settings
    try {
      const gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD?.replace(/\s/g, '')
        },
        tls: {
          rejectUnauthorized: false
        },
        // Enhanced deliverability settings
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5
      });

      this.transporters.push({
        name: 'Gmail',
        transporter: gmailTransporter,
        priority: 1
      });

      console.log('✅ Gmail transporter initialized');
    } catch (error) {
      console.error('❌ Gmail transporter failed:', error);
    }

    // Alternative SMTP transporter (more reliable)
    try {
      const smtpTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD?.replace(/\s/g, '')
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.transporters.push({
        name: 'SMTP-SSL',
        transporter: smtpTransporter,
        priority: 2
      });

      console.log('✅ SMTP-SSL transporter initialized');
    } catch (error) {
      console.error('❌ SMTP-SSL transporter failed:', error);
    }
  }

  // Enhanced student welcome email with better deliverability
  async sendStudentWelcomeEmailEnhanced(studentData, password) {
    const { firstName, lastName, email, studentId } = studentData;

    // Create a more deliverable email template
    const htmlContent = this.generateDeliverableEmailTemplate(studentData, password);

    const mailOptions = {
      from: {
        name: 'Placement Management System',
        address: process.env.SMTP_EMAIL
      },
      to: email,
      subject: 'Welcome to Placement Management System - Account Created',
      html: htmlContent,
      text: this.generatePlainTextEmail(studentData, password),
      // Enhanced headers for better deliverability
      headers: {
        'X-Priority': '3', // Normal priority (not high to avoid spam)
        'X-Mailer': 'PMS-System-v1.0',
        'Reply-To': process.env.SMTP_EMAIL,
        'List-Unsubscribe': `<mailto:${process.env.SMTP_EMAIL}?subject=unsubscribe>`,
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
      },
      messageId: `<pms-${studentId}-${Date.now()}@saec.edu.in>`,
      // Add tracking and delivery options
      dsn: {
        id: `pms-${studentId}-${Date.now()}`,
        return: 'headers',
        notify: ['failure', 'delay'],
        recipient: process.env.SMTP_EMAIL
      }
    };

    // Try multiple transporters
    for (const transporterConfig of this.transporters) {
      try {
        console.log(`📧 Attempting to send email via ${transporterConfig.name}...`);
        
        const result = await transporterConfig.transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully via ${transporterConfig.name}:`, result.messageId);
        
        return {
          success: true,
          messageId: result.messageId,
          email: email,
          provider: transporterConfig.name,
          result: result
        };

      } catch (error) {
        console.error(`❌ Failed to send via ${transporterConfig.name}:`, error.message);
        
        // Continue to next transporter
        if (transporterConfig === this.transporters[this.transporters.length - 1]) {
          // This was the last transporter, return error
          return {
            success: false,
            error: error.message,
            email: email,
            provider: transporterConfig.name,
            errorDetails: {
              code: error.code,
              command: error.command,
              response: error.response,
              responseCode: error.responseCode
            }
          };
        }
      }
    }
  }

  // Generate a more deliverable email template
  generateDeliverableEmailTemplate(studentData, password) {
    const { firstName, lastName, email, studentId } = studentData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Placement Management System</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            .header h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 24px;
            }
            .content {
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .credentials {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                border-left: 4px solid #007bff;
            }
            .important {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                border-left: 4px solid #ffc107;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding: 15px;
                color: #6c757d;
                font-size: 14px;
                border-top: 1px solid #dee2e6;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to Placement Management System</h1>
            <p>Your student account has been created successfully</p>
        </div>

        <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            
            <p>Your student account has been created in the Placement Management System. You can now access the system to manage your placement activities.</p>

            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Student ID:</strong> ${studentId}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <div class="important">
                <h3>Important Security Notice:</h3>
                <ul>
                    <li>Please change your password after your first login</li>
                    <li>Do not share your login credentials with anyone</li>
                    <li>Keep this email secure</li>
                </ul>
            </div>

            <h3>Next Steps:</h3>
            <ol>
                <li>Login to the system using your email and temporary password</li>
                <li>Change your password to something secure</li>
                <li>Complete your profile information</li>
                <li>Upload your resume</li>
            </ol>
        </div>

        <div class="footer">
            <p>This email was sent from the Placement Management System.</p>
            <p>If you have any questions, please contact the placement office.</p>
            <p>Email: ${process.env.SMTP_EMAIL}</p>
        </div>
    </body>
    </html>
    `;
  }

  // Generate plain text version
  generatePlainTextEmail(studentData, password) {
    const { firstName, lastName, email, studentId } = studentData;

    return `
Welcome to Placement Management System

Hello ${firstName} ${lastName},

Your student account has been created in the Placement Management System.

Your Login Credentials:
- Email: ${email}
- Student ID: ${studentId}
- Temporary Password: ${password}

Important Security Notice:
- Please change your password after your first login
- Do not share your login credentials with anyone
- Keep this email secure

Next Steps:
1. Login to the system using your email and temporary password
2. Change your password to something secure
3. Complete your profile information
4. Upload your resume

If you have any questions, please contact the placement office.
Email: ${process.env.SMTP_EMAIL}

This email was sent from the Placement Management System.
    `;
  }

  // Test email delivery with multiple methods
  async testEmailDelivery(toEmail) {
    const testResults = [];

    for (const transporterConfig of this.transporters) {
      try {
        const mailOptions = {
          from: {
            name: 'PMS Test',
            address: process.env.SMTP_EMAIL
          },
          to: toEmail,
          subject: `Email Delivery Test - ${transporterConfig.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Email Delivery Test</h2>
              <p>This test email was sent via <strong>${transporterConfig.name}</strong></p>
              <p>If you receive this email, the ${transporterConfig.name} configuration is working.</p>
              <p>Sent at: ${new Date().toLocaleString()}</p>
            </div>
          `,
          text: `Email Delivery Test - ${transporterConfig.name}\n\nThis test email was sent via ${transporterConfig.name}.\nSent at: ${new Date().toLocaleString()}`
        };

        const result = await transporterConfig.transporter.sendMail(mailOptions);
        
        testResults.push({
          provider: transporterConfig.name,
          success: true,
          messageId: result.messageId,
          response: result.response
        });

      } catch (error) {
        testResults.push({
          provider: transporterConfig.name,
          success: false,
          error: error.message,
          code: error.code
        });
      }
    }

    return testResults;
  }
}

// Create and export singleton instance
const alternativeEmailService = new AlternativeEmailService();
module.exports = alternativeEmailService;
