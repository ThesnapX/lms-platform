import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import {
  MagnifyingGlassIcon,
  StarIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Extract all unique categories from courses
  useEffect(() => {
    if (courses.length > 0) {
      const categories = new Set();
      courses.forEach((course) => {
        course.categories?.forEach((cat) => categories.add(cat));
      });
      setAllCategories(Array.from(categories).sort());
    }
  }, [courses]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let filtered = [...courses];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.shortDescription?.toLowerCase().includes(term) ||
          c.tag?.toLowerCase().includes(term) ||
          c.instructor?.toLowerCase().includes(term) ||
          c.categories?.some((cat) => cat.toLowerCase().includes(term)),
      );
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) =>
        course.categories?.some((cat) => selectedCategories.includes(cat)),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            (a.discountedPrice || a.price) - (b.discountedPrice || b.price),
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (b.discountedPrice || b.price) - (a.discountedPrice || a.price),
        );
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategories, sortBy, courses]);

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

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSortBy("default");
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

        {/* Search and Filter Bar - Full Width */}
        <div className="mb-8 space-y-4">
          {/* Search - Full Width */}
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition text-lg"
              placeholder="Search by course name, instructor, tag, category..."
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Sort Dropdown */}
            <div className="relative w-full md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>
                Filters{" "}
                {selectedCategories.length > 0 &&
                  `(${selectedCategories.length})`}
              </span>
            </button>

            {/* Clear Filters Button */}
            {(searchTerm ||
              selectedCategories.length > 0 ||
              sortBy !== "default") && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-6 py-3 text-red-600 hover:text-red-700 transition"
              >
                <XMarkIcon className="h-5 w-5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Categories Filter - Expandable */}
          {showFilters && (
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 mt-4">
              <h3 className="font-semibold text-lg mb-4">Filter by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-5 h-5 text-lime-600 rounded border-gray-300 focus:ring-lime-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCourses.length}{" "}
          {filteredCourses.length === 1 ? "course" : "courses"}
        </div>

        {/* Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No courses found
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-lime-600 hover:text-lime-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white relative dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-100 dark:border-gray-700"
              >
                {course.discountPercent > 0 && (
                  <span className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full absolute top-3 right-3 z-10 font-semibold">
                    {course.discountPercent}% OFF
                  </span>
                )}

                {/* Thumbnail */}
                <Link
                  to={`/courses/${course._id}/preview`}
                  className="block aspect-video overflow-hidden"
                >
                  <img
                    src={course.thumbnail?.url || "/placeholder.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Categories/Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {course.categories?.slice(0, 2).map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-3 py-1.5 rounded-full font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                    {course.tag && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium">
                        #{course.tag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link to={`/courses/${course._id}/preview`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-lime-500 duration-150 line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  {/* Short Description - Optional, uncomment if needed */}
                  {/* <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {course.shortDescription}
                  </p> */}

                  {/* Instructor */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    By{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {course.instructor}
                    </span>
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= Math.round(course.averageRating) ? (
                          <StarIconSolid
                            key={star}
                            className="h-4 w-4 text-yellow-400"
                          />
                        ) : (
                          <StarIcon
                            key={star}
                            className="h-4 w-4 text-gray-300 dark:text-gray-600"
                          />
                        ),
                      )}
                    </div>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({course.totalRatings})
                    </span>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      {course.discountedPrice ? (
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-lime-500">
                            ₹{course.discountedPrice}
                          </span>
                          <span className="text-sm line-through mb-1 text-gray-400">
                            ₹{course.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-lime-600">
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
