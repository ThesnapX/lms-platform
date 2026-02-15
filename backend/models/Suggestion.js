const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a course description"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
    },
    targetAudience: {
      // Renamed from audience
      type: String,
      required: [true, "Please specify target audience"],
    },
    techStack: {
      // New field for software/language/tech stack
      type: String,
      default: "",
    },
    preferredInstructor: {
      // New field for YouTube/Udemy creator
      type: String,
      default: "",
    },
    reason: {
      type: String,
      required: [true, "Please explain why this course is needed"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Suggestion", suggestionSchema);
