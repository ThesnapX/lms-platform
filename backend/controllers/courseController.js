const Course = require("../models/Course");
const User = require("../models/User");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .select(
        "title shortDescription instructor tag categories price discountedPrice discountPercent thumbnail averageRating totalRatings totalHours forWhom prerequisite",
      )
      .populate("createdBy", "name");

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "name")
      .populate({
        path: "chapters.topics.comments.user",
        select: "name",
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let hasAccess = false;
    let userProgress = null;

    if (req.user) {
      const user = await User.findById(req.user._id);

      const purchasedIds = user.purchasedCourses.map((id) => id.toString());
      const courseId = course._id.toString();

      hasAccess =
        purchasedIds.includes(courseId) ||
        req.user.role === "admin" ||
        req.user.role === "editor";

      if (hasAccess) {
        userProgress = user.courseProgress.find(
          (p) => p.courseId?.toString() === courseId,
        );
      }
    }

    const courseData = course.toObject();

    res.json({
      success: true,
      course: courseData,
      hasAccess,
      userProgress,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Editor/Admin)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      longDescription,
      instructor,
      tag,
      categories,
      totalHours,
      forWhom,
      prerequisite,
      previewVideoLink,
      price,
      discountedPrice,
      thumbnail,
      chapters,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !shortDescription ||
      !longDescription ||
      !instructor ||
      !totalHours ||
      !forWhom ||
      !previewVideoLink ||
      !price ||
      !thumbnail ||
      !chapters
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (discountedPrice && discountedPrice >= price) {
      return res.status(400).json({
        success: false,
        message: "Discounted price must be less than regular price",
      });
    }

    let discountPercent = 0;
    if (discountedPrice && price > 0) {
      discountPercent = Math.round(((price - discountedPrice) / price) * 100);
    }

    const parsedChapters =
      typeof chapters === "string" ? JSON.parse(chapters) : chapters;

    const courseData = {
      title,
      shortDescription,
      longDescription,
      instructor,
      tag: tag || "",
      categories: categories || [],
      totalHours: parseFloat(totalHours),
      forWhom,
      prerequisite: prerequisite || "No prerequisites required",
      previewVideoLink,
      price: parseFloat(price),
      discountedPrice: discountedPrice
        ? parseFloat(discountedPrice)
        : undefined,
      discountPercent,
      thumbnail: {
        public_id: thumbnail.public_id,
        url: thumbnail.url,
      },
      chapters: parsedChapters,
      createdBy: req.user._id,
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Editor/Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const {
      title,
      shortDescription,
      longDescription,
      instructor,
      tag,
      categories,
      totalHours,
      forWhom,
      prerequisite,
      previewVideoLink,
      price,
      discountedPrice,
      thumbnail,
      chapters,
    } = req.body;

    if (title) course.title = title;
    if (shortDescription) course.shortDescription = shortDescription;
    if (longDescription) course.longDescription = longDescription;
    if (instructor) course.instructor = instructor;
    if (tag !== undefined) course.tag = tag;
    if (categories) course.categories = categories;
    if (totalHours) course.totalHours = parseFloat(totalHours);
    if (forWhom) course.forWhom = forWhom;
    if (prerequisite !== undefined) course.prerequisite = prerequisite;
    if (previewVideoLink) course.previewVideoLink = previewVideoLink;

    if (price) {
      course.price = parseFloat(price);

      if (course.discountedPrice && course.discountedPrice >= course.price) {
        course.discountedPrice = undefined;
        course.discountPercent = 0;
      }
    }

    if (discountedPrice !== undefined) {
      if (discountedPrice && discountedPrice >= course.price) {
        return res.status(400).json({
          success: false,
          message: "Discounted price must be less than regular price",
        });
      }
      course.discountedPrice = discountedPrice
        ? parseFloat(discountedPrice)
        : undefined;

      if (course.discountedPrice && course.price > 0) {
        course.discountPercent = Math.round(
          ((course.price - course.discountedPrice) / course.price) * 100,
        );
      } else {
        course.discountPercent = 0;
      }
    }

    if (thumbnail && thumbnail.url) {
      course.thumbnail = {
        public_id: thumbnail.public_id || course.thumbnail.public_id,
        url: thumbnail.url,
      };
    }

    if (chapters) {
      course.chapters =
        typeof chapters === "string" ? JSON.parse(chapters) : chapters;
    }

    await course.save();

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Course update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Editor/Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: "Course removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark topic complete
// @route   PUT /api/courses/:courseId/topics/:topicId/complete
// @access  Private
const markTopicComplete = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { courseId, topicId } = req.params;

    let progress = user.courseProgress.find(
      (p) => p.courseId?.toString() === courseId,
    );

    if (!progress) {
      progress = {
        courseId,
        completedTopics: [],
        lastWatchedTopic: topicId,
        progressPercentage: 0,
      };
      user.courseProgress.push(progress);
    }

    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
    }

    progress.lastWatchedTopic = topicId;

    const course = await Course.findById(courseId);
    const completedCount = progress.completedTopics.length;
    progress.progressPercentage = Math.round(
      (completedCount / course.totalTopics) * 100,
    );

    await user.save();

    res.json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add comment
// @route   POST /api/courses/:courseId/topics/:topicId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const { courseId, topicId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the topic
    let foundTopic = null;
    let chapterIndex = -1;
    let topicIndex = -1;

    for (let i = 0; i < course.chapters.length; i++) {
      const chapter = course.chapters[i];
      for (let j = 0; j < (chapter.topics || []).length; j++) {
        const topic = chapter.topics[j];
        if (topic._id.toString() === topicId) {
          foundTopic = topic;
          chapterIndex = i;
          topicIndex = j;
          break;
        }
      }
      if (foundTopic) break;

      // Check subchapters
      if (chapter.subChapters) {
        for (let s = 0; s < chapter.subChapters.length; s++) {
          const sub = chapter.subChapters[s];
          for (let j = 0; j < (sub.topics || []).length; j++) {
            const topic = sub.topics[j];
            if (topic._id.toString() === topicId) {
              foundTopic = topic;
              chapterIndex = i;
              topicIndex = j;
              break;
            }
          }
          if (foundTopic) break;
        }
      }
      if (foundTopic) break;
    }

    if (!foundTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const newComment = {
      user: req.user._id,
      message,
      createdAt: Date.now(),
    };

    foundTopic.comments.push(newComment);
    await course.save();

    const populatedCourse = await Course.findById(courseId).populate({
      path: "chapters.topics.comments.user",
      select: "name",
    });

    // Get the added comment
    let addedComment = null;
    for (const ch of populatedCourse.chapters) {
      for (const t of ch.topics || []) {
        if (t._id.toString() === topicId) {
          addedComment = t.comments[t.comments.length - 1];
          break;
        }
      }
      if (addedComment) break;
    }

    res.status(201).json({
      success: true,
      comment: {
        _id: addedComment._id,
        message: addedComment.message,
        createdAt: addedComment.createdAt,
        user: {
          _id: addedComment.user._id,
          name: addedComment.user.name,
        },
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add review
// @route   POST /api/courses/:courseId/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.purchasedCourses.includes(course._id)) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled users can review",
      });
    }

    // Update average rating
    const total = course.totalRatings * course.averageRating + rating;
    course.totalRatings += 1;
    course.averageRating = total / course.totalRatings;

    await course.save();

    res.json({
      success: true,
      averageRating: course.averageRating,
      totalRatings: course.totalRatings,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  markTopicComplete,
  addComment,
  addReview,
  // purchaseCourse,
};
