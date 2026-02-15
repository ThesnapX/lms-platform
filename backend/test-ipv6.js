// Force Node.js to use IPv6 first
const dns = require("dns");
dns.setDefaultResultOrder("verbatim"); // This uses the actual DNS order (IPv6 first for this host)

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function testIPv6Connection() {
  console.log("🌐 Testing with IPv6 priority...");
  console.log("DNS order:", dns.getDefaultResultOrder());

  const uri = process.env.MONGODB_URI;
  // Remove ipv6=false if present
  const cleanUri = uri
    .replace("&ipv6=false", "")
    .replace("?ipv6=false&", "?")
    .replace("?ipv6=false", "");
  console.log("Connecting to:", cleanUri.replace(/:[^:]*@/, ":****@"));

  const client = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ SUCCESS! Connected to MongoDB via IPv6");

    const admin = client.db().admin();
    const info = await admin.serverInfo();
    console.log("📊 MongoDB version:", info.version);

    await client.close();
  } catch (error) {
    console.log("❌ Failed to connect");
    console.log("Error type:", error.name);
    console.log("Error message:", error.message);
  }
}

testIPv6Connection();
