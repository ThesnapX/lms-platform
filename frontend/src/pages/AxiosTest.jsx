import { useState, useEffect } from "react";
import axios from "../utils/axios";

const AxiosTest = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    testAxios();
  }, []);

  const testAxios = async () => {
    try {
      console.log("Testing axios...");
      const response = await axios.get("/auth/me");
      console.log("Axios test success:", response.data);
      setUserData(response.data.user);
    } catch (err) {
      console.error("Axios test failed:", err);
      setError(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Axios Test</h1>
      {userData ? (
        <div className="bg-green-100 p-4 rounded">
          <p className="font-bold">✅ Axios Working!</p>
          <p>User: {userData.name}</p>
          <p>Role: {userData.role}</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded">
          <p className="font-bold">❌ Axios Failed</p>
          <p>{error}</p>
        </div>
      ) : (
        <p>Testing...</p>
      )}
    </div>
  );
};

export default AxiosTest;
