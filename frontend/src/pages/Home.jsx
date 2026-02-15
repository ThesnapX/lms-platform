import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Learn Anytime, <span className="text-lime-500">Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Access high-quality courses from industry experts. Track your
                progress, earn certificates, and advance your career.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/courses" className="btn-primary text-center">
                  Browse Courses
                </Link>
                <Link to="/register" className="btn-outline text-center">
                  Start Learning Free
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-lime-100 dark:bg-lime-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2">
                Expert Instructors
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from industry professionals with real-world experience
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-lime-100 dark:bg-lime-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your learning journey with detailed progress tracking
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-lime-100 dark:bg-lime-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2">
                Community Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interact with fellow learners through comments and discussions
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-lime-100 dark:bg-lime-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2">
                Flexible Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn at your own pace, anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-lime-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of learners already improving their skills
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-lime-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
