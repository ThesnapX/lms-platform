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
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
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
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container-custom py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Info */}
            <div className="lg:w-1/2 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-lime-600">
                {course.categories?.map((cat, i) => (
                  <span key={i} className="bg-lime-100 px-2 py-1 rounded">
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.shortDescription}</p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= Math.round(course.averageRating) ? (
                      <StarIconSolid
                        key={star}
                        className="h-5 w-5 text-yellow-400"
                      />
                    ) : (
                      <StarIcon key={star} className="h-5 w-5 text-gray-300" />
                    ),
                  )}
                  <span className="ml-2 text-sm">
                    ({course.totalRatings} ratings)
                  </span>
                </div>
                <span className="text-gray-500">by {course.instructor}</span>
              </div>

              <div className="flex items-center space-x-6 py-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-lime-600" />
                  <span>{course.totalHours} hours</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-lime-600" />
                  <span>{course.forWhom}</span>
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-lime-600" />
                  <span>Self-paced</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <div>
                  <span className="text-3xl font-bold">₹{displayPrice}</span>
                  {originalPrice && (
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      ₹{originalPrice}
                    </span>
                  )}
                  {course.discountPercent > 0 && (
                    <span className="ml-2 bg-red-500 text-white px-2 py-1 text-sm rounded">
                      {course.discountPercent}% OFF
                    </span>
                  )}
                </div>
                <Link
                  to={isAuthenticated ? `/payment/${course._id}` : "/login"}
                  className="btn-primary px-8 py-3"
                >
                  {isAuthenticated ? "Buy Now" : "Login to Buy"}
                </Link>
                <button
                  onClick={() => {
                    document
                      .getElementById("curriculum")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-outline px-8 py-3"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Column - Preview Video */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
              <p>{course.prerequisite}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">For Whom</h3>
              <p>{course.forWhom}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Total Hours</h3>
              <p>{course.totalHours} hours of video content</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Long Description</h3>
              <p className="whitespace-pre-line">{course.longDescription}</p>
            </div>
          </div>

          {/* Right Column - Curriculum */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">
                Curriculum for {course.tag || course.categories?.[0]}
              </h2>

              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        {expandedChapters.includes(chapter._id) ? (
                          <ChevronDownIcon className="h-5 w-5 mr-2" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 mr-2" />
                        )}
                        <span className="font-medium">
                          Chapter {chapter.order + 1}: {chapter.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {chapter.topics?.length || 0} topics
                      </span>
                    </button>

                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-4 space-y-4">
                        {chapter.description && (
                          <p className="text-gray-600">{chapter.description}</p>
                        )}

                        <div className="space-y-2">
                          <h4 className="font-medium">Topics</h4>
                          <ul className="list-disc list-inside space-y-1 pl-4">
                            {chapter.topics?.map((topic) => (
                              <li key={topic._id} className="text-gray-700">
                                {topic.title}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {chapter.resources?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Resources</h4>
                            <ul className="space-y-1">
                              {chapter.resources.map((res, i) => (
                                <li key={i}>
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener"
                                    className="text-lime-600 hover:underline"
                                  >
                                    {res.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {chapter.subChapters?.length > 0 && (
                          <div className="space-y-3 pl-4">
                            <h4 className="font-medium">Sub-chapters</h4>
                            {chapter.subChapters.map((sub) => (
                              <div key={sub._id} className="border-l-2 pl-4">
                                <h5 className="font-medium">{sub.title}</h5>
                                {sub.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {sub.description}
                                  </p>
                                )}
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  {sub.topics?.map((topic) => (
                                    <li key={topic._id}>{topic.title}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
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
