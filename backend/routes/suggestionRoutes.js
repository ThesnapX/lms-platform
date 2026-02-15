const express = require("express");
const router = express.Router();
const {
  createSuggestion,
  getSuggestions,
  updateSuggestionStatus,
  deleteSuggestion,
} = require("../controllers/suggestionController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes - any authenticated user can create
router.post("/", protect, createSuggestion);

// Admin only routes
router.get("/", protect, authorize("admin"), getSuggestions);
router.put("/:id", protect, authorize("admin"), updateSuggestionStatus);
router.delete("/:id", protect, authorize("admin"), deleteSuggestion);

module.exports = router;
