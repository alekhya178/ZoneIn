const nodemailer = require("nodemailer");

/**
 * Real Mail Service using Nodemailer
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ Mail Server is ready to take our messages");
  }
});

const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"ZoneIn Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed; text-align: center;">ZoneIn Security</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following 6-digit verification code to proceed:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">&copy; 2026 ZoneIn. Focused Learning Made Simple.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Real OTP sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email Error:", error);
    // Fallback to console log in dev if sending fails
    console.log(`Dev Fallback OTP for ${email}: ${otp}`);
    return false;
  }
};

module.exports = { sendOTP };
