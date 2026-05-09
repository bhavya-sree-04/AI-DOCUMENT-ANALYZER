import React, { useState , useEffect , useRef} from "react";
import axios from "axios";
import ATSScoreCircle from "./components/ATSScoreCircle";
import { Trash2 } from "lucide-react";
export default function App() {

  const [file, setFile] = useState(null);

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [recentFiles, setRecentFiles] = useState([]);

  // CHAT STATES
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

 const [asking, setAsking] =
  useState(false);

const [dragActive, setDragActive] =
  useState(false);

const chatEndRef =
  useRef(null);

  // =====================================
// DRAG & DROP
// =====================================
const handleDrag = (e) => {

  e.preventDefault();

  e.stopPropagation();

  if (

    e.type === "dragenter" ||

    e.type === "dragover"

  ) {

    setDragActive(true);

  } else if (

    e.type === "dragleave"

  ) {

    setDragActive(false);
  }
};


const handleDrop = (e) => {

  e.preventDefault();

  e.stopPropagation();

  setDragActive(false);

  const droppedFiles =
    e.dataTransfer.files;

  if (

    droppedFiles &&

    droppedFiles.length > 0

  ) {

    const droppedFile =
      droppedFiles[0];

    console.log(
      "Dropped:",
      droppedFile.name
    );

    setFile(droppedFile);

    setSelectedFileName(
      droppedFile.name
    );

    e.dataTransfer.clearData();
  }
};
  // =====================================
// LOAD DOCUMENTS FROM DATABASE
// =====================================
useEffect(() => {

  fetchDocuments();

}, []);
// =====================================
// AUTO SCROLL CHAT
// =====================================
useEffect(() => {

  chatEndRef.current?.scrollIntoView({

    behavior: "smooth"
  });

}, [messages]);


const fetchDocuments = async () => {

  try {

    const res = await axios.get(

      "http://localhost:5000/upload/documents"
    );

    const formattedDocs =
      res.data.documents.map((doc) => ({

        name:
          doc.fileName,

        type:
          doc.documentType,

        time:
          new Date(
            doc.uploadedAt
          ).toLocaleTimeString(),

        data: {

          ...doc
        }
      }));

    setRecentFiles(formattedDocs);

  } catch (error) {

    console.error(error);
  }
};


  // =====================================
  // UPLOAD DOCUMENT
  // =====================================
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

      // CLEAR CHAT FOR NEW DOCUMENT
      setMessages([]);

      const documentData = {

        ...res.data,

        messages: []
      };

      setResult(documentData);

      setRecentFiles((prev) => [

        {
          name: file.name,

          type: res.data.documentType,

          time: new Date().toLocaleTimeString(),

          data: documentData
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


  // =====================================
  // ASK QUESTION
  // =====================================
  
  const handleAskQuestion = async () => {

    if (!question || !result?.documentText) {

      alert("Upload a document and ask a question");

      return;
    }

    try {

      setAsking(true);
     await new Promise(

  (resolve) =>

    setTimeout(resolve, 1200)
);
      const res = await axios.post(

        "http://localhost:5000/upload/ask",

        {
          documentId:
                 result.documentId,

          documentText:
            result.documentText,

          question
        }
      );


      // USER MESSAGE
      const userMessage = {

        type: "user",

        text: question
      };


      // AI MESSAGE
      const aiMessage = {

        type: "ai",

        text: res.data.answer
      };


      // UPDATED MESSAGES
      const updatedMessages = [

        ...messages,

        userMessage,

        aiMessage
      ];


      setMessages(updatedMessages);


      // UPDATE CURRENT DOCUMENT
      setResult({

        ...result,

        messages: updatedMessages
      });


      // UPDATE RECENT FILES MEMORY
      setRecentFiles((prev) =>

        prev.map((item) =>

          item.name === selectedFileName

            ? {

                ...item,

                data: {

                  ...item.data,

                  messages: updatedMessages
                }
              }

            : item
        )
      );


      // CLEAR INPUT
      setQuestion("");

    } catch (error) {

      console.error(error);

      alert("Question answering failed");

    } finally {

      setAsking(false);
    }
  };


  return (

    <div className="
      min-h-screen
      bg-[#0B1120]
      text-white
      flex
    ">

      {/* SIDEBAR */}
      <div className="
        w-72
        bg-[#111827]
        border-r
        border-gray-800
        p-6
        flex
        flex-col
        justify-between
      ">

        <div>

          {/* LOGO */}
          <div className="
            flex
            items-center
            gap-3
            mb-10
          ">

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-purple-600
              flex
              items-center
              justify-center
              text-2xl
              font-bold
            ">
              AI
            </div>

            <div>

              <h1 className="
                text-xl
                font-bold
              ">
                SmartDoc AI
              </h1>

              <p className="
                text-gray-400
                text-sm
              ">
                Document Intelligence
              </p>

            </div>

          </div>


          {/* DASHBOARD */}
          <button className="
            w-full
            bg-purple-600
            rounded-xl
            py-3
            font-medium
            mb-6
          ">
            Dashboard
          </button>


          {/* RECENT FILES */}
          <div className="
            bg-[#1F2937]
            rounded-2xl
            p-4
            border
            border-gray-700
          ">

            <h3 className="
              font-semibold
              mb-4
              text-lg
            ">
              Recent Files
            </h3>


            <div className="
              space-y-3
              max-h-96
              overflow-y-auto
            ">

              {recentFiles.length > 0 ? (

                recentFiles.map((item, index) => (

                  <div

                    key={index}

                    onClick={() => {

                      setResult(item.data);

                      setSelectedFileName(item.name);

                      setMessages(
                        item.data.messages || []
                      );
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

                   <div className="
  flex
  justify-between
  items-start
  gap-2
">

  <p className="
    text-sm
    font-medium
    truncate
  ">
    {item.name}
  </p>

  <button

    onClick={(e) => {

      e.stopPropagation();

      const updatedFiles =

        recentFiles.filter(

          (_, i) => i !== index
        );

      setRecentFiles(
        updatedFiles
      );

      localStorage.setItem(

        "recentFiles",

        JSON.stringify(
          updatedFiles
        )
      );
    }}

    className="
  text-gray-400
  hover:text-gray-300
  transition
  p-1
  rounded-md
  hover:bg-gray-500/10
"
  >

   <Trash2 size={16} />

  </button>

</div>
                    <div className="
                      flex
                      justify-between
                      items-center
                      mt-2
                      text-xs
                      text-gray-400
                    ">

                      <span className="
                        capitalize
                      ">
                        {item.type}
                      </span>

                      <span>
                        {item.time}
                      </span>

                    </div>

                  </div>

                ))

              ) : (

                <p className="
                  text-sm
                  text-gray-400
                ">
                  No recent uploads
                </p>

              )}

            </div>

          </div>

        </div>


        {/* STATUS */}
        <div className="
          bg-[#1F2937]
          rounded-2xl
          p-4
          border
          border-gray-700
        ">

          <p className="
            text-sm
            text-gray-400
            mb-2
          ">
            AI Processing Status
          </p>

          <div className="
            w-full
            bg-gray-700
            rounded-full
            h-3
            overflow-hidden
          ">

            <div className="
              bg-purple-500
              h-full
              w-[80%]
            "></div>

          </div>

          <p className="
            text-sm
            mt-3
            text-gray-300
          ">
            AWS + Groq Connected
          </p>

        </div>

      </div>


      {/* MAIN CONTENT */}
      <div className="
        flex-1
        p-8
        overflow-y-auto
      ">

        {/* HEADER */}
        <div className="
          mb-8
        ">

          <h2 className="
            text-4xl
            font-bold
            mb-2
          ">
            AI Document Analyzer
          </h2>

          <p className="
            text-gray-400
            text-lg
          ">
            Upload documents and extract AI-powered insights instantly.
          </p>

        </div>


        {/* UPLOAD CARD */}
        <div className="
          bg-[#111827]
          rounded-3xl
          border
          border-gray-800
          p-8
          mb-8
          shadow-2xl
        ">

          <div

  onDragEnter={handleDrag}

  onDragLeave={handleDrag}

  onDragOver={handleDrag}
  onDragEnd={handleDrag}
  onDrop={handleDrop}

  className={`

    border-2
    border-dashed
    rounded-3xl
    p-14
    text-center
    transition-all
    duration-300

    ${

      dragActive

        ? "border-purple-400 bg-purple-500/10 scale-[1.01]"

        : "border-purple-500"
    }

  `}
>

            <div className="
              text-6xl
              mb-5
            ">
              📄
            </div>

            <h3 className="
              text-2xl
              font-semibold
              mb-3
            ">
              Upload Your Document
            </h3>
           <p className="
          text-gray-400
          mb-3
         text-lg
         ">
        Drag & Drop your files here
        </p>

<p className="
  text-gray-500
  mb-8
">
  or click to browse files
  <br />
  Supports PDF, DOCX, JPG and PNG
</p>


            {/* FILE INPUT */}
            <div className="
              flex
              items-center
              justify-center
              gap-4
              mb-8
              flex-wrap
            ">

              <label className="
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
              ">

                <span className="
                  text-2xl
                ">
                  📁
                </span>

                Choose Document

                <input
                  type="file"
                  hidden

                  onChange={(e) => {

                    const selected =
                      e.target.files[0];

                    setFile(selected);

                    setSelectedFileName(
                      selected.name
                    );
                  }}
                />

              </label>


              {selectedFileName && (

                <div className="
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
                ">

                  ✅ {selectedFileName}

                </div>

              )}

            </div>


            {/* BUTTON */}
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


        {/* RESULTS */}
        {result && (

          <>

            {/* ANALYTICS */}
            <div className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-6
              mb-8
            ">

              <div className="
                bg-[#111827]
                border
                border-gray-800
                rounded-3xl
                p-6
              ">

                <p className="
                  text-gray-400
                  mb-3
                ">
                  Document Type
                </p>

                <h3 className="
                  text-3xl
                  font-bold
                ">
                  {result.documentType}
                </h3>

              </div>


              <div className="
                bg-[#111827]
                border
                border-gray-800
                rounded-3xl
                p-6
              ">

                <p className="
                  text-gray-400
                  mb-3
                ">
                  Chunk Count
                </p>

                <h3 className="
                  text-3xl
                  font-bold
                ">
                  {result.chunkCount}
                </h3>

              </div>


              <div className="
                bg-[#111827]
                border
                border-gray-800
                rounded-3xl
                p-6
              ">

                <p className="
                  text-gray-400
                  mb-3
                ">
                  AI Model
                </p>

                <h3 className="
                  text-2xl
                  font-bold
                ">
                  Llama 3.1
                </h3>

              </div>

            </div>


            {/* SUMMARY */}
            <div className="
              bg-[#111827]
              rounded-3xl
              border
              border-gray-800
              p-8
              shadow-2xl
              mb-8
            ">

              <div className="
                flex
                justify-between
                items-center
                mb-6
              ">

                <h3 className="
                  text-2xl
                  font-bold
                ">
                  AI Generated Summary
                </h3>
                {result?.documentType ===
  "Resume" && (

  <ATSScoreCircle

    score={

      Number(

        result?.summary
          ?.match(/\d+/)?.[0]

      ) || 0
    }
  />

)}
                <div className="
                  bg-purple-600
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                ">
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
                whitespace-pre-wrap
              ">

                {result.summary
  .split("**")
  .map((part, index) =>

    index % 2 === 1 ? (

      <strong
        key={index}
        className="
          text-white
          font-bold
        "
      >
        {part}
      </strong>

    ) : (

      part

    )
  )}

              </div>

            </div>


            {/* AI CHAT */}
            <div className="
              bg-[#111827]
              rounded-3xl
              border
              border-gray-800
              p-8
              shadow-2xl
              mb-8
            ">

              <h3 className="
                text-2xl
                font-bold
                mb-6
              ">
                AI Document Assistant
              </h3>


              {/* CHAT MESSAGES */}
              <div className="
                space-y-5
                max-h-[500px]
                overflow-y-auto
                mb-6
              ">

                {messages.length > 0 ? (

                  messages.map((message, index) => (

                    <div

  className={

    message.type === "user"

      ? `
        flex
        justify-end
        items-end
        gap-3
      `

      : `
        flex
        justify-start
        items-start
        gap-3
      `
  }
>

  {message.type === "ai" && (

  <div className="
    w-10
    h-10
    rounded-full
    bg-purple-600
    flex
    items-center
    justify-center
    font-bold
    shrink-0
  ">
    AI
  </div>

)}

                      <div

                        className={

                          message.type === "user"

                            ? `
                              bg-purple-600
                              text-white
                              px-5
                              py-4
                              rounded-2xl
                              max-w-2xl
                              whitespace-pre-wrap
                            `

                            : `
                              bg-[#0F172A]
                              border
                              border-gray-700
                              text-gray-300
                              px-5
                              py-4
                              rounded-2xl
                              max-w-2xl
                              whitespace-pre-wrap
                              leading-8
                            `
                        }
                      >

                        {message.text}
                        </div>

{message.type === "user" && (

  <div className="
    w-10
    h-10
    rounded-full
    bg-blue-600
    flex
    items-center
    justify-center
    font-bold
    shrink-0
  ">
    U
  </div>

)}

                      </div>

                  ))

                ) : (

                  <div className="
                    text-center
                    text-gray-500
                    py-16
                  ">

                    Ask questions about your uploaded document.

                  </div>

                )}
                {asking && (

  <div className="
    flex
    justify-start
  ">

    <div className="
      bg-[#0F172A]
      border
      border-gray-700
      px-5
      py-4
      rounded-2xl
      flex
      items-center
      gap-2
    ">

      <span className="
        w-2
        h-2
        bg-purple-400
        rounded-full
        animate-bounce
      "></span>

      <span className="
        w-2
        h-2
        bg-purple-400
        rounded-full
        animate-bounce
        [animation-delay:0.2s]
      "></span>

      <span className="
        w-2
        h-2
        bg-purple-400
        rounded-full
        animate-bounce
        [animation-delay:0.4s]
      "></span>

      <span className="
        text-gray-400
        ml-2
      ">
        AI is typing...
      </span>

    </div>

  </div>

)}
              <div ref={chatEndRef}></div>
              </div>



              {/* INPUT */}
              <div className="
                flex
                gap-4
                mt-6
              ">

                <input

                  type="text"

                  placeholder="
                  Ask anything about the document...
                  "

                  value={question}

                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                     

                   onKeyDown={(e) => {

                   if (

                    e.key === "Enter" &&

                       !asking

                  ) {

    handleAskQuestion();
  }
}}

                  className="
                    flex-1
                    bg-[#1F2937]
                    border
                    border-gray-700
                    rounded-2xl
                    px-5
                    py-4
                    text-white
                    outline-none
                  "
                />


                <button

                  onClick={handleAskQuestion}

                  className="
                    bg-purple-600
                    hover:bg-purple-700
                    px-6
                    py-4
                    rounded-2xl
                    font-semibold
                    transition-all
                  "
                >

                  {asking ? (

  <div className="
    flex
    items-center
    gap-2
  ">

    <div className="
      flex
      gap-1
    ">

      <span className="
        w-2
        h-2
        bg-white
        rounded-full
        animate-bounce
      "></span>

      <span className="
        w-2
        h-2
        bg-white
        rounded-full
        animate-bounce
        [animation-delay:0.2s]
      "></span>

      <span className="
        w-2
        h-2
        bg-white
        rounded-full
        animate-bounce
        [animation-delay:0.4s]
      "></span>

    </div>

    <span>
      AI Thinking...
    </span>

  </div>

) : (

  "Ask AI"

)}

                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  );
}