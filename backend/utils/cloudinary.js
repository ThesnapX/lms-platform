const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured for:", process.env.CLOUDINARY_CLOUD_NAME);

// Test Cloudinary connection
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary ping successful"))
  .catch((err) => console.error("❌ Cloudinary ping failed:", err.message));

module.exports = {
  cloudinary,
  // No multer exports needed anymore
};
