import nodemailer from 'nodemailer';

const sendPasswordResetEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: '"AvenCRM Security" <security@avencrm.com>',
        to: email,
        subject: "Reset Your Password - AvenCRM Security Code",
        text: `Your security code is: ${otp}. This code will expire in 5 minutes.`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
              <div style="padding: 40px 20px;">
                <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Main Content -->
                  <div style="padding: 32px 24px; text-align: center;">
                    <p style="color: #374151; font-family: 'Arial', sans-serif; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                      We received a request to reset your password. Here's your security code:
                    </p>

                    <!-- OTP Display -->
                    <div style="background-color: #f8f7ff; border: 2px dashed #5932EA; border-radius: 12px; padding: 20px; margin: 24px 0;">
                      <h2 style="color: #5932EA; font-family: 'Arial', sans-serif; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">
                        ${otp}
                      </h2>
                    </div>

                    <!-- Timer Warning -->
                    <div style="background-color: #fff8f8; border-radius: 8px; padding: 12px; margin-top: 20px;">
                      <p style="color: #dc2626; font-family: 'Arial', sans-serif; font-size: 14px; margin: 0;">
                        ⏰ This code will expire in <strong>5 minutes</strong>
                      </p>
                    </div>

                    <!-- Security Notice -->
                    <div style="margin-top: 32px; padding: 20px; background-color: #f8f7ff; border-radius: 8px;">
                      <p style="color: #4b5563; font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.5; margin: 0;">
                        <strong style="color: #374151;">Security Notice:</strong><br>
                        If you didn't request this code, please ignore this email and ensure your account is secure.
                      </p>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #f8f7ff; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-family: 'Arial', sans-serif; font-size: 12px; margin: 0;">
                      This is an automated message from AvenCRM Security. Please do not reply.
                    </p>
                  </div>
                </div>

                <!-- Company Footer -->
                <div style="text-align: center; margin-top: 24px;">
                  <p style="color: #6b7280; font-family: 'Arial', sans-serif; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} AvenCRM. All rights reserved.
                  </p>
                  <p style="color: #6b7280; font-family: 'Arial', sans-serif; font-size: 12px; margin: 8px 0 0;">
                    <a href="https://avencrm.com/privacy" style="color: #5932EA; text-decoration: none;">Privacy Policy</a> • 
                    <a href="https://avencrm.com/terms" style="color: #5932EA; text-decoration: none;">Terms of Service</a> • 
                    <a href="https://avencrm.com/contact" style="color: #5932EA; text-decoration: none;">Contact Support</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return info;
};

export default sendPasswordResetEmail;