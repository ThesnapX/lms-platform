import axios from "./utils/axios";

const testAuth = async () => {
  console.log("Testing authentication...");
  console.log(
    "Token in localStorage:",
    localStorage.getItem("token")?.substring(0, 20) + "...",
  );

  try {
    const response = await axios.get("/auth/me");
    console.log("✅ Auth successful! User:", response.data.user);
  } catch (error) {
    console.error("❌ Auth failed:", error.response?.data || error.message);
  }
};

testAuth();
