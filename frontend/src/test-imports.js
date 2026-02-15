// Run this in browser console
const testImports = async () => {
  console.log("Testing imports...");

  try {
    const axiosModule = await import("./utils/axios.js");
    console.log(
      "✅ axios import successful:",
      axiosModule.default ? "default export exists" : "no default export",
    );
  } catch (e) {
    console.error("❌ axios import failed:", e.message);
  }

  try {
    const authModule = await import("./context/AuthContext.jsx");
    console.log("✅ AuthContext import successful");
  } catch (e) {
    console.error("❌ AuthContext import failed:", e.message);
  }
};

testImports();
