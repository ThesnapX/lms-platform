const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      // Remove duplicates from purchasedCourses
      const uniquePurchased = [
        ...new Set(user.purchasedCourses.map((id) => id.toString())),
      ].map((id) => new mongoose.Types.ObjectId(id));

      if (uniquePurchased.length !== user.purchasedCourses.length) {
        console.log(`\n🔄 Fixing user: ${user.email}`);
        console.log(`   Before: ${user.purchasedCourses.length} courses`);
        console.log(`   After: ${uniquePurchased.length} courses`);

        user.purchasedCourses = uniquePurchased;
        await user.save();
      }

      // Remove duplicates from courseProgress (keep first occurrence)
      const uniqueProgress = [];
      const seenCourseIds = new Set();

      for (const progress of user.courseProgress) {
        if (
          progress.courseId &&
          !seenCourseIds.has(progress.courseId.toString())
        ) {
          seenCourseIds.add(progress.courseId.toString());
          uniqueProgress.push(progress);
        } else {
          console.log(
            `   🗑️ Removing duplicate progress for course: ${progress.courseId}`,
          );
        }
      }

      if (uniqueProgress.length !== user.courseProgress.length) {
        user.courseProgress = uniqueProgress;
        await user.save();
        console.log(`   ✅ Fixed progress entries`);
      }
    }

    console.log("\n✅ Cleanup complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupDuplicates();
