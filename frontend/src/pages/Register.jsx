import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { AcademicCapIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import PasswordInput from "../components/common/PasswordInput";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const password = watch("password", "");

  const onSubmit = async (data) => {
    setRegisterError("");
    setSuccessMessage("");
    setLoading(true);

    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    try {
      const result = await registerUser(userData);

      console.log("Registration result:", result);

      if (result.success) {
        setSuccessMessage("✅ Account created successfully!");

        // Check if token exists
        const token = localStorage.getItem("token");

        if (token) {
          // Token exists - try to redirect
          setSuccessMessage("✅ Account created! Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          // No token - show login prompt
          setShowLoginPrompt(true);
          setSuccessMessage(
            "✅ Account created! Please login with your credentials.",
          );
        }
      } else {
        setRegisterError(
          result.message || "Registration failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("An unexpected error occurred. Please try again.");
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-lime-600 hover:text-lime-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {showLoginPrompt && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-4 rounded relative text-center">
            <p className="font-medium mb-2">Your account has been created!</p>
            <p className="text-sm mb-3">
              Please login with your email and password to continue.
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Login Page
            </Link>
          </div>
        )}

        {registerError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {registerError}
          </div>
        )}

        {!successMessage && !showLoginPrompt && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <PasswordInput
                register={register}
                errors={errors}
                name="password"
                label="Password"
                placeholder="••••••••"
                disabled={loading}
                validation={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type="password"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div>
              <GoogleLoginButton buttonText="Sign Up with Google" />
            </div>
          </form>
        )}

        {showLoginPrompt && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive a verification email?{" "}
              <Link
                to="/resend-verification"
                className="text-lime-600 hover:text-lime-500 font-medium"
              >
                Resend
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
