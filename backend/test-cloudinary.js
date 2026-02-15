const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("🔍 Testing Cloudinary connection...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "API Key:",
  process.env.CLOUDINARY_API_KEY ? "✅ Present" : "❌ Missing",
);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing",
);

// Test the connection
cloudinary.api
  .ping()
  .then((result) => {
    console.log("✅ Cloudinary connection successful!");
    console.log("Status:", result.status);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Cloudinary connection failed:");
    console.error("Error:", error.message);
    if (error.message.includes("Invalid cloud name")) {
      console.error('\n🔴 FIX: Your cloud name "Root" is incorrect!');
      console.error("   1. Go to https://cloudinary.com/console");
      console.error("   2. Copy your actual Cloud Name from dashboard");
      console.error("   3. Update CLOUDINARY_CLOUD_NAME in .env file");
    }
    process.exit(1);
  });
