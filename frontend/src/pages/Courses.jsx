import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { MagnifyingGlassIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tag?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/courses");
      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Browse Courses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find the perfect course for your learning journey
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              placeholder="Search courses..."
            />
          </div>
        </div>

        {/* Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Thumbnail */}
                <Link
                  to={`/courses/${course._id}/preview`}
                  className="block aspect-video overflow-hidden"
                >
                  <img
                    src={course.thumbnail?.url || "/placeholder.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </Link>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    {course.categories?.slice(0, 2).map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                    {course.tag && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {course.tag}
                      </span>
                    )}
                  </div>

                  <Link to={`/courses/${course._id}/preview`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-lime-600">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm text-gray-500 mb-3">
                    By {course.instructor}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= Math.round(course.averageRating) ? (
                        <StarIconSolid
                          key={star}
                          className="h-4 w-4 text-yellow-400"
                        />
                      ) : (
                        <StarIcon
                          key={star}
                          className="h-4 w-4 text-gray-300"
                        />
                      ),
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      ({course.totalRatings})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      {course.discountedPrice ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-lime-600">
                            ₹{course.discountedPrice}
                          </span>
                          <span className="text-sm line-through text-gray-400">
                            ₹{course.price}
                          </span>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            {course.discountPercent}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-lime-600">
                          ₹{course.price}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course._id}/preview`}
                      className="btn-primary text-sm px-5 py-2.5"
                    >
                      View Course
                    </Link>
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
