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

const sendContactEmail = async (contactData) => {
  const { name, email, subject, message } = contactData;
  try {
    const mailOptions = {
      from: `"ZoneIn Contact" <${process.env.EMAIL_USER}>`,
      to: "alekhyapuram08@gmail.com",
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed;">New Message Received</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <p style="white-space: pre-wrap; color: #374151;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">Sent from ZoneIn Web Dashboard Contact Form.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Contact email sent to admin for: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Contact Email Error:", error);
    return false;
  }
};

const sendStudyReminderEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"ZoneIn Reminders" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Ready for another session? 📚",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Hello ${name}!</h2>
          <p>This is your daily reminder to stay consistent with your goals. Success is built through small, daily actions.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; color: #1f2937; margin: 0;"><strong>Ready to dive back in?</strong></p>
            <a href="http://localhost:5173" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">Start Studying Now</a>
          </div>
          <p style="color: #6b7280; font-size: 12px;">You can change your reminder settings anytime in your dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">&copy; 2026 ZoneIn. Focused Learning Made Simple.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Study Reminder Email Error:", error);
    return false;
  }
};

const sendBreakReminderEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"ZoneIn Health" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Time to take a short break! ☕",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Take a moment, ${name}!</h2>
          <p>You've been studying hard for quite a while. Remember that short breaks actually improve focus and long-term retention.</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="font-size: 16px; color: #1e40af; margin: 0;"><strong>Stretch, hydrate, and rest your eyes for 5 minutes.</strong></p>
          </div>
          <p>Your session is still active, but your brain will thank you for the pause!</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">&copy; 2026 ZoneIn. Focused Learning Made Simple.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Break Reminder Email Error:", error);
    return false;
  }
};

const sendGoalCompletionEmail = async (email, name, roadmapTitle) => {
  try {
    const mailOptions = {
      from: `"ZoneIn Achievements" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Roadmap Mastered! 🏆",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed; text-align: center;">You did it, ${name}!</h2>
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 60px; margin-bottom: 15px;">🌟</div>
            <p style="font-size: 18px; color: #1f2937;">You have officially completed the entire roadmap:</p>
            <p style="font-size: 28px; font-weight: 900; color: #7c3aed; margin: 15px 0;">${roadmapTitle}</p>
          </div>
          <p style="text-align: center; line-height: 1.6;">Completing a full learning journey takes immense dedication and focus. Your consistency is paying off. What's next on your list?</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/roadmaps" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Start a New Journey</a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">&copy; 2026 ZoneIn. Focused Learning Made Simple.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Goal Completion Email Error:", error);
    return false;
  }
};

const sendWeeklyReportEmail = async (email, name, stats) => {
  try {
    const { totalMinutes, focusScore, sessionsCount } = stats;
    const mailOptions = {
      from: `"ZoneIn Analytics" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Weekly Learning Report 📊",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Your Week in Review, ${name}</h2>
          <p>Here's a summary of your learning progress over the last 7 days:</p>
          
          <div style="display: flex; justify-content: space-between; margin: 30px 0; background: #f9fafb; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; flex: 1;">
              <p style="font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Time Studied</p>
              <p style="font-size: 20px; font-weight: bold; color: #111827;">${totalMinutes}m</p>
            </div>
            <div style="text-align: center; flex: 1; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <p style="font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Avg Focus</p>
              <p style="font-size: 20px; font-weight: bold; color: #10b981;">${focusScore}%</p>
            </div>
            <div style="text-align: center; flex: 1;">
              <p style="font-size: 10px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Sessions</p>
              <p style="font-size: 20px; font-weight: bold; color: #111827;">${sessionsCount}</p>
            </div>
          </div>
          
          <p>Consistency is the key to mastery. See you next week!</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 11px;">&copy; 2026 ZoneIn. Focused Learning Made Simple.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Weekly Report Email Error:", error);
    return false;
  }
};

module.exports = { 
  sendOTP, 
  sendContactEmail, 
  sendStudyReminderEmail, 
  sendBreakReminderEmail,
  sendGoalCompletionEmail,
  sendWeeklyReportEmail
};
