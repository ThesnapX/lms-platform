const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            About <span className="text-lime-500">LMS.io</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make quality education accessible to everyone,
            everywhere.
          </p>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              At LMS.io, we believe that education should be accessible,
              engaging, and effective. We're building a platform that empowers
              learners to achieve their goals through high-quality courses
              taught by industry experts.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Whether you're looking to advance your career, learn a new skill,
              or explore a passion, we're here to support you every step of the
              way.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us?
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-lime-500 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Expert-led courses from industry professionals
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-lime-500 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Self-paced learning with lifetime access
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-lime-500 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Progress tracking and certificates of completion
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-lime-500 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Community support and discussion forums
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-lime-500 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Affordable pricing and flexible payment options
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">50+</div>
            <div className="text-gray-600 dark:text-gray-400">
              Expert Instructors
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">100+</div>
            <div className="text-gray-600 dark:text-gray-400">
              Online Courses
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">10,000+</div>
            <div className="text-gray-600 dark:text-gray-400">
              Active Students
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-lime-500 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-400">
              Satisfaction Rate
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Passionate educators and technologists working together
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-1">
                John Smith
              </h3>
              <p className="text-lime-600 dark:text-lime-400 mb-2">
                CEO & Founder
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                15+ years in EdTech, passionate about accessible education
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-1">
                Sarah Johnson
              </h3>
              <p className="text-lime-600 dark:text-lime-400 mb-2">
                Head of Education
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                PhD in Educational Technology, curriculum designer
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-1">
                Michael Chen
              </h3>
              <p className="text-lime-600 dark:text-lime-400 mb-2">
                Lead Developer
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Full-stack developer, MERN stack expert
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
