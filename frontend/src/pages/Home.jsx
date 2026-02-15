import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  BookOpenIcon,
  BriefcaseIcon,
  TrophyIcon,
  ComputerDesktopIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch real courses from database
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await axios.get("/courses");
        // Get first 3 courses for featured section
        setFeaturedCourses(response.data.courses.slice(0, 3));
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Categories data with Heroicons (realistic counts for a new platform)
  const categories = [
    {
      name: "Web Development",
      count: 8,
      icon: CodeBracketIcon,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      name: "Data Science",
      count: 5,
      icon: ChartBarIcon,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      name: "Mobile Development",
      count: 4,
      icon: ComputerDesktopIcon,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      name: "Design",
      count: 6,
      icon: PaintBrushIcon,
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      name: "Business",
      count: 3,
      icon: BuildingOfficeIcon,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      name: "Marketing",
      count: 2,
      icon: MegaphoneIcon,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "What is LMS.io?",
      answer:
        "LMS.io is a learning management platform that offers high-quality courses taught by industry experts. We provide lifetime access to course materials, progress tracking, and a supportive learning community.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started is easy! Simply create a free account, browse our course catalog, and enroll in any course that interests you. You can start learning immediately after enrollment.",
    },
    {
      question: "Are the courses self-paced?",
      answer:
        "Yes! All courses on LMS.io are self-paced. You can learn at your own speed and revisit the material as many times as you need. There are no deadlines or schedules to follow.",
    },
    {
      question: "Do I get a certificate after completion?",
      answer:
        "Yes, upon completing a course, you'll receive a certificate of completion that you can share on your LinkedIn profile or resume.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept UPI payments, credit/debit cards, and net banking. For UPI payments, you can scan the QR code and upload the payment screenshot for verification.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "We offer a 7-day money-back guarantee. If you're not satisfied with a course, contact our support team within 7 days of purchase for a full refund.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-200 dark:bg-lime-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-lime-100 dark:bg-lime-900/30 rounded-full">
                <SparklesIcon className="h-5 w-5 text-lime-600 dark:text-lime-400 mr-2" />
                <span className="text-sm font-medium text-lime-700 dark:text-lime-300">
                  New courses added weekly
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                Master New Skills with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                  Expert-Led
                </span>{" "}
                Courses
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Start your learning journey today with our growing collection of
                high-quality courses. Learn at your own pace with lifetime
                access to all course materials.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-lime-500 text-white font-semibold rounded-xl overflow-hidden transition-all hover:bg-lime-600 hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">Browse Courses</span>
                  <ChevronRightIcon className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>

                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 border-2 border-lime-500 text-lime-600 dark:text-lime-400 font-semibold rounded-xl overflow-hidden transition-all hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:scale-105"
                >
                  <AcademicCapIcon className="mr-2 h-5 w-5" />
                  Sign Up Free
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`https://images.unsplash.com/photo-${i === 1 ? "1494790108777-38580c3549b1" : i === 2 ? "1507003211169-0a1dd7228f2d" : "1438761681033-6461ffad8d80"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80`}
                      alt="Student"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className="h-4 w-4 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Trusted by early learners
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-lime-500 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Students learning"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Floating stats */}
                  <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 flex-1 hover:scale-105 transition">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-lime-500" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          100+
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Active Students
                      </p>
                    </div>
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 flex-1 hover:scale-105 transition">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5 text-lime-500" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {featuredCourses.length}+
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Featured Courses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                LMS.io
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: AcademicCapIcon,
                title: "Expert Instructors",
                description:
                  "Learn from industry professionals with years of real-world experience",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: ChartBarIcon,
                title: "Track Progress",
                description:
                  "Monitor your learning journey with detailed progress tracking",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: UserGroupIcon,
                title: "Community Learning",
                description:
                  "Connect with fellow learners, share knowledge, and grow together",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: SparklesIcon,
                title: "Flexible Learning",
                description:
                  "Learn at your own pace with lifetime access to all course materials",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                ></div>
                <div className="relative z-10">
                  <div
                    className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section - From Database */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Featured{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                  Courses
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Popular courses chosen by our early students
              </p>
            </div>
            <Link
              to="/courses"
              className="group flex items-center text-lime-600 font-semibold hover:gap-2 transition-all mt-4 md:mt-0"
            >
              View All Courses
              <ChevronRightIcon className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No courses available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <div
                  key={course._id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        course.thumbnail?.url ||
                        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={course.title}
                      className="w-full h-48 object-cover transform group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-lime-500 text-white text-xs font-semibold rounded-full">
                        {course.categories?.[0] || "Course"}
                      </span>
                    </div>
                    {course.discountedPrice && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          {course.discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-lime-600 transition text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      by {course.instructor}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.shortDescription}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) =>
                            i < Math.floor(course.averageRating || 0) ? (
                              <StarIconSolid
                                key={i}
                                className="h-4 w-4 text-yellow-400"
                              />
                            ) : (
                              <StarIcon
                                key={i}
                                className="h-4 w-4 text-gray-300 dark:text-gray-600"
                              />
                            ),
                          )}
                        </div>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({course.totalRatings || 0})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {course.discountedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-lime-600">
                              ₹{course.discountedPrice}
                            </span>
                            <span className="text-sm line-through text-gray-400 dark:text-gray-500">
                              ₹{course.price}
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
                        className="px-4 py-2 bg-lime-500 text-white text-sm font-semibold rounded-lg hover:bg-lime-600 transition transform hover:scale-105"
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
      </section>

      {/* Categories Section - Solid Cards */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Explore Top{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                Categories
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find the perfect course from our growing collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/courses?category=${category.name}`}
                className={`group ${category.bgColor} border ${category.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm`}
                  >
                    <category.icon
                      className={`h-6 w-6 ${category.textColor}`}
                    />
                  </div>
                  <ChevronRightIcon
                    className={`h-5 w-5 text-gray-400 group-hover:text-lime-500 group-hover:translate-x-1 transition-all`}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className={`text-sm font-medium ${category.textColor}`}>
                  {category.count} {category.count === 1 ? "course" : "courses"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start your learning journey in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Create Account",
                description:
                  "Sign up for free and get instant access to our learning platform",
                icon: AcademicCapIcon,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: 2,
                title: "Choose Course",
                description:
                  "Browse our catalog and pick the course that fits your goals",
                icon: BookOpenIcon,
                color: "from-green-500 to-emerald-500",
              },
              {
                step: 3,
                title: "Start Learning",
                description:
                  "Learn at your own pace with lifetime access to all materials",
                icon: PlayCircleIcon,
                color: "from-purple-500 to-pink-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-lime-600 mb-2 block">
                      Step {item.step}
                    </span>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                Students Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join our growing community of satisfied learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                course: "Web Development",
                review:
                  "This platform transformed my career. I went from zero to getting my first developer job in 6 months!",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1494790108777-38580c3549b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              },
              {
                name: "Michael Rodriguez",
                course: "Data Science",
                review:
                  "The quality of instruction is outstanding. The projects helped me build a strong portfolio.",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              },
              {
                name: "Emily Watson",
                course: "UI/UX Design",
                review:
                  "Finally found a platform that combines theory with practical hands-on projects. Highly recommended!",
                rating: 5,
                image:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-lime-500"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-600 dark:text-gray-400 italic">
                  "{testimonial.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Got questions? We've got answers
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "pb-6" : "h-0"
                  }`}
                >
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  icon: UserGroupIcon,
                  number: "100+",
                  label: "Active Students",
                },
                {
                  icon: BookOpenIcon,
                  number: `${featuredCourses.length}+`,
                  label: "Courses",
                },
                {
                  icon: BriefcaseIcon,
                  number: "15+",
                  label: "Expert Instructors",
                },
                {
                  icon: TrophyIcon,
                  number: "95%",
                  label: "Satisfaction Rate",
                },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex p-4 bg-lime-100 dark:bg-lime-900/30 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
                  </div>
                  <div className="text-4xl font-bold text-lime-600 dark:text-lime-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our community of learners and start your journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="group inline-flex items-center px-8 py-4 bg-white text-lime-600 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
            >
              Browse Courses
              <ChevronRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-lime-600 transition-all hover:scale-105"
            >
              Sign Up Free
              <AcademicCapIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
