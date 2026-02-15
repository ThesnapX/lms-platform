import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isEditor } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <AcademicCapIcon className="h-8 w-8 text-lime-500" />
            <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              LMS<span className="text-lime-500">.io</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
            >
              Courses
            </Link>
            <Link
              to="/suggest-course"
              className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
            >
              Suggest Course
            </Link>
            <Link
              to="/about"
              className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
            >
              About
            </Link>

            {/* Admin Link - Only for Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Editor Link - Only for pure Editors (not admins) */}
            {isEditor && !isAdmin && (
              <Link
                to="/editor"
                className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500 transition-colors"
              >
                Editor
              </Link>
            )}
          </div>

          {/* Right Side - Theme Toggle & Auth */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-500"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-lime-500 dark:hover:text-lime-500"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
