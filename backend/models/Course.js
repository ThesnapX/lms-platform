const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    youtubeLink: {
      type: String,
      required: true,
      match: [
        /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
        "Please add a valid YouTube link",
      ],
    },
    resources: [
      {
        title: String,
        url: String,
        fileType: String,
      },
    ],
    isPreview: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topics: [topicSchema],
  order: {
    type: Number,
    default: 0,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    // Instructor field (custom text, not linked to user)
    instructor: {
      type: String,
      required: [true, "Please add instructor name"],
      trim: true,
    },
    // Pricing fields
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Discounted price must be less than regular price",
      },
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    thumbnail: {
      public_id: String,
      url: {
        type: String,
        required: true,
      },
    },
    chapters: [chapterSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Calculate total topics and discount percent before saving
courseSchema.pre("save", function (next) {
  // Calculate total topics
  let total = 0;
  this.chapters.forEach((chapter) => {
    total += chapter.topics.length;
  });
  this.totalTopics = total;

  // Calculate discount percent if discounted price is set
  if (this.discountedPrice && this.price > 0) {
    this.discountPercent = Math.round(
      ((this.price - this.discountedPrice) / this.price) * 100,
    );
  } else {
    this.discountPercent = 0;
    this.discountedPrice = undefined;
  }

  next();
});

module.exports = mongoose.model("Course", courseSchema);
