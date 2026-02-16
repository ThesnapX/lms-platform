const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
