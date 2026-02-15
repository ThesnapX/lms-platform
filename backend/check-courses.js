const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses:`);

    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course: ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Instructor: "${course.instructor}"`);
      console.log(`   Instructor exists: ${course.instructor ? "YES" : "NO"}`);
      console.log(`   Instructor type: ${typeof course.instructor}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCourses();
