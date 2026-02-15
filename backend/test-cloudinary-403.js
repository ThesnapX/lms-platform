const cloudinary = require("cloudinary").v2;
require("dotenv").config();

console.log("🔍 CLOUDINARY 403 DEBUGGER");
console.log("===========================");

// Show current config
console.log("\n📋 Current Configuration:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing",
);

// Configure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test 1: Simple ping (doesn't require authentication)
console.log("\n📡 Test 1: Ping (no auth required)");
cloudinary.api
  .ping()
  .then((result) => console.log("✅ Ping success:", result))
  .catch((err) => console.log("❌ Ping failed:", err.message));

// Test 2: Get account usage (requires auth)
console.log("\n📡 Test 2: Get Account Usage (requires auth)");
cloudinary.api
  .usage()
  .then((result) =>
    console.log("✅ Usage success:", {
      plan: result.plan,
      credits: result.credits,
      usage: result.usage,
    }),
  )
  .catch((err) => {
    console.log("❌ Usage failed:", err.message);
    if (err.http_code === 403) {
      console.log("\n🔴 403 ERROR DETECTED!");
      console.log("Possible causes:");
      console.log("1. API key does not have permission for this action");
      console.log("2. Account is restricted/suspended");
      console.log("3. Wrong cloud name (still possible)");
      console.log("4. API key/secret are for a different environment");
    }
  });

// Test 3: Try to upload a tiny test image
console.log("\n📡 Test 3: Test Upload");
const testImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

cloudinary.uploader
  .upload(testImage, { folder: "test" })
  .then((result) => console.log("✅ Upload success:", result.secure_url))
  .catch((err) => {
    console.log("❌ Upload failed:", err.message);
    if (err.http_code === 403) {
      console.log("   Upload specifically failed with 403");
    }
  });

// Test 4: Try to create an upload signature (checks key/secret)
console.log("\n📡 Test 4: Generate Signature");
try {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "test",
    },
    process.env.CLOUDINARY_API_SECRET,
  );
  console.log("✅ Signature generation successful");
} catch (err) {
  console.log("❌ Signature generation failed:", err.message);
}
