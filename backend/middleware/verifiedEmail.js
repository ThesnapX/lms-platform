const User = require("../models/User");

const requireEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before purchasing courses",
        requiresVerification: true,
      });
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = requireEmailVerification;
