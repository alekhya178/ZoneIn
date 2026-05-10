const User = require("../models/User");
const OTP = require("../models/OTP");
const Note = require("../models/Note");
const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");
const Session = require("../models/Session");
const SubtopicProgress = require("../models/SubtopicProgress");
const RecentActivity = require("../models/RecentActivity");
const FocusStreak = require("../models/FocusStreak");
const TopicEngagement = require("../models/TopicEngagement");
const VideoWatch = require("../models/VideoWatch");
const { sendOTP } = require("../services/mailService");
const admin = require("firebase-admin");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: "firebase-managed", // Token is managed by Firebase Client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      focusStreak: user.focusStreak,
      totalStudyMinutes: user.totalStudyMinutes,
      token: "firebase-managed",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Sync Firebase user with MongoDB
// @route   POST /api/auth/sync
// @access  Public (Verifies Firebase Token)
const sync = async (req, res, next) => {
  try {
    const { firstName, lastName, preferredName, contact, state, country, bio } = req.body;
    
    // Get token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;

    // Find or Create user
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log("Backend Sync: Creating new user for:", email);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-10),
        firebaseUid: uid
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferredName) user.preferredName = preferredName;
    if (contact) user.contact = contact;
    if (state) user.state = state;
    if (country) user.country = country;
    if (bio) user.bio = bio;
    
    if (firstName && lastName) {
      user.name = `${firstName} ${lastName}`;
    }

    // Ensure firebaseUid is synced
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-password-otp
// @access  Public (or Private)
const sendPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.deleteMany({ email, type: 'password_reset' });
    await OTP.create({ email, code: otpCode, type: 'password_reset' });

    // Send via Mail Service
    await sendOTP(email, otpCode);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for password reset
const verifyPasswordOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const validOTP = await OTP.findOne({ email, code: otp, type: 'password_reset' });
    if (!validOTP) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    res.json({ success: true, message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password-with-otp
// @access  Public
const resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify OTP
    const validOTP = await OTP.findOne({ email, code: otp, type: 'password_reset' });
    if (!validOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Update Password in Firebase
    if (user.firebaseUid) {
      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword
      });
    }

    // 2. Update Password in MongoDB
    user.password = newPassword;
    await user.save();

    // Delete OTP after use
    await OTP.deleteOne({ _id: validOTP._id });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for account deletion
// @route   POST /api/auth/send-delete-otp
// @access  Private
const sendDeleteAccountOTP = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authorized" });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.deleteMany({ email: user.email, type: 'account_deletion' });
    await OTP.create({ email: user.email, code: otpCode, type: 'account_deletion' });

    // Send via Mail Service
    await sendOTP(user.email, otpCode);

    res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account using OTP
// @route   POST /api/auth/delete-account
// @access  Private
const deleteAccountWithOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    if (!otp) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    // Verify OTP
    const validOTP = await OTP.findOne({ email: user.email, code: otp, type: 'account_deletion' });
    if (!validOTP) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const userId = user._id;
    const email = user.email;
    const firebaseUid = user.firebaseUid;

    // 1. Delete from Firebase
    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
        console.log(`- Deleted from Firebase: ${email}`);
      } catch (fbErr) {
        console.error(`- Firebase deletion error for ${email}:`, fbErr.message);
        // Continue anyway if user is already gone from Firebase
      }
    }

    // 2. Delete all related data in MongoDB
    console.log(`- Cleaning up all data for user: ${email}`);
    await Promise.all([
      Note.deleteMany({ user: userId }),
      Roadmap.deleteMany({ user: userId }),
      RoadmapProgress.deleteMany({ userId: userId }),
      Session.deleteMany({ userId: userId }),
      SubtopicProgress.deleteMany({ userId: userId }),
      RecentActivity.deleteMany({ user: userId }),
      FocusStreak.deleteMany({ userId: userId }),
      TopicEngagement.deleteMany({ userId: userId }),
      VideoWatch.deleteMany({ userId: userId }),
      OTP.deleteMany({ email: email })
    ]);

    // 3. Delete the User record itself
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account permanently deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  sync, 
  sendPasswordOTP, 
  verifyPasswordOTP, 
  resetPasswordWithOTP,
  sendDeleteAccountOTP,
  deleteAccountWithOTP
};