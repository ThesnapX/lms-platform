const express = require("express");
const router = express.Router();
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

module.exports = router;
