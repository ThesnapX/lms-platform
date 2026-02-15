import { useState } from "react";
import axios from "../utils/axios";

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Check token
    const token = localStorage.getItem("token");
    results.token = token ? "✅ Present" : "❌ Missing";

    if (token) {
      results.tokenPreview = token.substring(0, 20) + "...";
    }

    // Test 2: Try /auth/me
    try {
      const meRes = await axios.get("/auth/me");
      results.me = "✅ Success";
      results.user = meRes.data.user?.name || "Unknown";
    } catch (error) {
      results.me = "❌ Failed";
      results.meError = error.response?.data?.message || error.message;
    }

    // Test 3: Try /courses (public endpoint)
    try {
      const coursesRes = await axios.get("/courses");
      results.courses = `✅ Success (${coursesRes.data.courses?.length || 0} courses)`;
    } catch (error) {
      results.courses = "❌ Failed";
    }

    // Test 4: Try /admin/stats (protected)
    try {
      const statsRes = await axios.get("/admin/stats");
      results.admin = "✅ Success";
    } catch (error) {
      results.admin = "❌ Failed";
      results.adminError = error.response?.status;
    }

    setResults(results);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>

      <button
        onClick={testEndpoints}
        disabled={loading}
        className="bg-lime-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "Testing..." : "Test API Endpoints"}
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

export default ApiTest;
