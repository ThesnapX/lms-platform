const Suggestion = require("../models/Suggestion");

// @desc    Create new course suggestion
// @route   POST /api/suggestions
// @access  Private
const createSuggestion = async (req, res) => {
  try {
    console.log("📝 Creating suggestion:", req.body);

    const {
      title,
      description,
      category,
      audience,
      prerequisites,
      duration,
      reason,
    } = req.body;

    const suggestion = await Suggestion.create({
      title,
      description,
      category,
      audience,
      prerequisites: prerequisites || "",
      duration: duration || "",
      reason,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      status: "pending",
    });

    console.log("✅ Suggestion created:", suggestion._id);

    res.status(201).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error("❌ Error creating suggestion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all suggestions (Admin only)
// @route   GET /api/suggestions
// @access  Private/Admin
const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({}).sort("-createdAt");

    res.json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update suggestion status (Admin only)
// @route   PUT /api/suggestions/:id
// @access  Private/Admin
const updateSuggestionStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found",
      });
    }

    suggestion.status = status || suggestion.status;
    if (adminNotes !== undefined) suggestion.adminNotes = adminNotes;
    suggestion.reviewedBy = req.user._id;
    suggestion.reviewedAt = Date.now();

    await suggestion.save();

    res.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete suggestion (Admin only)
// @route   DELETE /api/suggestions/:id
// @access  Private/Admin
const deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found",
      });
    }

    await suggestion.deleteOne();

    res.json({
      success: true,
      message: "Suggestion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSuggestion,
  getSuggestions,
  updateSuggestionStatus,
  deleteSuggestion,
};
