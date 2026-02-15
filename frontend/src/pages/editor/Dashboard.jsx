import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../utils/axios";
import AddCourseModal from "../../components/course/AddCourseModal";
import EditCourseModal from "../../components/course/EditCourseModal";
import {
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const EditorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log("📚 Editor fetching courses...");
      const response = await axios.get("/courses");
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
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
        fetchCourses();
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
            Editor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! Manage courses here.
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddCourse(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Course</span>
          </button>
        </div>

        {/* Courses Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Manage Courses
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Courses: {courses.length}
            </p>
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
      </div>
    </div>
  );
};

export default EditorDashboard;
