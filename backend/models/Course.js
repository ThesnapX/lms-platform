const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  fileType: String,
});

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
    resources: [resourceSchema],
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

const subChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  topics: [topicSchema],
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  topics: [topicSchema],
  subChapters: [subChapterSchema],
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
    shortDescription: {
      type: String,
      required: [true, "Please add a short description"],
    },
    longDescription: {
      type: String,
      required: [true, "Please add a detailed description"],
    },
    instructor: {
      type: String,
      required: [true, "Please add instructor name"],
      trim: true,
    },
    tag: {
      type: String,
      trim: true,
    },
    categories: [
      {
        type: String,
        enum: [
          "Web Development",
          "Mobile Development",
          "Data Science",
          "DevOps",
          "Design",
          "Business",
          "Marketing",
          "AI & Machine Learning",
          "Cloud Computing",
          "Cybersecurity",
          "Other",
        ],
      },
    ],
    totalHours: {
      type: Number,
      required: [true, "Please add total hours"],
      min: 0,
    },
    forWhom: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert", "All Levels"],
      required: true,
    },
    prerequisite: {
      type: String,
      default: "No prerequisites required",
    },
    previewVideoLink: {
      type: String,
      required: [true, "Please add a preview video link"],
      match: [
        /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
        "Please add a valid YouTube link",
      ],
    },
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
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
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
  let total = 0;
  const countTopics = (topics) => topics.length;

  this.chapters.forEach((chapter) => {
    total += countTopics(chapter.topics || []);
    if (chapter.subChapters) {
      chapter.subChapters.forEach((sub) => {
        total += countTopics(sub.topics || []);
      });
    }
  });
  this.totalTopics = total;

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
