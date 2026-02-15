import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  StarIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const CoursePreview = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/courses/${id}`);
      setCourse(response.data.course);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
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
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Course not found
          </h2>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = course.discountedPrice || course.price;
  const originalPrice = course.discountedPrice ? course.price : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-custom py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Info */}
            <div className="lg:w-1/2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {course.categories?.map((cat, i) => (
                  <span
                    key={i}
                    className="text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-3 py-1 rounded-full font-medium"
                  >
                    {cat}
                  </span>
                ))}
                {course.tag && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                    #{course.tag}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= Math.round(course.averageRating) ? (
                      <StarIconSolid
                        key={star}
                        className="h-5 w-5 text-yellow-400"
                      />
                    ) : (
                      <StarIcon
                        key={star}
                        className="h-5 w-5 text-gray-300 dark:text-gray-600"
                      />
                    ),
                  )}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({course.totalRatings} ratings)
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">•</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  by {course.instructor}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <ClockIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                  <span>{course.totalHours} hours</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                  <span>{course.forWhom}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                  <span>Self-paced</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-lime-600 dark:text-lime-400">
                    ₹{displayPrice}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                        ₹{originalPrice}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 text-sm rounded-full font-medium">
                        {course.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link
                    to={isAuthenticated ? `/payment/${course._id}` : "/login"}
                    className="btn-primary px-8 py-3 text-base"
                  >
                    {isAuthenticated ? "Buy Now" : "Login to Buy"}
                  </Link>
                  <button
                    onClick={() => {
                      document
                        .getElementById("curriculum")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn-outline px-8 py-3 text-base"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preview Video */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(course.previewVideoLink)}`}
                  title="Preview"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div id="curriculum" className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                Prerequisites
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {course.prerequisite}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                For Whom
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {course.forWhom}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                Total Hours
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {course.totalHours} hours of video content
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-lime-600 dark:text-lime-400" />
                Long Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {course.longDescription}
              </p>
            </div>
          </div>

          {/* Right Column - Curriculum */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Curriculum for{" "}
                {course.tag || course.categories?.[0] || "This Course"}
              </h2>

              <div className="space-y-4">
                {course.chapters.map((chapter, index) => (
                  <div
                    key={chapter._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800/50"
                  >
                    {/* Chapter Header */}
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedChapters.includes(chapter._id) ? (
                          <ChevronDownIcon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                        )}
                        <div className="text-left">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Chapter {index + 1}: {chapter.title}
                          </span>
                          {!expandedChapters.includes(chapter._id) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-3 py-1 rounded-full font-medium">
                        {chapter.topics?.length || 0} topics
                        {chapter.subChapters?.length > 0 &&
                          ` • ${chapter.subChapters.length} sub-chapters`}
                      </span>
                    </button>

                    {/* Chapter Content */}
                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-5 space-y-5 border-t border-gray-200 dark:border-gray-700">
                        {chapter.description && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {chapter.description}
                          </p>
                        )}

                        {/* Topics */}
                        {chapter.topics?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-1 h-5 bg-lime-500 rounded-full mr-2"></span>
                              Topics
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {chapter.topics.map((topic) => (
                                <li
                                  key={topic._id}
                                  className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg"
                                >
                                  <span className="w-1.5 h-1.5 bg-lime-500 rounded-full mr-2"></span>
                                  {topic.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {chapter.resources?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-1 h-5 bg-lime-500 rounded-full mr-2"></span>
                              Resources
                            </h4>
                            <ul className="space-y-2">
                              {chapter.resources.map((res, i) => (
                                <li key={i}>
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-lime-600 dark:text-lime-400 hover:underline bg-lime-50 dark:bg-lime-900/20 px-3 py-2 rounded-lg"
                                  >
                                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                                    {res.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Sub-chapters */}
                        {chapter.subChapters?.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <span className="w-1 h-5 bg-lime-500 rounded-full mr-2"></span>
                              Sub-chapters
                            </h4>
                            <div className="space-y-4 pl-4">
                              {chapter.subChapters.map((sub) => (
                                <div
                                  key={sub._id}
                                  className="border-l-4 border-lime-500 dark:border-lime-400 pl-4 space-y-3"
                                >
                                  <h5 className="font-semibold text-gray-900 dark:text-white">
                                    {sub.title}
                                  </h5>
                                  {sub.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {sub.description}
                                    </p>
                                  )}
                                  {sub.topics?.length > 0 && (
                                    <ul className="space-y-1">
                                      {sub.topics.map((topic) => (
                                        <li
                                          key={topic._id}
                                          className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                                        >
                                          <span className="w-1 h-1 bg-lime-500 rounded-full mr-2"></span>
                                          {topic.title}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const extractYouTubeId = (url) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default CoursePreview;
