import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../utils/axios";
import AddCourseModal from "../../components/course/AddCourseModal";
import EditCourseModal from "../../components/course/EditCourseModal";
import SuggestionDetailModal from "../../components/admin/SuggestionDetailModal";
import {
  AcademicCapIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  LightBulbIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showSuggestionDetail, setShowSuggestionDetail] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes, coursesRes, suggestionsRes] =
        await Promise.all([
          axios.get("/admin/stats"),
          axios.get("/admin/users"),
          axios.get("/payments"),
          axios.get("/courses"),
          axios.get("/suggestions"),
        ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setPayments(paymentsRes.data.payments);
      setCourses(coursesRes.data.courses);
      setSuggestions(suggestionsRes.data.suggestions);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await axios.put(`/payments/${paymentId}/approve`);
      alert("Payment approved successfully!");
      fetchAdminData();
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt("Enter reason for rejection:");
    if (reason) {
      try {
        await axios.put(`/payments/${paymentId}/reject`, { remarks: reason });
        alert("Payment rejected successfully!");
        fetchAdminData();
      } catch (error) {
        console.error("Error rejecting payment:", error);
        alert("Failed to reject payment");
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      try {
        await axios.put(`/admin/users/${userId}/role`, { role: newRole });
        alert("User role updated successfully!");
        fetchAdminData();
      } catch (error) {
        console.error("Error updating user role:", error);
        alert("Failed to update user role");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        console.log("Attempting to delete user:", userId);

        // Make sure we're using the correct endpoint
        const response = await axios.delete(`/admin/users/${userId}`);

        console.log("Delete response:", response.data);
        alert("User deleted successfully!");

        // Refresh the user list
        fetchAdminData();
      } catch (error) {
        console.error("Error deleting user:", error);
        console.error("Error response:", error.response?.data);

        // Show a more specific error message
        const errorMessage =
          error.response?.data?.message || "Failed to delete user";
        alert(errorMessage);
      }
    }
  };
  const handleDeleteCourse = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`/courses/${courseId}`);
        alert("Course deleted successfully!");
        fetchAdminData();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course");
      }
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditCourse(true);
  };

  const handleCourseAdded = (newCourse) => {
    setCourses((prev) => [...prev, newCourse]);
    setShowAddCourse(false);
  };

  const handleCourseUpdated = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((c) => (c._id === updatedCourse._id ? updatedCourse : c)),
    );
    setShowEditCourse(false);
    setSelectedCourse(null);
  };

  const handleSuggestionStatusChange = async (suggestionId, newStatus) => {
    try {
      await axios.put(`/suggestions/${suggestionId}`, { status: newStatus });
      fetchAdminData();
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      alert("Failed to update suggestion status");
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (window.confirm("Are you sure you want to delete this suggestion?")) {
      try {
        await axios.delete(`/suggestions/${suggestionId}`);
        alert("Suggestion deleted successfully!");
        fetchAdminData();
      } catch (error) {
        console.error("Error deleting suggestion:", error);
        alert("Failed to delete suggestion");
      }
    }
  };

  const handleViewSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowSuggestionDetail(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! Manage your LMS platform here.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "users"
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "courses"
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "payments"
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "suggestions"
                  ? "border-lime-500 text-lime-600 dark:text-lime-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalCourses || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400">
                  Total Courses
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                    <CurrencyRupeeIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.monthlyRevenue || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400">
                  Total Users
                </h3>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-lime-100 dark:bg-lime-900/30 p-3 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.pendingPayments || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400">
                  Pending Payments
                </h3>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                Recent Users
              </h2>
              <div className="space-y-4">
                {stats.recentUsers?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : user.role === "editor"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Manage Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateUserRole(user._id, e.target.value)
                          }
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="visitor">Visitor</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.purchasedCourses?.length || 0} courses
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowAddCourse(true)}
                className="flex items-center space-x-2 btn-primary"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add New Course</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Manage Courses
                </h2>
              </div>

              {courses.length === 0 ? (
                <div className="p-12 text-center">
                  <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No courses yet. Click "Add New Course" to create one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {courses.map((course) => (
                    <div
                      key={course._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={
                          course.thumbnail?.url ||
                          "https://via.placeholder.com/640x360"
                        }
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {course.discountedPrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-lime-600 dark:text-lime-400">
                                  ₹{course.discountedPrice}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{course.price}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                                  {course.discountPercent}% OFF
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-lime-600 dark:text-lime-400">
                                ₹{course.price}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Course"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Course"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Payment Approvals
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <CurrencyRupeeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No payments to display.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Screenshot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.user?.email || "No email"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {payment.course?.title || "Unknown Course"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{payment.amount}
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          {payment.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleApprovePayment(payment._id)
                                }
                                className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Approve Payment"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment._id)}
                                className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Reject Payment"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === "suggestions" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Course Suggestions
              </h2>
              <span className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-3 py-1 rounded-full text-sm font-semibold">
                {suggestions.filter((s) => s.status === "pending").length}{" "}
                Pending
              </span>
            </div>

            {suggestions.length === 0 ? (
              <div className="p-12 text-center">
                <LightBulbIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No course suggestions yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Target Audience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {suggestions.map((suggestion) => (
                      <tr
                        onClick={() => handleViewSuggestion(suggestion)}
                        key={suggestion._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {suggestion.userName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {suggestion.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {suggestion.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {suggestion.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {suggestion.targetAudience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={suggestion.status}
                            onChange={(e) =>
                              handleSuggestionStatusChange(
                                suggestion._id,
                                e.target.value,
                              )
                            }
                            className={`text-xs px-2 py-1 rounded-full border-0 font-semibold ${
                              suggestion.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : suggestion.status === "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : suggestion.status === "reviewed"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewSuggestion(suggestion)}
                              className="text-blue-600 hover:text-lime-400 dark:text-blue-400 duration-150"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSuggestion(suggestion._id)
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                              title="Delete Suggestion"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Course Modal */}
        <AddCourseModal
          isOpen={showAddCourse}
          onClose={() => setShowAddCourse(false)}
          onCourseAdded={handleCourseAdded}
        />

        {/* Edit Course Modal */}
        <EditCourseModal
          isOpen={showEditCourse}
          onClose={() => {
            setShowEditCourse(false);
            setSelectedCourse(null);
          }}
          onCourseUpdated={handleCourseUpdated}
          course={selectedCourse}
        />

        {/* Suggestion Detail Modal */}
        <SuggestionDetailModal
          isOpen={showSuggestionDetail}
          onClose={() => {
            setShowSuggestionDetail(false);
            setSelectedSuggestion(null);
          }}
          suggestion={selectedSuggestion}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
