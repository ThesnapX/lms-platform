const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const { protect } = require("./middleware/auth"); // Add this import
const Course = require("./models/Course"); // Add this import

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DEBUG ROUTES - Add these temporarily
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

app.get("/api/debug/public", (req, res) => {
  res.json({
    success: true,
    message: "Public debug endpoint working",
    time: new Date().toISOString(),
  });
});

// Route files
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/suggestions", suggestionRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("LMS API is running...");
});

// Add this after your other routes
app.get("/api/debug/user-purchases", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("purchasedCourses");

    const purchases = user.purchasedCourses.map((c) => ({
      id: c._id.toString(),
      title: c.title,
    }));

    res.json({
      success: true,
      userId: user._id.toString(),
      email: user.email,
      purchases: purchases,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this after your other routes but before error handler
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

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
