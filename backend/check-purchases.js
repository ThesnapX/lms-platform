const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Course = require("./models/Course");

async function checkPurchases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a user (replace with your user email)
    const user = await User.findOne({
      email: "harshpatankar00@gmail.com",
    }).populate("purchasedCourses");

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("\n📊 User Details:");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Email Verified:", user.isEmailVerified);

    console.log("\n📚 Purchased Courses:");
    if (user.purchasedCourses.length === 0) {
      console.log("No purchased courses found");
    } else {
      user.purchasedCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course._id})`);
      });
    }

    // Check course progress
    console.log("\n📈 Course Progress:");
    if (user.courseProgress.length === 0) {
      console.log("No course progress found");
    } else {
      user.courseProgress.forEach((progress, index) => {
        console.log(`${index + 1}. Course ID: ${progress.courseId}`);
        console.log(`   Progress: ${progress.progressPercentage}%`);
        console.log(
          `   Completed Topics: ${progress.completedTopics?.length || 0}`,
        );
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkPurchases();
