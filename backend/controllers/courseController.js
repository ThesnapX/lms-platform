const Course = require("../models/Course");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .select(
        "title description price discountedPrice discountPercent instructor thumbnail createdBy totalTopics",
      )
      .populate("createdBy", "name");

    console.log(`📚 Sending ${courses.length} courses`);

    // Log first course to verify instructor
    if (courses.length > 0) {
      console.log("Sample course data:", {
        title: courses[0].title,
        instructor: courses[0].instructor,
      });
    }

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
// @access  Public/Private (depends on access)
const getCourse = async (req, res) => {
  try {
    console.log("\n========== SIMPLIFIED COURSE ACCESS ==========");
    console.log("Course ID:", req.params.id);
    console.log("User authenticated:", !!req.user);

    if (req.user) {
      console.log("User ID:", req.user._id.toString());
      console.log("User Role:", req.user.role);
    }

    const course = await Course.findById(req.params.id).populate(
      "createdBy",
      "name",
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let hasAccess = false;
    let userProgress = null;

    // If user is authenticated, check if they have access
    if (req.user) {
      // Find the user
      const user = await User.findById(req.user._id);

      if (user) {
        console.log("User email:", user.email);
        console.log("User purchasedCourses raw:", user.purchasedCourses);

        // Convert purchasedCourses IDs to strings for comparison
        const purchasedIds = user.purchasedCourses.map((id) => id.toString());
        const courseId = course._id.toString();

        console.log("Purchased IDs:", purchasedIds);
        console.log("Looking for course ID:", courseId);
        const courseInPurchased = purchasedIds.includes(courseId);
        console.log("Course found in purchased?", courseInPurchased);

        // Check if user has purchased this course
        const hasPurchased = courseInPurchased;

        // Check if user is admin or editor
        const isStaff = req.user.role === "admin" || req.user.role === "editor";

        hasAccess = hasPurchased || isStaff;
        console.log("Has purchased:", hasPurchased);
        console.log("Is staff:", isStaff);
        console.log("Final hasAccess:", hasAccess);

        if (hasAccess) {
          // Find progress - there might be multiple, get the first one
          const progresses = user.courseProgress.filter(
            (p) => p.courseId?.toString() === courseId,
          );

          console.log("Found progress entries:", progresses.length);

          if (progresses.length > 0) {
            userProgress = progresses[0];
            console.log("Using progress:", userProgress);

            // If there are multiple, log a warning
            if (progresses.length > 1) {
              console.log(
                "⚠️ Multiple progress entries found. Using first one.",
              );
            }
          } else {
            console.log("No progress found, creating one...");
            // Create progress if it doesn't exist
            user.courseProgress.push({
              courseId: course._id,
              completedTopics: [],
              progressPercentage: 0,
            });
            await user.save();
            userProgress = user.courseProgress.find(
              (p) => p.courseId?.toString() === courseId,
            );
          }
        }
      } else {
        console.log("❌ User not found in database");
      }
    }

    let courseData = course.toObject();

    // If user doesn't have access, filter only preview topics
    if (!hasAccess) {
      courseData.chapters = courseData.chapters.map((chapter) => ({
        ...chapter,
        topics: chapter.topics.filter((topic) => topic.isPreview),
      }));
    }

    console.log("========== END ==========\n");

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
    console.log("📝 Creating course with pricing...");

    const {
      title,
      description,
      instructor,
      price,
      discountedPrice,
      thumbnail,
      chapters,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !thumbnail || !chapters) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate discounted price if provided
    if (discountedPrice && discountedPrice >= price) {
      return res.status(400).json({
        success: false,
        message: "Discounted price must be less than regular price",
      });
    }

    // Calculate discount percent
    let discountPercent = 0;
    if (discountedPrice && price > 0) {
      discountPercent = Math.round(((price - discountedPrice) / price) * 100);
    }

    // Parse chapters if needed
    const parsedChapters =
      typeof chapters === "string" ? JSON.parse(chapters) : chapters;

    // Create course
    const courseData = {
      title,
      description,
      instructor,
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
    console.log("✅ Course created successfully:", course._id);
    console.log(
      "💰 Price:",
      course.price,
      "Discounted:",
      course.discountedPrice,
      "Discount:",
      course.discountPercent + "%",
    );

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("❌ Course creation error:", error);
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
    console.log("📝 Updating course:", req.params.id);
    console.log("Update data:", req.body);

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const {
      title,
      description,
      instructor,
      price,
      discountedPrice,
      thumbnail,
      chapters,
    } = req.body;

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (instructor) course.instructor = instructor;

    if (price) course.price = parseFloat(price);

    // Handle discounted price
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

      // Recalculate discount percent
      if (course.discountedPrice && course.price > 0) {
        course.discountPercent = Math.round(
          ((course.price - course.discountedPrice) / course.price) * 100,
        );
      } else {
        course.discountPercent = 0;
      }
    }

    // Update thumbnail if provided
    if (thumbnail && thumbnail.url) {
      course.thumbnail = {
        public_id: thumbnail.public_id || course.thumbnail.public_id,
        url: thumbnail.url,
      };
    }

    // Update chapters if provided
    if (chapters) {
      course.chapters =
        typeof chapters === "string" ? JSON.parse(chapters) : chapters;
    }

    await course.save();

    console.log("✅ Course updated successfully");

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("❌ Course update error:", error);
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

// @desc    Mark topic as completed
// @route   PUT /api/courses/:courseId/topics/:topicId/complete
// @access  Private
const markTopicComplete = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { courseId, topicId } = req.params;

    let courseProgress = user.courseProgress.find(
      (p) => p.courseId?.toString() === courseId,
    );

    if (!courseProgress) {
      courseProgress = {
        courseId,
        completedTopics: [],
        lastWatchedTopic: topicId,
        progressPercentage: 0,
      };
      user.courseProgress.push(courseProgress);
    }

    if (!courseProgress.completedTopics.includes(topicId)) {
      courseProgress.completedTopics.push(topicId);
    }

    courseProgress.lastWatchedTopic = topicId;

    const course = await Course.findById(courseId);
    const totalTopics = course?.totalTopics || 1;
    const completedCount = courseProgress.completedTopics.length;
    courseProgress.progressPercentage = Math.round(
      (completedCount / totalTopics) * 100,
    );

    await user.save();

    res.json({
      success: true,
      progress: courseProgress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add comment to topic
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
      for (let j = 0; j < chapter.topics.length; j++) {
        const topic = chapter.topics[j];
        if (topic._id.toString() === topicId) {
          foundTopic = topic;
          chapterIndex = i;
          topicIndex = j;
          break;
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

    // Add comment
    const newComment = {
      user: req.user._id,
      message,
      createdAt: Date.now(),
    };

    foundTopic.comments.push(newComment);
    await course.save();

    // Fetch the updated course with populated user data
    const updatedCourse = await Course.findById(courseId).populate({
      path: "chapters.topics.comments.user",
      select: "name email",
    });

    // Get the newly added comment with populated user data
    const populatedComment =
      updatedCourse.chapters[chapterIndex].topics[topicIndex].comments.pop();

    console.log("✅ Comment added:", populatedComment);

    res.status(201).json({
      success: true,
      comment: {
        _id: populatedComment._id,
        message: populatedComment.message,
        createdAt: populatedComment.createdAt,
        user: {
          _id: populatedComment.user._id,
          name: populatedComment.user.name,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Purchase course (initiate payment)
// @route   GET /api/courses/:id/purchase
// @access  Private
const purchaseCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user already owns this course
    const user = await User.findById(req.user._id);
    if (user.purchasedCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        message: "You already own this course",
      });
    }

    res.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        price: course.price,
        description: course.description,
      },
    });
  } catch (error) {
    console.error("Purchase course error:", error);
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
  purchaseCourse,
};
