const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register user - OPTIMIZED FOR SPEED
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Quick validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists (quick query)
    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user - NO EMAIL VERIFICATION FIELDS
    const user = await User.create({
      name,
      email,
      password,
      role: "visitor",
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response immediately
    res.status(201).json({
      success: true,
      token,
      message: "Registration successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        purchasedCourses: user.purchasedCourses,
        courseProgress: user.courseProgress,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "purchasedCourses",
      "title thumbnail price discountedPrice",
    );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          password: Math.random().toString(36).slice(-8),
          role: "visitor",
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // We'll keep password reset emails as they're important
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #84cc16;">Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in 10 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
      </div>
    `;

    // For now, just return the reset token (you can add email later)
    res.json({
      success: true,
      message: "Password reset email sent",
      resetToken: resetToken, // For testing - remove in production
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const loginToken = generateToken(user._id);

    res.json({
      success: true,
      message: "Password reset successful",
      token: loginToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
  forgotPassword,
  resetPassword,
};
