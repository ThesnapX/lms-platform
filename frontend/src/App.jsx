import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/auth/PrivateRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";

// Pages
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import SingleCourse from "./pages/SingleCourse";
import SuggestCourse from "./pages/SuggestCourse";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboard from "./pages/admin/Dashboard";
import EditorDashboard from "./pages/editor/Dashboard";
import AuthTest from "./pages/AuthTest";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<SingleCourse />} />
              <Route path="/suggest-course" element={<SuggestCourse />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              {/* Protected Routes - Any authenticated user */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/:courseId"
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resend-verification"
                element={
                  <PrivateRoute>
                    <ResendVerification />
                  </PrivateRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/admin"
                element={
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                }
              />

              {/* Editor Routes - Accessible by both editor and admin */}
              <Route
                path="/editor"
                element={
                  <RoleBasedRoute allowedRoles={["editor", "admin"]}>
                    <EditorDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route path="/auth-test" element={<AuthTest />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
