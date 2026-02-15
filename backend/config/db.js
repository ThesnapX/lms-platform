const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove useNewUrlParser and useUnifiedTopology - they're deprecated in MongoDB driver 4+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(
      `🔌 Connection State: ${conn.connection.readyState === 1 ? "Connected" : "Disconnected"}`,
    );

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error details:");
    console.error("- Error name:", error.name);
    console.error("- Error message:", error.message);

    if (error.name === "MongoServerError" && error.code === 8000) {
      console.error("🔐 Authentication failed. Check username and password.");
    } else if (
      error.name === "MongoNetworkError" ||
      error.name === "MongooseServerSelectionError"
    ) {
      console.error("🌐 Network error. Common causes:");
      console.error("   1. IP not whitelisted in MongoDB Atlas");
      console.error("   2. Firewall blocking connection");
      console.error("   3. Internet connection issues");
      console.error("   4. Cluster is paused or in recovery");
    }

    // Retry connection after 5 seconds
    console.log("⏰ Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
