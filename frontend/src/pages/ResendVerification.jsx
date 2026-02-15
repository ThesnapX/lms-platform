import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { AcademicCapIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const ResendVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post("/auth/resend-verification");
      setMessage(
        response.data.message || "Verification email sent! Check your inbox.",
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send verification email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <AcademicCapIcon className="h-12 w-12 text-lime-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {user?.email
              ? `Send verification link to ${user.email}`
              : "Get a new verification link"}
          </p>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <EnvelopeIcon className="h-12 w-12 mx-auto text-lime-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Click the button below to receive a new email verification link.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Verification Email"}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/dashboard"
              className="text-sm text-lime-600 hover:text-lime-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
