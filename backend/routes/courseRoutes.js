const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  markTopicComplete,
  addComment,
  purchaseCourse, // You'll need to add this controller function
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");
const requireEmailVerification = require("../middleware/verifiedEmail");

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse); // Remove protect from here to allow public viewing

// Protected routes - require authentication
router.get("/:id/purchase", protect, requireEmailVerification, purchaseCourse);
router.put("/:courseId/topics/:topicId/complete", protect, markTopicComplete);
router.post("/:courseId/topics/:topicId/comments", protect, addComment);

// Admin/Editor routes
router.post("/", protect, authorize("editor", "admin"), createCourse);
router.put("/:id", protect, authorize("editor", "admin"), updateCourse);
router.delete("/:id", protect, authorize("editor", "admin"), deleteCourse);

module.exports = router;
