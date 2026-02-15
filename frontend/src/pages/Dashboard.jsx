import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import {
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [searchParams] = useSearchParams();
  const showVerifyMessage = searchParams.get("verify") === "required";
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setShowVerificationBanner(!user.isEmailVerified);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (refreshUser) {
        await refreshUser();
      }

      const [coursesRes, paymentsRes] = await Promise.all([
        axios.get("/auth/me"),
        axios.get("/payments/my-payments"),
      ]);

      setPurchasedCourses(coursesRes.data.user.purchasedCourses || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseProgress = (courseId) => {
    if (!user?.courseProgress) return 0;
    const progress = user.courseProgress.find((p) => p.courseId === courseId);
    return progress?.progressPercentage || 0;
  };

  const getLastWatched = (courseId) => {
    if (!user?.courseProgress) return null;
    const progress = user.courseProgress.find((p) => p.courseId === courseId);
    return progress?.lastWatchedTopic;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        {/* Email Verification Banner */}
        {showVerificationBanner && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  {showVerifyMessage
                    ? "Email verification required to purchase courses"
                    : "Your email is not verified"}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Please check your inbox for the verification link.{" "}
                  <Link
                    to="/resend-verification"
                    className="font-medium underline hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    Resend verification email
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your learning progress and continue where you left off
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {purchasedCourses.length}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">
              Enrolled Courses
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.courseProgress?.filter(
                  (p) => p.progressPercentage === 100,
                ).length || 0}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">
              Completed Courses
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {payments.filter((p) => p.status === "pending").length}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">
              Pending Payments
            </h3>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
            My Courses
          </h2>

          {purchasedCourses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't purchased any courses. Start your learning journey
                today!
              </p>
              <Link to="/courses" className="btn-primary inline-block">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchasedCourses.map((course) => {
                if (!course || !course._id) return null;

                const progress = getCourseProgress(course._id);
                const lastWatched = getLastWatched(course._id);

                return (
                  <div
                    key={course._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-1/3">
                        <img
                          src={
                            course.thumbnail?.url ||
                            "https://via.placeholder.com/320x180"
                          }
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="w-2/3 p-4">
                        <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {course.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-lime-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Actions - FIXED: Link to actual course page, not preview */}
                        <div className="flex space-x-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="flex-1 btn-primary text-sm text-center"
                          >
                            {lastWatched ? "Continue" : "Start Course"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Payment History
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Screenshot
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.course?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ₹{payment.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : payment.status === "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.screenshot?.url ? (
                            <a
                              href={payment.screenshot.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 rounded-lg hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors"
                            >
                              <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">
                              No screenshot
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
