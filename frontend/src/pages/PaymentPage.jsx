import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  CreditCardIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState(1); // 1: QR, 2: Upload, 3: Success
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState("");

  // UPI Details
  const upiId = "harshpatankar00@okhdfcbank";
  const payeeName = "LMS.io Platform";
  const currency = "INR";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if email is verified
    if (!user?.isEmailVerified) {
      navigate("/dashboard?verify=required");
      return;
    }

    fetchCourseDetails();
  }, [courseId, isAuthenticated, user, navigate]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/courses/${courseId}`);
      setCourse(response.data.course);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  // Calculate display price (use discounted price if available)
  const getDisplayPrice = () => {
    if (!course) return 0;
    return course.discountedPrice || course.price;
  };

  // Generate UPI deep link
  const getUpiLink = () => {
    const amount = getDisplayPrice();
    const note = `Payment for ${course?.title}`;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(note)}`;
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      alert("Please upload payment screenshot");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("screenshot", screenshot);
      formData.append("courseId", courseId);
      formData.append("amount", getDisplayPrice().toString());
      formData.append("upiId", upiId);

      console.log("📤 Uploading screenshot:", screenshot.name);

      const response = await axios.post("/payments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Payment submitted:", response.data);

      setPaymentStatus("pending");
      setPaymentStep(3);

      // Reset form
      setScreenshot(null);
      setScreenshotPreview("");
    } catch (error) {
      console.error("❌ Payment submission error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to submit payment. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStep(1);
    setScreenshot(null);
    setScreenshotPreview("");
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course not found
          </h2>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = getDisplayPrice();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Payment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You're purchasing:{" "}
            <span className="font-semibold text-lime-600 dark:text-lime-400">
              {course.title}
            </span>
          </p>
          {course.discountedPrice && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                {course.discountPercent}% OFF
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{course.price}
              </span>
              <span className="text-sm text-lime-600 font-semibold">
                You save ₹{course.price - course.discountedPrice}
              </span>
            </div>
          )}
        </div>

        {/* Payment Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paymentStep >= step
                      ? "bg-lime-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {paymentStep > step ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      paymentStep > step
                        ? "bg-lime-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Scan & Pay</span>
            <span>Upload Proof</span>
            <span>Confirmation</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Step 1: QR Code Payment */}
        {paymentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Step 1: Scan QR Code to Pay
              </h2>
            </div>

            <div className="p-6">
              {/* Course Summary with Discount */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {course.discountedPrice
                        ? "Discounted Price"
                        : "Course Price"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                        ₹{displayPrice}
                      </p>
                      {course.discountedPrice && (
                        <>
                          <p className="text-sm text-gray-400 line-through">
                            ₹{course.price}
                          </p>
                          <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                            {course.discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <CreditCardIcon className="h-12 w-12 text-lime-500" />
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QRCodeCanvas
                    value={getUpiLink()}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>

              {/* Payment Details */}
              <div className="mb-6 p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 text-lime-500 mr-1" />
                  Payment Details
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>
                    • <span className="font-medium">UPI ID:</span> {upiId}
                  </li>
                  <li>
                    • <span className="font-medium">Payee Name:</span>{" "}
                    {payeeName}
                  </li>
                  <li>
                    • <span className="font-medium">Amount:</span> ₹
                    {displayPrice}
                  </li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  📝 Instructions:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>
                    Open any UPI app on your phone (Google Pay, PhonePe, Paytm)
                  </li>
                  <li>Scan the QR code above or manually enter UPI ID</li>
                  <li>
                    Complete the payment of{" "}
                    <span className="font-bold">₹{displayPrice}</span>
                  </li>
                  <li>Take a screenshot of the successful payment</li>
                  <li>Click "I've Made the Payment" to proceed</li>
                </ol>
              </div>

              <button
                onClick={() => setPaymentStep(2)}
                className="w-full btn-primary"
              >
                I've Made the Payment
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Having trouble? Contact support at support@lmsplatform.com
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Upload Screenshot */}
        {paymentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Step 2: Upload Payment Proof
              </h2>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6">
              {/* Payment Summary with Discount */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Amount Paid
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                    ₹{displayPrice}
                  </p>
                  {course.discountedPrice && (
                    <p className="text-sm text-gray-400 line-through">
                      ₹{course.price}
                    </p>
                  )}
                </div>
                {course.discountedPrice && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    You saved ₹{course.price - course.discountedPrice}!
                  </p>
                )}
              </div>

              {/* Screenshot Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Screenshot *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative">
                  {screenshotPreview ? (
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview("");
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ⚠️ Important:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>
                    Make sure the screenshot clearly shows the transaction
                    ID/UTR number
                  </li>
                  <li>Amount should be visible: ₹{displayPrice}</li>
                  <li>Your payment will be verified within 24 hours</li>
                  <li>You'll get access immediately after admin approval</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setPaymentStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin inline mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {paymentStep === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Payment Submitted Successfully!
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your payment. Your transaction has been submitted
              for verification. You will receive access to the course within 24
              hours once the admin approves your payment.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens next?
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>Admin will verify your payment screenshot</li>
                <li>You'll receive an email confirmation</li>
                <li>Course will be added to your dashboard</li>
                <li>You can track status in Payment History</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link to="/dashboard" className="flex-1 btn-primary">
                Go to Dashboard
              </Link>
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
