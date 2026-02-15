const Payment = require("../models/Payment");
const User = require("../models/User");
const Course = require("../models/Course");
const { sendPurchaseEmail } = require("../services/emailService");
// @desc    Create payment request
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    console.log("📸 Payment request received");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    // Double-check email verification
    const user = await User.findById(req.user._id);
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required to make purchases",
      });
    }

    const { courseId, amount, upiId } = req.body;

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "Please upload payment screenshot",
      });
    }

    console.log("✅ File uploaded:", {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
    });

    // Construct full URL for the screenshot
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const screenshotUrl = `${baseUrl}/uploads/payments/${req.file.filename}`;

    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      screenshot: {
        public_id: req.file.filename,
        url: screenshotUrl,
      },
      amount,
      upiId,
      status: "pending",
    });

    console.log("✅ Payment created:", payment._id);
    console.log("Screenshot URL saved:", payment.screenshot.url);

    res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user", "name email phone")
      .populate("course", "title price")
      .sort("-createdAt");

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's payments
// @route   GET /api/payments/my-payments
// @access  Private
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("course", "title price thumbnail")
      .sort("-createdAt");

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve payment (Admin only)
// @route   PUT /api/payments/:id/approve
// @access  Private/Admin
const approvePayment = async (req, res) => {
  try {
    console.log("\n=== PAYMENT APPROVAL DEBUG ===");
    console.log("Payment ID:", req.params.id);

    const payment = await Payment.findById(req.params.id)
      .populate("user")
      .populate("course");

    if (!payment) {
      console.log("❌ Payment not found");
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    console.log("Payment found:");
    console.log("- User:", payment.user?.email);
    console.log("- Course:", payment.course?.title);
    console.log("- Course ID:", payment.course?._id);

    payment.status = "approved";
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = Date.now();
    await payment.save();
    await sendPurchaseEmail(user, payment.course);

    // Grant course access to user
    const user = await User.findById(payment.user._id);

    console.log("- Purchased courses count:", user.purchasedCourses.length);

    const courseIdStr = payment.course._id.toString();

    // Check if user already has this course (prevent duplicates)
    const hasCourse = user.purchasedCourses.some(
      (id) => id.toString() === courseIdStr,
    );

    if (!hasCourse) {
      user.purchasedCourses.push(payment.course._id);
      console.log("✅ Course added to purchasedCourses");
    } else {
      console.log("⚠️ User already had this course - skipping duplicate");
    }

    // Check if progress already exists for this course
    const existingProgress = user.courseProgress.find(
      (p) => p.courseId?.toString() === courseIdStr,
    );

    if (!existingProgress) {
      // Initialize course progress
      user.courseProgress.push({
        courseId: payment.course._id,
        completedTopics: [],
        progressPercentage: 0,
      });
      console.log("✅ Course progress initialized");
    } else {
      console.log("⚠️ Progress already exists");
    }

    await user.save();
    console.log("✅ User saved successfully");

    console.log("=== PAYMENT APPROVAL COMPLETE ===\n");

    res.json({
      success: true,
      message: "Payment approved, course access granted",
    });
  } catch (error) {
    console.error("❌ Error approving payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject payment (Admin only)
// @route   PUT /api/payments/:id/reject
// @access  Private/Admin
const rejectPayment = async (req, res) => {
  try {
    const { remarks } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "rejected";
    payment.remarks = remarks || "Payment verification failed";
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = Date.now();
    await payment.save();

    res.json({
      success: true,
      message: "Payment rejected",
      payment,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getMyPayments,
  approvePayment,
  rejectPayment,
};
