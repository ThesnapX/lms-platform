const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const { protect } = require("./middleware/auth");
const User = require("./models/User");
const Course = require("./models/Course"); // Added missing import

dotenv.config();
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Allowed origins - expanded to handle various cases
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://lmsio.vercel.app",
  "https://lms-io.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean); // Remove any undefined values

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Log the blocked origin for debugging
        console.log("🚫 Blocked origin:", origin);
        console.log("✅ Allowed origins:", allowedOrigins);

        // In development, you might want to allow all origins
        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }

        callback(new Error("CORS policy: This origin is not allowed"), false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Add CSP headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  );
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== HEALTH CHECK ENDPOINTS ====================
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 LMS API is running...</h1>
    <p>Environment: ${process.env.NODE_ENV || "development"}</p>
    <p>Time: ${new Date().toISOString()}</p>
    <p>Try these endpoints:</p>
    <ul>
      <li><a href="/api/health">/api/health</a> - Health check</li>
      <li><a href="/api/debug/public">/api/debug/public</a> - Public debug</li>
      <li><a href="/api/debug/env">/api/debug/env</a> - Environment check</li>
    </ul>
  `);
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "✅ Backend is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

app.get("/api/debug/public", (req, res) => {
  res.json({
    success: true,
    message: "✅ Public debug endpoint working",
    time: new Date().toISOString(),
    headers: {
      origin: req.headers.origin || "No origin",
      host: req.headers.host,
    },
  });
});

app.get("/api/debug/env", (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL,
    mongoConnected: !!mongoose.connection.readyState,
    allowedOrigins: allowedOrigins,
  });
});

// Database connection test endpoint
app.get("/api/debug/db", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    res.json({
      success: true,
      message: "✅ Database connected",
      stats: {
        users: userCount,
        courses: courseCount,
      },
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Database error",
      error: error.message,
    });
  }
});

// ==================== DEBUG ROUTES ====================
app.get("/api/debug/user", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
    token: req.headers.authorization ? "Present" : "Missing",
  });
});

app.get("/api/debug/headers", (req, res) => {
  res.json({
    success: true,
    headers: req.headers,
    origin: req.headers.origin || "No origin",
    authHeader: req.headers.authorization ? "Present" : "Missing",
  });
});

app.get("/api/debug/user-purchases", protect, async (req, res) => {
  try {
    console.log("🔍 Debug: Fetching purchases for user:", req.user._id);
    const user = await User.findById(req.user._id).populate("purchasedCourses");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const purchases = user.purchasedCourses.map((c) => ({
      id: c._id.toString(),
      title: c.title || "Untitled Course",
      price: c.price,
    }));

    res.json({
      success: true,
      userId: user._id.toString(),
      email: user.email,
      purchases: purchases,
      purchaseCount: purchases.length,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test course access endpoint
app.get("/api/test-course/:id", protect, async (req, res) => {
  try {
    console.log("🔍 SIMPLE TEST - User authenticated:", !!req.user);
    console.log("User ID:", req.user?._id);

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.json({ error: "Course not found" });
    }

    const purchasedIds = user.purchasedCourses.map((id) => id.toString());
    const hasAccess = purchasedIds.includes(req.params.id);

    res.json({
      success: true,
      userId: user._id.toString(),
      userEmail: user.email,
      courseId: req.params.id,
      purchasedIds: purchasedIds,
      hasAccess: hasAccess,
      message: hasAccess
        ? "✅ USER HAS ACCESS"
        : "❌ USER DOES NOT HAVE ACCESS",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MAIN ROUTES ====================
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/suggestions", suggestionRoutes);

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      "/",
      "/api/health",
      "/api/debug/public",
      "/api/debug/env",
      "/api/debug/db",
      "/api/auth/*",
      "/api/courses/*",
      "/api/payments/*",
      "/api/admin/*",
      "/api/suggestions/*",
    ],
  });
});

// Error handler
app.use(errorHandler);

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Live: https://lms-io.onrender.com`);
  console.log(`\n📝 Test endpoints:`);
  console.log(`   Health: https://lms-io.onrender.com/api/health`);
  console.log(`   Public: https://lms-io.onrender.com/api/debug/public`);
  console.log(`\n✅ Allowed origins:`, allowedOrigins);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
