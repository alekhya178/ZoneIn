const jwt = require("jsonwebtoken");
const User = require("../models/User");
const admin = require("../firebaseAdmin");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Received Token (first 20 chars):", token.substring(0, 20) + "...");
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    const { email, name, uid } = decodedToken;

    // Find user by email or firebaseUid
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log("Backend: Access denied, user not found in MongoDB for:", email);
      return res.status(401).json({ message: "User account no longer exists." });
    }

    // Sync name and firebaseUid if needed
    if (name && (!user.name || user.name === email.split('@')[0] || user.name === 'Learner')) {
      user.name = name;
      await user.save();
    }
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error Details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    let message = "Not authorized, token failed";
    if (error.code === 'auth/id-token-expired') {
      message = "Session expired, please login again";
    }
    return res.status(401).json({ message: `${message} (${error.message})` });
  }
};

module.exports = { protect };