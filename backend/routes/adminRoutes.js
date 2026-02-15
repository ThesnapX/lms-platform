const express = require("express");
const router = express.Router();
const { sendPromotionalEmail } = require("../services/emailService");
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication AND admin role
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

router.post("/send-promotional", async (req, res) => {
  try {
    const { subject, content } = req.body;
    await sendPromotionalEmail(subject, content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
