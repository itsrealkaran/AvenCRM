import nodemailer from 'nodemailer';

const sendUserOTP = async (email: string, otp: string) => {
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
        from: 'info@avencrm.com', // sender address
        to: email, // list of receivers
        subject: "AvenCRM - Forgot Password", // Subject line
        text: "Your One Time Password", // plain text body
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7C3AED; text-align: center;">Your One Time Password</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Your OTP is ${otp}.
              <span style="color: #7C3AED; font-size: 12px;">This OTP will expire in 5 minutes.</span>
            </p>
          </div>
        `,
      });
};

export default sendUserOTP;