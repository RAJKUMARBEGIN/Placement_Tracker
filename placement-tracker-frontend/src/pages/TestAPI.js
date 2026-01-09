import React, { useState, useEffect } from "react";

const TestAPI = () => {
  const [result, setResult] = useState("Loading...");
  const [expData, setExpData] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        console.log(
          "🧪 TEST: Fetching from http://localhost:8080/api/placement-experiences"
        );

        const response = await fetch(
          "http://localhost:8080/api/placement-experiences"
        );
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        const data = await response.json();
        console.log("Response data:", data);

        setExpData(data);
        setResult(
          `✅ Success! Got ${
            Array.isArray(data) ? data.length : data?.length || 0
          } experiences`
        );
      } catch (error) {
        console.error("❌ Error:", error);
        setResult(`❌ Error: ${error.message}`);
      }
    };

    test();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🧪 API Test Page</h1>
      <h2>{result}</h2>

      {expData && (
        <div
          style={{
            marginTop: "20px",
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>Data from API:</h3>
          <pre
            style={{ overflow: "auto", maxHeight: "400px", fontSize: "12px" }}
          >
            {JSON.stringify(expData, null, 2)}
          </pre>
        </div>
      )}

      <hr />
      <button
        onClick={() => (window.location.href = "/experiences")}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Go to Experiences Page
      </button>
    </div>
  );
};

export default TestAPI;
