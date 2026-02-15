const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  console.log("🔍 Testing MongoDB Connection...");
  console.log(
    "Connection String:",
    process.env.MONGODB_URI.replace(/:[^:]*@/, ":****@"),
  );

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ SUCCESS! Connected to MongoDB");

    // Get cluster info
    const admin = mongoose.connection.db.admin();
    const buildInfo = await admin.buildInfo();
    console.log("📊 MongoDB Version:", buildInfo.version);

    // List databases
    const dbs = await admin.listDatabases();
    console.log(
      "📚 Available Databases:",
      dbs.databases.map((db) => db.name).join(", "),
    );

    await mongoose.disconnect();
    console.log("👋 Disconnected");
  } catch (error) {
    console.error("❌ FAILED! Connection error:");
    console.error("Error Type:", error.name);
    console.error("Message:", error.message);

    if (error.message.includes("whitelist")) {
      console.error("\n🔴 SOLUTION: Your IP is not whitelisted!");
      console.error("   1. Go to https://cloud.mongodb.com");
      console.error('   2. Click "Network Access"');
      console.error('   3. Click "Add IP Address"');
      console.error("   4. Add your current IP or 0.0.0.0/0 for development");
    }
  }

  process.exit();
}

testConnection();
