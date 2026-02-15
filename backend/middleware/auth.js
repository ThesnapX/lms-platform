const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log(
        "Token received in protect middleware:",
        token ? "Present" : "Missing",
      );

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Get user from token
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
          console.log("❌ User not found from token");
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        console.log("✅ User authenticated in middleware:", req.user.email);
        next();
      } catch (jwtError) {
        console.error("❌ JWT Verification Error:", jwtError.message);
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
    } else {
      console.log("❌ No authorization header found");
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.error("❌ Protect middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
