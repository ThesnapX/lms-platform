import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import {
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const response = await axios.get(`/auth/verify-email/${token}`);
      setSuccess(true);

      // Store token and redirect after 3 seconds
      localStorage.setItem("token", response.data.token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Verification failed. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <AcademicCapIcon className="h-12 w-12 text-lime-500" />
          </div>
          <h2 className="mt-6 text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Email Verification
          </h2>
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
          </div>
        )}

        {success && !loading && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-8 rounded-lg">
            <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2">
              Email Verified Successfully!
            </h3>
            <p className="mb-4">
              Your email has been verified. You'll be redirected to dashboard in
              3 seconds...
            </p>
            <Link
              to="/dashboard"
              className="text-lime-600 hover:text-lime-500 font-medium"
            >
              Go to Dashboard Now
            </Link>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-8 rounded-lg">
            <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Verification Failed</h3>
            <p className="mb-4">{error}</p>
            <div className="space-y-2">
              <Link
                to="/resend-verification"
                className="block text-lime-600 hover:text-lime-500 font-medium"
              >
                Resend Verification Email
              </Link>
              <Link
                to="/"
                className="block text-gray-600 hover:text-gray-500 font-medium"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
