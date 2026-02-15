import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add this for manual refresh

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]); // Add refreshKey to dependencies

  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log("📚 Fetching courses...");
      // Add a cache-busting timestamp
      const response = await axios.get(`/courses?t=${Date.now()}`);
      console.log("✅ Raw API Response:", response.data);

      if (response.data.courses) {
        console.log(
          "📊 Courses data:",
          response.data.courses.map((c) => ({
            id: c._id,
            title: c.title,
            instructor: c.instructor,
            instructorType: typeof c.instructor,
            instructorExists: !!c.instructor,
          })),
        );

        setCourses(response.data.courses);
        setFilteredCourses(response.data.courses);
      }
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        {/* Header with Refresh Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Browse Courses
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover our comprehensive collection of courses designed to
              advance your career
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors"
          >
            Refresh Courses
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No courses found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={
                      course.thumbnail?.url ||
                      "https://via.placeholder.com/640x360"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      {course.discountedPrice ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                            ₹{course.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{course.price}
                          </span>
                          <span className="text-xs absolute -top-8 -right-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                            {course.discountPercent}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                          ₹{course.price}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-primary text-sm px-5 py-2.5"
                    >
                      View Course
                    </Link>
                  </div>

                  {/* Instructor - Debug version */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <span>
                        By{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {course.instructor}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
