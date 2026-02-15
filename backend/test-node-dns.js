// Force Node.js to use IPv4 first
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function testWithIPv4() {
  console.log("🌐 Testing with IPv4 priority...");
  console.log("DNS order:", dns.getDefaultResultOrder());

  const uri = process.env.MONGODB_URI;
  console.log("Connecting to:", uri.replace(/:[^:]*@/, ":****@"));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ SUCCESS! Connected to MongoDB");

    // Get server info
    const admin = client.db().admin();
    const info = await admin.serverInfo();
    console.log("📊 MongoDB version:", info.version);

    await client.close();
  } catch (error) {
    console.log("❌ Failed to connect");
    console.log("Error type:", error.name);
    console.log("Error message:", error.message);

    if (error.message.includes("getaddrinfo")) {
      console.log("\n🔧 DNS resolution failed. Try adding to hosts file:");
      console.log(
        "1. Find the IP: nslookup lms-platform.qsohbx8.mongodb.net 8.8.8.8",
      );
      console.log("2. Add to C:\\Windows\\System32\\drivers\\etc\\hosts");
    }
  }
}

testWithIPv4();
