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
  addReview,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");
const requireEmailVerification = require("../middleware/verifiedEmail");

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse);

// Protected routes
router.put("/:courseId/topics/:topicId/complete", protect, markTopicComplete);
router.post("/:courseId/topics/:topicId/comments", protect, addComment);
router.post("/:courseId/reviews", protect, addReview);

// Admin/Editor routes
router.post("/", protect, authorize("editor", "admin"), createCourse);
router.put("/:id", protect, authorize("editor", "admin"), updateCourse);
router.delete("/:id", protect, authorize("editor", "admin"), deleteCourse);

module.exports = router;
