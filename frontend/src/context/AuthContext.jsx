import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  // Helper to set token in axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to load user:", error);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });

      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Sending registration data:", userData);
      const response = await axios.post("/auth/register", userData);

      console.log("Registration response:", response.data);

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: "Registration succeeded but no token received",
        };
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return false;
    }
  };

  // Value object with all auth methods and state
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Also export the context for advanced use cases if needed
export default AuthContext;
