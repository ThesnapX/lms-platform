const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

async function updateInstructors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all courses without instructor
    const courses = await Course.find({ instructor: { $exists: false } });
    console.log(`📚 Found ${courses.length} courses without instructor`);

    for (const course of courses) {
      // Set a default instructor name (you can customize this)
      course.instructor = "Harry The Admin";
      await course.save();
      console.log(
        `✅ Updated: ${course.title} - Instructor set to: ${course.instructor}`,
      );
    }

    // Also check for courses with null or empty instructor
    const nullCourses = await Course.find({
      $or: [{ instructor: null }, { instructor: "" }],
    });

    for (const course of nullCourses) {
      course.instructor = "Admin User";
      await course.save();
      console.log(`✅ Updated null instructor: ${course.title}`);
    }

    console.log("🎉 All courses updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateInstructors();
