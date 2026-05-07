import React, { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/upload",
        formData
      );

      console.log(res.data);

      // NEW RESPONSE
      setResult(res.data);

      setLoading(false);

    } catch (error) {

      console.error(error);

      alert("Upload failed");

      setLoading(false);
    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI"
      }}
    >

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "700px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}
      >

        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px"
          }}
        >
          📄 AI Document Analyzer
        </h2>

        {/* FILE INPUT */}
        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          style={{
            marginBottom: "20px"
          }}
        />

        <button
          onClick={handleUpload}
          style={{
            padding: "12px 25px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold"
          }}
        >
          {loading
            ? "Analyzing..."
            : "Upload & Analyze"}
        </button>

        {/* RESULTS */}
        {result && (

          <div style={{ marginTop: "30px" }}>

            <h3>Document Analysis</h3>

            <p>
              <strong>Document Type:</strong>{" "}
              {result.documentType}
            </p>

            <p>
              <strong>Chunk Count:</strong>{" "}
              {result.chunkCount}
            </p>

            {/* EMAILS */}
            <div style={{ marginTop: "20px" }}>

              <h4>Emails</h4>

              <ul>
                {result.structuredData.emails.map(
                  (email, i) => (
                    <li key={i}>{email}</li>
                  )
                )}
              </ul>

            </div>

            {/* PHONE NUMBERS */}
            <div style={{ marginTop: "20px" }}>

              <h4>Phone Numbers</h4>

              <ul>
                {result.structuredData.phones.map(
                  (phone, i) => (
                    <li key={i}>{phone}</li>
                  )
                )}
              </ul>

            </div>

            {/* SECTIONS */}
            <div style={{ marginTop: "20px" }}>

              <h4>Detected Sections</h4>

              <ul>
                {result.structuredData.sections.map(
                  (section, i) => (
                    <li key={i}>{section}</li>
                  )
                )}
              </ul>

            </div>

            {/* PREVIEW */}
            {/* AI SUMMARY */}
<div style={{ marginTop: "20px" }}>

  <h4>AI Generated Summary</h4>

  <div
    style={{
      background: "#eef4ff",
      padding: "15px",
      borderRadius: "10px",
      lineHeight: "1.7",
      color: "#333"
    }}
  >
    <div
  style={{
    whiteSpace: "pre-wrap",
    lineHeight: "1.8"
  }}
>
  {result.summary
    .split("**")
    .map((part, index) =>

      index % 2 === 1 ? (

        <strong key={index}>
          {part}
        </strong>

      ) : (

        part

      )
    )}
</div>
  </div>

</div>

          </div>
        )}

      </div>

    </div>
  );
}

export default App;