import React, { useState } from "react";
import axios from "axios";

export default function App() {

  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

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

      setResult(res.data);

      setRecentFiles((prev) => [

        {
          name: file.name,
          type: res.data.documentType,
          time: new Date().toLocaleTimeString(),
          data: res.data
        },

        ...prev

      ]);

    } catch (error) {

      console.error(error);
      alert("Upload failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#0B1120] text-white flex">

      {/* Sidebar */}
      <div className="w-72 bg-[#111827] border-r border-gray-800 p-6 flex flex-col justify-between">

        <div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">

            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-2xl font-bold">
              AI
            </div>

            <div>

              <h1 className="text-xl font-bold">
                SmartDoc AI
              </h1>

              <p className="text-gray-400 text-sm">
                Document Intelligence
              </p>

            </div>

          </div>

          {/* Navigation */}
          <div className="space-y-4">

            <button className="w-full bg-purple-600 rounded-xl py-3 font-medium">
              Dashboard
            </button>

            {/* Recent Files */}
            <div className="bg-[#1F2937] rounded-2xl p-4 border border-gray-700">

              <h3 className="font-semibold mb-4 text-lg">
                Recent Files
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">

                {recentFiles.length > 0 ? (

                  recentFiles.map((item, index) => (

                    <div
                      key={index}

                      onClick={() => {

                        setResult(item.data);

                        setSelectedFileName(item.name);

                      }}

                      className="
                        bg-[#111827]
                        rounded-xl
                        p-3
                        border
                        border-gray-800
                        cursor-pointer
                        hover:border-purple-500
                        hover:bg-[#182235]
                        transition-all
                      "
                    >

                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>

                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">

                        <span className="capitalize">
                          {item.type}
                        </span>

                        <span>
                          {item.time}
                        </span>

                      </div>

                    </div>

                  ))

                ) : (

                  <p className="text-sm text-gray-400">
                    No recent uploads
                  </p>

                )}

              </div>

            </div>

            <button className="w-full bg-[#1F2937] rounded-xl py-3 font-medium">
              AI Insights
            </button>

          </div>

        </div>

        {/* Status */}
        <div className="bg-[#1F2937] rounded-2xl p-4 border border-gray-700">

          <p className="text-sm text-gray-400 mb-2">
            AI Processing Status
          </p>

          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">

            <div className="bg-purple-500 h-full w-[80%]"></div>

          </div>

          <p className="text-sm mt-3 text-gray-300">
            AWS + Groq Connected
          </p>

        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-4xl font-bold mb-2">
              AI Document Analyzer
            </h2>

            <p className="text-gray-400 text-lg">
              Upload documents and extract AI-powered insights instantly.
            </p>

          </div>

          <div className="bg-[#111827] px-5 py-3 rounded-2xl border border-gray-800">

            <p className="text-sm text-gray-400">
              Cloud Status
            </p>

            <p className="font-semibold text-green-400">
              Connected
            </p>

          </div>

        </div>

        {/* Upload Card */}
        <div className="bg-[#111827] rounded-3xl border border-gray-800 p-8 mb-8 shadow-2xl">

          <div className="border-2 border-dashed border-purple-500 rounded-3xl p-14 text-center">

            <div className="text-6xl mb-5">
              📄
            </div>

            <h3 className="text-2xl font-semibold mb-3">
              Upload Your Document
            </h3>

            <p className="text-gray-400 mb-8">
              Supports PDF, DOCX, JPG and PNG files.
            </p>

            {/* Custom Upload */}
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">

              <label
                className="
                  cursor-pointer
                  bg-gradient-to-r
                  from-purple-600
                  to-purple-700
                  hover:from-purple-700
                  hover:to-purple-800
                  px-8
                  py-4
                  rounded-2xl
                  flex
                  items-center
                  gap-3
                  transition-all
                  shadow-xl
                  text-white
                  font-semibold
                  text-lg
                  tracking-wide
                "
              >

                <span className="text-2xl">
                  📁
                </span>

                <span>
                  Choose Document
                </span>

                <input
                  type="file"
                  hidden
                  onChange={(e) => {

                    const selected = e.target.files[0];

                    setFile(selected);

                    setSelectedFileName(selected.name);

                  }}
                />

              </label>

              {selectedFileName && (

                <div
                  className="
                    bg-[#1F2937]
                    border
                    border-green-500
                    px-5
                    py-4
                    rounded-2xl
                    text-green-400
                    text-sm
                    max-w-md
                    truncate
                    flex
                    items-center
                    gap-2
                  "
                >
                  ✅ {selectedFileName}
                </div>

              )}

            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              className="
                bg-purple-600
                hover:bg-purple-700
                transition-all
                px-10
                py-4
                rounded-2xl
                font-semibold
                text-lg
                shadow-lg
              "
            >
              {loading
                ? "Analyzing..."
                : "Upload & Analyze"}
            </button>

          </div>

        </div>

        {/* Results */}
        {result && (

          <>

            {/* Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl">

                <p className="text-gray-400 mb-3">
                  Document Type
                </p>

                <h3 className="text-3xl font-bold capitalize">
                  {result.documentType}
                </h3>

              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl">

                <p className="text-gray-400 mb-3">
                  Chunk Count
                </p>

                <h3 className="text-3xl font-bold">
                  {result.chunkCount}
                </h3>

              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl">

                <p className="text-gray-400 mb-3">
                  AI Model
                </p>

                <h3 className="text-2xl font-bold">
                  Llama 3.1
                </h3>

              </div>

            </div>

            {/* AI Summary */}
            <div className="bg-[#111827] rounded-3xl border border-gray-800 p-8 shadow-2xl mb-8">

              <div className="flex items-center justify-between mb-6">

                <h3 className="text-2xl font-bold">
                  AI Generated Summary
                </h3>

                <div className="bg-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
                  Groq AI
                </div>

              </div>

              <div className="
                bg-[#0F172A]
                border
                border-gray-700
                rounded-2xl
                p-6
                leading-8
                text-gray-300
                text-lg
                whitespace-pre-wrap
              ">

                {result.summary
                  .split("**")
                  .map((part, index) =>

                    index % 2 === 1 ? (

                      <strong
                        key={index}
                        className="text-white"
                      >
                        {part}
                      </strong>

                    ) : (

                      part

                    )
                  )}

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  );
}