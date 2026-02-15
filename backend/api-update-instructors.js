const mongoose = require("mongoose");
require("dotenv").config();
const Course = require("./models/Course");

async function updateInstructors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Update all courses with a default instructor
    const result = await Course.updateMany(
      {}, // empty filter = all documents
      {
        $set: {
          instructor: "Admin User",
        },
      },
    );

    console.log(`📊 Update result:`, result);
    console.log(`✅ Modified ${result.modifiedCount} courses`);

    // Verify the update
    const courses = await Course.find({}).select("title instructor");
    console.log("\n📚 Updated courses:");
    courses.forEach((c) => {
      console.log(`- ${c.title}: "${c.instructor}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateInstructors();
