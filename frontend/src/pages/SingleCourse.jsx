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
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

// ========== YOUTUBE PLAYER HELPER FUNCTION ==========
// This function generates a YouTube embed URL with customizable features
// You can easily enable/disable any YouTube feature by changing the parameters
const getYouTubeEmbedUrl = (videoId, options = {}) => {
  // Default settings - only essential controls enabled
  const defaultOptions = {
    // Core controls (keep these - essential for user experience)
    controls: 1, // Show player controls (play, volume, etc.)
    disablekb: 0, // Enable keyboard controls
    fs: 1, // Enable fullscreen button
    playsinline: 1, // Play inline on mobile

    // Features to hide (remove YouTube branding)
    modestbranding: 1, // Hide YouTube logo
    rel: 0, // No related videos at the end
    showinfo: 0, // Hide video title and uploader
    iv_load_policy: 3, // Hide annotations

    // Additional controls
    cc_load_policy: 0, // Don't auto-load captions
    color: "white", // Controls color (red or white)
    autoplay: 0, // Don't autoplay

    // Privacy enhanced
    enablejsapi: 0, // Disable JS API if not needed

    ...options, // Override any defaults by passing options
  };

  // Build query string from options
  const queryString = Object.entries(defaultOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Use youtube-nocookie.com for privacy (no tracking cookies)
  return `https://www.youtube-nocookie.com/embed/${videoId}?${queryString}`;
};

// ========== YOUTUBE PLAYER COMPONENT ==========
// This component wraps the iframe with all our custom settings
const YouTubePlayer = ({ videoId, title }) => {
  // You can easily customize what to show/hide by modifying this config
  const playerConfig = {
    // Set these to 1 to show, 0 to hide
    showControls: 1, // Show play/volume/fullscreen
    showRelated: 0, // Hide related videos at end
    showTitle: 0, // Hide video title
    showLogo: 0, // Hide YouTube logo
    showAnnotations: 0, // Hide annotations
    enableKeyboard: 1, // Enable keyboard controls
    enableFullscreen: 1, // Enable fullscreen button
    enableCaptions: 0, // Don't auto-load captions
    colorTheme: "white", // "red" or "white"
  };

  const embedUrl = getYouTubeEmbedUrl(videoId, {
    controls: playerConfig.showControls,
    rel: playerConfig.showRelated,
    showinfo: playerConfig.showTitle,
    modestbranding: playerConfig.showLogo ? 0 : 1,
    iv_load_policy: playerConfig.showAnnotations ? 1 : 3,
    disablekb: playerConfig.enableKeyboard ? 0 : 1,
    fs: playerConfig.enableFullscreen ? 1 : 0,
    cc_load_policy: playerConfig.enableCaptions ? 1 : 0,
    color: playerConfig.colorTheme,
  });

  return (
    <iframe
      src={embedUrl}
      title={title}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
    ></iframe>
  );
};

// ========== MAIN COMPONENT ==========
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
  const [redirectChecked, setRedirectChecked] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkAccessAndRedirect();
    }
  }, [id, authLoading]);

  const checkAccessAndRedirect = async () => {
    try {
      console.log("Checking access for course:", id);

      const response = await axios.get(`/courses/${id}`);
      console.log("Access check response:", response.data);

      // If user doesn't have access, redirect to preview
      if (!response.data.hasAccess) {
        console.log("No access - redirecting to preview");
        navigate(`/courses/${id}/preview`, { replace: true });
        return;
      }

      // User has access - load the course
      console.log("Has access - loading course");
      setHasAccess(true);
      setCourse(response.data.course);
      setUserProgress(response.data.userProgress);
      setRedirectChecked(true);

      // Set up the course UI
      if (response.data.course?.chapters?.[0]) {
        setExpandedChapters([response.data.course.chapters[0]._id]);
      }

      // Set current topic (resume from last watched or first topic)
      if (response.data.userProgress?.lastWatchedTopic) {
        const lastTopic = findTopicById(
          response.data.userProgress.lastWatchedTopic,
          response.data.course,
        );
        if (lastTopic) {
          setCurrentTopic(lastTopic);
        } else if (response.data.course.chapters[0]?.topics[0]) {
          setCurrentTopic(response.data.course.chapters[0].topics[0]);
        }
      } else if (response.data.course.chapters[0]?.topics[0]) {
        setCurrentTopic(response.data.course.chapters[0].topics[0]);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/courses", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const findTopicById = (topicId, courseData) => {
    if (!courseData) return null;
    for (let chapter of courseData.chapters) {
      const topic = chapter.topics.find((t) => t._id === topicId);
      if (topic) return topic;

      if (chapter.subChapters) {
        for (let sub of chapter.subChapters) {
          const subTopic = sub.topics.find((t) => t._id === topicId);
          if (subTopic) return subTopic;
        }
      }
    }
    return null;
  };

  const handleTopicSelect = (topic) => {
    setCurrentTopic(topic);
    if (isAuthenticated && hasAccess) {
      saveLastWatched(topic._id);
    }
  };

  const saveLastWatched = async (topicId) => {
    try {
      await axios.post(`/courses/${course._id}/progress/last-watched`, {
        topicId,
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleMarkComplete = async () => {
    if (!isAuthenticated || !hasAccess) return;

    try {
      await axios.put(
        `/courses/${course._id}/topics/${currentTopic._id}/complete`,
      );

      setUserProgress((prev) => {
        const completedTopics = prev?.completedTopics || [];
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
    if (!isAuthenticated || !hasAccess || !comment.trim()) return;

    try {
      const response = await axios.post(
        `/courses/${course._id}/topics/${currentTopic._id}/comments`,
        { message: comment },
      );

      setCourse((prevCourse) => {
        const updatedCourse = { ...prevCourse };
        for (let chapter of updatedCourse.chapters) {
          for (let topic of chapter.topics) {
            if (topic._id === currentTopic._id) {
              if (!topic.comments) topic.comments = [];
              topic.comments.push(response.data.comment);
              break;
            }
          }
          if (chapter.subChapters) {
            for (let sub of chapter.subChapters) {
              for (let topic of sub.topics) {
                if (topic._id === currentTopic._id) {
                  if (!topic.comments) topic.comments = [];
                  topic.comments.push(response.data.comment);
                  break;
                }
              }
            }
          }
        }
        return updatedCourse;
      });

      setCurrentTopic((prev) => {
        const updated = { ...prev };
        if (!updated.comments) updated.comments = [];
        updated.comments.push(response.data.comment);
        return updated;
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

  const getCurrentTopicComments = () => {
    if (!currentTopic || !course) return [];
    for (let chapter of course.chapters) {
      for (let topic of chapter.topics) {
        if (topic._id === currentTopic._id) {
          return topic.comments || [];
        }
      }
      if (chapter.subChapters) {
        for (let sub of chapter.subChapters) {
          for (let topic of sub.topics) {
            if (topic._id === currentTopic._id) {
              return topic.comments || [];
            }
          }
        }
      }
    }
    return [];
  };

  const isTopicCompleted = (topicId) => {
    return userProgress?.completedTopics?.includes(topicId) || false;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!hasAccess || !course) {
    return null; // Will be redirected
  }

  const currentTopicComments = getCurrentTopicComments();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Video Player */}
          <div className="lg:w-2/3">
            {currentTopic ? (
              <>
                {/* Video Player - Using our custom YouTubePlayer component */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <YouTubePlayer
                    videoId={extractYouTubeId(currentTopic.youtubeLink)}
                    title={currentTopic.title}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentTopic.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {currentTopic.description}
                      </p>
                    </div>
                    <button
                      onClick={handleMarkComplete}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isTopicCompleted(currentTopic._id)
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default"
                          : "bg-lime-500 text-white hover:bg-lime-600"
                      }`}
                      disabled={isTopicCompleted(currentTopic._id)}
                    >
                      {isTopicCompleted(currentTopic._id) ? (
                        <>
                          <CheckCircleSolid className="h-5 w-5" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {currentTopic.resources?.length > 0 && (
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

                <div className="mt-8">
                  <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-4">
                    Comments ({currentTopicComments.length})
                  </h3>

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
                              {new Date(comment.createdAt).toLocaleDateString()}
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
              <div className="mb-6">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h2>

                {course.instructor && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    👨‍🏫 Instructor:{" "}
                    <span className="font-medium text-lime-600 dark:text-lime-400">
                      {course.instructor}
                    </span>
                  </p>
                )}

                {userProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Overall Progress</span>
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

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {course.chapters.map((chapter, chapterIndex) => (
                  <div
                    key={chapter._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedChapters.includes(chapter._id) ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Chapter {chapterIndex + 1}: {chapter.title}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {chapter.topics?.length || 0} topics
                      </span>
                    </button>

                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        {chapter.topics?.map((topic, topicIndex) => {
                          const isCompleted = isTopicCompleted(topic._id);
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
                                  {topicIndex + 1}. {topic.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {chapter.subChapters?.map((sub, subIndex) => (
                          <div key={sub._id} className="mt-2 ml-4">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              {sub.title}
                            </div>
                            {sub.topics?.map((topic, topicIndex) => {
                              const isCompleted = isTopicCompleted(topic._id);
                              const isActive = currentTopic?._id === topic._id;

                              return (
                                <button
                                  key={topic._id}
                                  onClick={() => handleTopicSelect(topic)}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-lime-100 dark:bg-lime-900/30"
                                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {isCompleted ? (
                                      <CheckCircleSolid className="h-4 w-4 text-lime-500" />
                                    ) : (
                                      <PlayIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                      {topic.title}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  ✅ You have access to this course
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCourse;
