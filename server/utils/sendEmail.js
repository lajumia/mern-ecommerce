import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOtpEmail(to, otp) {
  const emailMessage = await transporter.sendMail({
    from: `"MERN Ecommerce" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email - OTP Code",
    html: `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f9fafb;
      ">
        <div style="
          background-color: #ffffff;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        ">
          <h1 style="
            margin: 0 0 16px;
            color: #111827;
            text-align: center;
          ">
            MERN Ecommerce
          </h1>

          <p style="
            font-size: 16px;
            color: #374151;
            margin-bottom: 24px;
            text-align: center;
          ">
            Thanks for signing up! Please use the OTP below to verify your email address.
          </p>

          <div style="
            text-align: center;
            margin: 32px 0;
          ">
            <span style="
              display: inline-block;
              font-size: 32px;
              letter-spacing: 8px;
              font-weight: bold;
              color: #2563eb;
              padding: 12px 24px;
              border-radius: 6px;
              background-color: #eff6ff;
            ">
              ${otp}
            </span>
          </div>

          <p style="
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 24px;
          ">
            This OTP is valid for <strong>10 minutes</strong>.  
            Do not share this code with anyone.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="
            font-size: 13px;
            color: #9ca3af;
            text-align: center;
            margin: 0;
          ">
            If you didn’t create an account, you can safely ignore this email.
          </p>
        </div>

        <p style="
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          margin-top: 16px;
        ">
          © ${new Date().getFullYear()} MERN Ecommerce. All rights reserved.
        </p>
      </div>
    `
  });

  return emailMessage;

}

