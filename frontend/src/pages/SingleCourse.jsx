import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import {
  PlayIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

const SingleCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [comment, setComment] = useState("");
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  // Wait for auth to load first
  useEffect(() => {
    if (!authLoading) {
      fetchCourse();
    }
  }, [id, authLoading]);

  useEffect(() => {
    if (course && hasAccess && userProgress?.lastWatchedTopic) {
      // Resume from last watched topic
      const lastTopic = findTopicById(userProgress.lastWatchedTopic);
      if (lastTopic) {
        setCurrentTopic(lastTopic);
      } else if (course.chapters[0]?.topics[0]) {
        setCurrentTopic(course.chapters[0].topics[0]);
      }
    } else if (course && hasAccess) {
      // User has access but no last watched - show first topic
      if (course.chapters[0]?.topics[0]) {
        setCurrentTopic(course.chapters[0].topics[0]);
      }
    } else if (course) {
      // Set first preview video as current for non-access users
      for (let chapter of course.chapters) {
        const previewTopic = chapter.topics.find((t) => t.isPreview);
        if (previewTopic) {
          setCurrentTopic(previewTopic);
          break;
        }
      }
    }
  }, [course, hasAccess, userProgress]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      console.log("Fetching course:", id);
      console.log(
        "Auth state - isAuthenticated:",
        isAuthenticated,
        "user:",
        user?._id,
      );
      console.log(
        "Token in localStorage:",
        localStorage.getItem("token") ? "Present" : "Missing",
      );

      // Make sure we're using the configured axios instance
      const response = await axios.get(`/courses/${id}`);
      console.log("Course response:", response.data);

      setCourse(response.data.course);
      setHasAccess(response.data.hasAccess);
      setUserProgress(response.data.userProgress);

      // Expand first chapter by default
      if (response.data.course?.chapters?.[0]) {
        setExpandedChapters([response.data.course.chapters[0]._id]);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      if (error.response?.status === 401) {
        console.log("Unauthorized - redirecting to login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const findTopicById = (topicId) => {
    if (!course) return null;
    for (let chapter of course.chapters) {
      const topic = chapter.topics.find((t) => t._id === topicId);
      if (topic) return topic;
    }
    return null;
  };

  const handleTopicSelect = (topic) => {
    setCurrentTopic(topic);
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleMarkComplete = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `/courses/${course._id}/topics/${currentTopic._id}/complete`,
      );

      // Update local progress
      setUserProgress((prev) => {
        if (!prev) {
          return {
            completedTopics: [currentTopic._id],
            lastWatchedTopic: currentTopic._id,
            progressPercentage: Math.round((1 / course.totalTopics) * 100),
          };
        }
        const completedTopics = prev.completedTopics || [];
        if (!completedTopics.includes(currentTopic._id)) {
          completedTopics.push(currentTopic._id);
        }
        return {
          ...prev,
          completedTopics,
          lastWatchedTopic: currentTopic._id,
          progressPercentage: Math.round(
            (completedTopics.length / course.totalTopics) * 100,
          ),
        };
      });
    } catch (error) {
      console.error("Error marking topic complete:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) return;

    try {
      const response = await axios.post(
        `/courses/${course._id}/topics/${currentTopic._id}/comments`,
        { message: comment },
      );

      console.log("Comment added:", response.data);

      // Update the course state with the new comment
      setCourse((prevCourse) => {
        const updatedCourse = { ...prevCourse };

        // Find the current topic in the course data
        for (let chapter of updatedCourse.chapters) {
          for (let topic of chapter.topics) {
            if (topic._id === currentTopic._id) {
              // Add the new comment to the topic's comments array
              if (!topic.comments) topic.comments = [];
              topic.comments.push(response.data.comment);
              break;
            }
          }
        }

        return updatedCourse;
      });

      // Also update currentTopic state
      setCurrentTopic((prev) => {
        const updatedTopic = { ...prev };
        if (!updatedTopic.comments) updatedTopic.comments = [];
        updatedTopic.comments.push(response.data.comment);
        return updatedTopic;
      });

      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePurchaseClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if email is verified
    if (!user?.isEmailVerified) {
      setShowVerificationWarning(true);
      return;
    }

    // Proceed to payment
    navigate(`/payment/${course._id}`);
  };

  // Get comments for current topic
  const getCurrentTopicComments = () => {
    if (!currentTopic || !course) return [];

    // Find the current topic in course data
    for (let chapter of course.chapters) {
      for (let topic of chapter.topics) {
        if (topic._id === currentTopic._id) {
          return topic.comments || [];
        }
      }
    }
    return [];
  };

  if (authLoading || loading) {
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
          <button onClick={() => navigate("/courses")} className="btn-primary">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const currentTopicComments = getCurrentTopicComments();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Email Verification Warning Modal */}
        {showVerificationWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  Email Verification Required
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please verify your email address before purchasing courses.
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Why?</strong> We need to verify your email to ensure
                  secure transactions and send you course updates.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Check your inbox for the verification link. Didn't receive it?
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/resend-verification")}
                  className="flex-1 bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 transition-colors"
                >
                  Resend Email
                </button>
                <button
                  onClick={() => setShowVerificationWarning(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Video Player */}
          <div className="lg:w-2/3">
            {currentTopic ? (
              <>
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(currentTopic.youtubeLink)}`}
                    title={currentTopic.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Topic Info */}
                <div className="mb-6">
                  <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentTopic.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {currentTopic.description}
                  </p>
                </div>

                {/* Mark as Complete Button - Only show if user has access */}
                {hasAccess && (
                  <div className="mb-6">
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center space-x-2 px-6 py-3 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Mark as Completed</span>
                    </button>
                  </div>
                )}

                {/* Resources - Only show if user has access or it's a preview */}
                {(hasAccess || currentTopic.isPreview) &&
                  currentTopic.resources?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">
                        Resources
                      </h3>
                      <div className="space-y-2">
                        {currentTopic.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <DocumentTextIcon className="h-5 w-5 text-lime-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {resource.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Comments Section - Only show if user has access */}
                {hasAccess && (
                  <div className="mt-8">
                    <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-4">
                      Comments ({currentTopicComments.length})
                    </h3>

                    {/* Add Comment Form */}
                    {isAuthenticated && (
                      <form onSubmit={handleAddComment} className="mb-6">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                          />
                          <button
                            type="submit"
                            className="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {currentTopicComments.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      ) : (
                        currentTopicComments.map((comment) => (
                          <div
                            key={comment._id}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <UserCircleIcon className="h-5 w-5 text-lime-500" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {comment.user?.name || "Anonymous"}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {comment.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Select a topic to start learning
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Course Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-20">
              {/* Course Info */}
              <div className="mb-6">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h2>

                {/* Instructor */}
                {course.instructor && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    👨‍🏫 Instructor:{" "}
                    <span className="font-medium text-lime-600 dark:text-lime-400">
                      {course.instructor}
                    </span>
                  </p>
                )}

                {hasAccess && userProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{userProgress.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-lime-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${userProgress.progressPercentage || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapters */}
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {/* Chapter Header */}
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {chapter.title}
                      </span>
                      {expandedChapters.includes(chapter._id) ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {/* Topics List */}
                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        {chapter.topics.map((topic) => {
                          const isCompleted =
                            userProgress?.completedTopics?.includes(topic._id);
                          const isActive = currentTopic?._id === topic._id;

                          return (
                            <button
                              key={topic._id}
                              onClick={() => handleTopicSelect(topic)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-lime-100 dark:bg-lime-900/30"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {isCompleted ? (
                                  <CheckCircleSolid className="h-5 w-5 text-lime-500" />
                                ) : (
                                  <PlayIcon className="h-5 w-5 text-gray-400" />
                                )}
                                <span
                                  className={`text-sm ${
                                    isActive
                                      ? "text-lime-700 dark:text-lime-400 font-semibold"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {topic.title}
                                </span>
                              </div>
                              {topic.isPreview && !hasAccess && (
                                <span className="text-xs px-2 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 rounded">
                                  Preview
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Purchase Button - Only show if user doesn't have access */}
              {!hasAccess && (
                <div className="mt-6">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full btn-primary"
                    >
                      Login to Purchase
                    </button>
                  ) : user?.isEmailVerified ? (
                    <button
                      onClick={handlePurchaseClick}
                      className="w-full btn-primary"
                    >
                      {course.discountedPrice ? (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Buy Course -</span>
                          <span className="text-lg">
                            ₹{course.discountedPrice}
                          </span>
                          <span className="text-sm line-through opacity-75">
                            ₹{course.price}
                          </span>
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {course.discountPercent}% OFF
                          </span>
                        </div>
                      ) : (
                        `Buy Course - ₹${course.price}`
                      )}
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => setShowVerificationWarning(true)}
                        className="w-full btn-primary opacity-75 cursor-not-allowed"
                        disabled
                      >
                        Verify Email to Purchase
                      </button>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-2">
                        ⚠️ Email verification required
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Get full access to all chapters and topics
                  </p>
                </div>
              )}

              {/* Already Purchased Message */}
              {hasAccess && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    ✅ You have access to this course
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCourse;
