import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";

const AuthTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState({});

  const testAuth = async () => {
    const token = localStorage.getItem("token");
    const newResults = {};

    // Test 1: Check localStorage
    newResults.tokenExists = !!token;
    newResults.tokenPreview = token
      ? token.substring(0, 20) + "..."
      : "No token";

    // Test 2: Check AuthContext
    newResults.authContext = {
      isAuthenticated,
      user: user ? { id: user._id, email: user.email, role: user.role } : null,
    };

    // Test 3: Test /auth/me endpoint
    try {
      const meResponse = await axios.get("/auth/me");
      newResults.authMe = { success: true, data: meResponse.data };
    } catch (error) {
      newResults.authMe = { success: false, error: error.message };
    }

    // Test 4: Test /debug/user-purchases endpoint
    try {
      const purchasesResponse = await axios.get("/debug/user-purchases");
      newResults.purchases = { success: true, data: purchasesResponse.data };
    } catch (error) {
      newResults.purchases = { success: false, error: error.message };
    }

    // Test 5: Test a specific course (replace with your course ID)
    const courseId = "69903a655a78069abdee5b22";
    try {
      const courseResponse = await axios.get(`/courses/${courseId}`);
      newResults.course = {
        success: true,
        hasAccess: courseResponse.data.hasAccess,
        courseTitle: courseResponse.data.course?.title,
      };
    } catch (error) {
      newResults.course = { success: false, error: error.message };
    }

    setResults(newResults);
    console.log("Test results:", newResults);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <button
        onClick={testAuth}
        className="bg-lime-500 text-white px-4 py-2 rounded mb-4"
      >
        Run Auth Tests
      </button>

      {Object.keys(results).length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Results:</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
