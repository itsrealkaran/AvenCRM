import nodemailer from 'nodemailer';

const SendUserPasswordEmail = async (email: string, password: string) => {
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
        subject: "Welcome to AvenCRM! 🏠", // Subject line
        text: "Welcome to AvenCRM - Your Premier Real Estate Management Solution", // plain text body
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7C3AED; text-align: center;">Welcome to AvenCRM! 🏠</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Your password is ${password}.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Please change your password after logging in.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for using AvenCRM!
            </p>
          </div>
        `,
      });

      console.log(info);
};

export default SendUserPasswordEmail;