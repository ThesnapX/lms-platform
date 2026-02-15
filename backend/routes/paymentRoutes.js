const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPayments,
  getMyPayments,
  approvePayment,
  rejectPayment,
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../utils/multerConfig");

// All routes require authentication
router.use(protect);

// Public payment routes (any authenticated user)
router.post("/", upload.single("screenshot"), createPayment);
router.get("/my-payments", getMyPayments);

// Admin only routes
router.get("/", authorize("admin"), getPayments);
router.put("/:id/approve", authorize("admin"), approvePayment);
router.put("/:id/reject", authorize("admin"), rejectPayment);

module.exports = router;
