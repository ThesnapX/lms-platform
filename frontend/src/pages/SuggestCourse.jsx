import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";

const SuggestCourse = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data) => {
    setSubmitError("");

    try {
      console.log("📤 Submitting course suggestion:", data);
      const response = await axios.post("/suggestions", data);

      console.log("✅ Suggestion submitted:", response.data);
      setIsSubmitted(true);
      reset();

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("❌ Error submitting suggestion:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to submit suggestion. Please try again.",
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Suggest a Course
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Please log in to suggest a new course
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-lime-600 dark:text-lime-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                Thank You for Your Suggestion!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our team will review your course suggestion. You'll be
                redirected to home page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Suggest a Course
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Have an idea for a course? Share it with us and help shape our
              curriculum!
            </p>
          </div>

          {submitError && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {submitError}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Course Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Course Title *
                </label>
                <input
                  {...register("title", {
                    required: "Course title is required",
                  })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Advanced React Development"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Course Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Course Description *
                </label>
                <textarea
                  {...register("description", {
                    required: "Course description is required",
                  })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Describe what this course should cover in detail..."
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Please select a category",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="AI & Machine Learning">
                    AI & Machine Learning
                  </option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <label
                  htmlFor="targetAudience"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Target Audience *
                </label>
                <input
                  {...register("targetAudience", {
                    required: "Please specify the target audience",
                  })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Beginners, Intermediate developers, Professionals"
                />
                {errors.targetAudience && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.targetAudience.message}
                  </p>
                )}
              </div>

              {/* Tech Stack / Software (Optional) */}
              <div>
                <label
                  htmlFor="techStack"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tech Stack / Software
                  <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                </label>
                <input
                  {...register("techStack")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., React, Python, JavaScript, Adobe Photoshop, Figma"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  What programming languages, frameworks, or software should be
                  covered?
                </p>
              </div>

              {/* Preferred Instructor (Optional) */}
              <div>
                <label
                  htmlFor="preferredInstructor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Preferred Instructor
                  <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                </label>
                <input
                  {...register("preferredInstructor")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., YouTube creator name, Udemy instructor"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Is there a specific creator you'd like to see teach this
                  course?
                </p>
              </div>

              {/* Why This Course */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Why should we create this course? *
                </label>
                <textarea
                  {...register("reason", {
                    required: "Please explain why this course is needed",
                  })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Why is this course important? What problems does it solve? How will it benefit learners?"
                ></textarea>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button type="submit" className="w-full btn-primary">
                  Submit Course Suggestion
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Our team reviews all course suggestions. We'll reach out if we
                need more information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestCourse;
