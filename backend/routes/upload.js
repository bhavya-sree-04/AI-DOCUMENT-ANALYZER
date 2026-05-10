const express = require("express");
const multer = require("multer");
const s3 = require("../config/aws");
const AWS = require("aws-sdk");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const { pipeline } = require("@xenova/transformers");
const Document = require("../models/Document");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

const textract = new AWS.Textract();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
// =====================================
// EMBEDDING MODEL
// =====================================
let embedder;

async function loadEmbeddingModel() {

  embedder =
    await pipeline(

      "feature-extraction",

      "Xenova/all-MiniLM-L6-v2"
    );

  console.log(
    "Embedding model loaded"
  );
}

loadEmbeddingModel();


// =====================================
// DOCUMENT TYPE DETECTION
// =====================================
function detectDocumentType(text) {

  const lowerText =
    text.toLowerCase();


  // LEGAL DOCUMENT DETECTION
  if (

    lowerText.includes("agreement") ||

    lowerText.includes("contract") ||

  lowerText.includes(
    "legal notice"
  ) ||

  lowerText.includes(
    "court"
  ) ||

  lowerText.includes(
    "advocate"
  ) ||

  lowerText.includes(
    "petitioner"
  ) ||

  lowerText.includes(
    "respondent"
  ) ||

  lowerText.includes(
    "employment agreement"
  ) ||

  lowerText.includes(
    "confidentiality agreement"
  ) ||

  lowerText.includes(
    "non-disclosure agreement"
  )


  ) {

    return "Legal";
  }


  // RESUME DETECTION
  if (

    lowerText.includes("education") ||

    lowerText.includes("skills") ||

    lowerText.includes("projects") ||

    lowerText.includes("experience") ||

    lowerText.includes("certifications")

  ) {

    return "Resume";
  }


  // FINANCIAL DOCUMENT DETECTION
if (

  lowerText.includes("invoice") ||

  lowerText.includes("total amount") ||

  lowerText.includes("payment") ||

  lowerText.includes("bank") ||

  lowerText.includes("transaction") ||

  lowerText.includes("amount due")

) {

  return "Financial";
}
// MEDICAL DOCUMENT DETECTION

const medicalKeywords = [

  "prescription",

  "tablet",

  "capsule",

  "syrup",

  "ointment",

  "cream",

  "dosage",

  "doctor",

  "hospital",

  "clinic",

  "rx",

  "bid",

  "tid",

  "qid"
];


const matchedMedicalKeywords =

  medicalKeywords.filter(
    keyword =>

      lowerText.includes(keyword)
  );


// SMART PRESCRIPTION DETECTION
const hasMedicinePattern =

  /\d+\s?(mg|ml)/i.test(text);


if (

  matchedMedicalKeywords.length >= 2 ||

  hasMedicinePattern

) {

  return "Medical";
}

  return "Generic";
}


// =====================================
// TEXT CHUNKING
// =====================================
function createChunks(text, chunkSize = 500) {

  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {

    chunks.push(
      text.substring(i, i + chunkSize)
    );
  }

  return chunks;
}


// =====================================
// GENERIC DOCUMENT PARSER
// =====================================
function parseDocument(text) {

  const lines = text
    .split("\n")
    .filter(line => line.trim() !== "");

  const sections = lines.filter(line =>
    line === line.toUpperCase() &&
    line.length < 50
  );

  const emails =
    text.match(/\S+@\S+/g) || [];

  const phones =
    text.match(/\d{10}/g) || [];

  const cleanedText = text
    .replace(/\r/g, "")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  const preview =
    cleanedText.substring(0, 1000);

  return {
    sections,
    emails,
    phones,
    preview
  };
}


// =====================================
// AI SUMMARY USING GROQ
// =====================================
async function generateSummary(text) {

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [
        {
          role: "system",
          content:
            "You are an AI document analyzer."
        },
        {
          role: "user",
          content:
`
Analyze this document and provide:

1. Short overview
2. Main topics
3. Important details
4. Key insights
5. Final concise summary

Document:

${text}
`
        }
      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion.choices[0].message.content;
}
// =====================================
// AI RESUME ANALYZER
// =====================================
async function analyzeResume(text) {

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content:
            "You are an expert ATS resume analyzer and recruiter."
        },

        {
          role: "user",

          content:
`
Analyze this resume and provide:

1. Resume Score (out of 100)
2. Technical Skills
3. Strengths
4. Weaknesses
5. Missing Skills
6. ATS Improvement Suggestions
7. Final Hiring Impression

Resume:

${text}
`
        }

      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion
    .choices[0]
    .message
    .content;
}
// =====================================
// AI LEGAL ANALYZER
// =====================================
async function analyzeLegalDocument(text) {

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content:
            "You are an expert legal document analyzer."
        },

        {
          role: "user",

          content:
`
Analyze this legal document and provide:

1. Document Type
2. Important Clauses
3. Obligations
4. Risks or Concerns
5. Important Dates
6. Compliance Issues
7. Final Legal Summary

Document:

${text}
`
        }

      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion
    .choices[0]
    .message
    .content;
}
// =====================================
// AI FINANCIAL ANALYZER
// =====================================
async function analyzeFinancialDocument(text) {

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content:
            "You are an expert financial document analyzer."
        },

        {
          role: "user",

          content:
`
Analyze this financial document and provide:

1. Financial Document Type
2. Important Amounts
3. Payment Details
4. Due Dates
5. Vendor or Client Information
6. Financial Risks or Issues
7. Final Financial Summary

Document:

${text}
`
        }

      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion
    .choices[0]
    .message
    .content;
}
// =====================================
// AI MEDICAL ANALYZER
// =====================================
async function analyzeMedicalDocument(text) {

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content:
            "You are an expert medical prescription translator."
        },

        {
          role: "user",

          content:
`
Analyze this medical prescription and provide:

1. Patient Information
2. Medicines Mentioned
3. Dosage Instructions
4. Timing Instructions
5. Important Precautions
6. Simple English Explanation
7. Final Health Summary

Prescription:

${text}
`
        }

      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion
    .choices[0]
    .message
    .content;
}

// =====================================
// SMART CHUNK RETRIEVAL
// =====================================

// =====================================
// SMART RAG RETRIEVAL
// =====================================
// =====================================
// COSINE SIMILARITY
// =====================================
function cosineSimilarity(a, b) {

  let dotProduct = 0;

  let normA = 0;

  let normB = 0;

  for (

    let i = 0;

    i < a.length;

    i++

  ) {

    dotProduct +=
      a[i] * b[i];

    normA +=
      a[i] * a[i];

    normB +=
      b[i] * b[i];
  }

  return (

    dotProduct /

    (

      Math.sqrt(normA) *

      Math.sqrt(normB)
    )
  );
}
// =====================================
// SEMANTIC RAG RETRIEVAL
// =====================================
async function getRelevantChunks(

  documentText,
  question

) {

  const chunks =
    documentText.match(
      /.{1,800}/g
    ) || [];


  // QUESTION EMBEDDING
  const questionEmbedding =
    await embedder(question, {

      pooling: "mean",

      normalize: true
    });

  const questionVector =
    Array.from(
      questionEmbedding.data
    );


  const scoredChunks = [];

  for (const chunk of chunks) {

    const chunkEmbedding =
      await embedder(chunk, {

        pooling: "mean",

        normalize: true
      });

    const chunkVector =
      Array.from(
        chunkEmbedding.data
      );

    const similarity =
      cosineSimilarity(

        questionVector,

        chunkVector
      );

    scoredChunks.push({

      chunk,

      similarity
    });
  }


  // SORT BEST MATCHES
  scoredChunks.sort(

    (a, b) =>

      b.similarity -
      a.similarity
  );


  // TOP CHUNKS
  const topChunks =
    scoredChunks

      .slice(0, 5)

      .map(item => item.chunk)

      .join("\n\n");


  return topChunks;
}
// =====================================
// AI QUESTION ANSWERING
// =====================================
async function askQuestion(documentText, question) {

  const relevantText =
  await getRelevantChunks(
    documentText,
    question
  );

  const chatCompletion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content:
            "You are an AI assistant. Use the provided document as the primary source.If the document does not contain enough information, you may use general knowledge, but clearly mention when the answer comes from general knowledge instead of the document."
        },

        {
          role: "user",

          content:
`
DOCUMENT:

${relevantText}

QUESTION:

${question}

Answer clearly and accurately based only on the document.
`
        }

      ],

      model: "llama-3.1-8b-instant"
    });

  return chatCompletion
    .choices[0]
    .message
    .content;
}


// =====================================
// MAIN UPLOAD ROUTE
// =====================================
router.post(
  "/",
  upload.single("file"),
  async (req, res) => {

    try {

      const file = req.file;

      if (!file) {

        return res.status(400).json({
          success: false,
          error: "No file uploaded"
        });
      }

      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      if (!allowedTypes.includes(file.mimetype)) {

        return res.status(400).json({
          success: false,
          error:
            "Only PDF, PNG, JPG, and DOCX files are supported"
        });
      }

      // =====================================
      // Upload to S3
      // =====================================
      const params = {

        Bucket: process.env.S3_BUCKET_NAME,

        Key: `${Date.now()}-${file.originalname}`,

        Body: file.buffer,

        ContentType: file.mimetype
      };

      const uploadResult = await s3
        .upload(params)
        .promise();


      // =====================================
      // EXTRACT TEXT
      // =====================================
      let extractedText = "";

      // =====================================
// =====================================
// PDF EXTRACTION
// =====================================
if (
  file.mimetype === "application/pdf"
) {

  try {

    const pdfData =
      await pdfParse(file.buffer);

    extractedText =
      pdfData.text;

    console.log(
      "PDF parsed using pdf-parse"
    );


    // IF EMPTY → TRY TEXTRACT
    if (

      !extractedText ||

      extractedText.trim().length < 20

    ) {

      console.log(
        "Low PDF text detected, trying Textract..."
      );

      try {

        const textractData =
          await textract
            .detectDocumentText({

              Document: {
                Bytes: file.buffer
              }
            })
            .promise();

        extractedText =
          textractData.Blocks

            .filter(block =>
              block.BlockType === "LINE"
            )

            .map(block => block.Text)

            .join("\n");

      } catch (textractError) {

        console.log(
          "Textract failed for this PDF"
        );
      }
    }

  } catch (pdfError) {

    console.log(
      "PDF parsing failed"
    );

    console.log(pdfError);

    return res.status(400).json({

      success: false,

      error:
        "Unsupported or corrupted PDF file"
    });
  }
}
   
// =====================================
// IMAGE EXTRACTION
// =====================================
else if (

  file.mimetype === "image/png" ||

  file.mimetype === "image/jpeg"

) {

  const textractData =
    await textract
      .detectDocumentText({

        Document: {
          Bytes: file.buffer
        }
      })
      .promise();

  extractedText =
    textractData.Blocks

      .filter(block =>
        block.BlockType === "LINE"
      )

      .map(block => block.Text)

      .join("\n");
}

      // DOCX
      else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {

        const result = await mammoth.extractRawText({
          buffer: file.buffer
        });

        extractedText = result.value;
      }


      // =====================================
      // DOCUMENT PROCESSING
      // =====================================
      const documentType =
        detectDocumentType(extractedText);

      const chunks =
        createChunks(extractedText);

      const structuredData =
        parseDocument(extractedText);

// =====================================
// AI SUMMARY
// =====================================

let summary = "";

if (

  documentType === "Resume"

) {

  summary =
    await analyzeResume(
      extractedText
    );

} else if (

  documentType === "Legal"

) {

  summary =
    await analyzeLegalDocument(
      extractedText
    );

} 
else if (

  documentType === "Financial"

) {

  summary =
    await analyzeFinancialDocument(
      extractedText
    );
}
else if (

  documentType === "Medical"

) {

  summary =
    await analyzeMedicalDocument(
      extractedText
    );
}
else {

  summary =
    await generateSummary(
      extractedText
    );
}
      // =====================================
// SAVE TO MONGODB
// =====================================
const savedDocument =
  await Document.create({

    fileName:
      file.originalname,

    documentType,

    fileUrl:
      uploadResult.Location,

    summary,

    documentText:
      extractedText,

    chunkCount:
      chunks.length,

    messages: []
  });

      // =====================================
      // FINAL RESPONSE
      // =====================================
      res.json({
        
        documentId:
            savedDocument._id,
        success: true,

        message:
          "Document processed successfully",

        documentType,

        fileUrl:
          uploadResult.Location,

        chunkCount:
          chunks.length,

        chunks,

        structuredData,

        summary,

        // FULL DOCUMENT CONTENT
        documentText:
          extractedText
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        error:
          "Document processing failed"
      });
    }
  }
);


// =====================================
// ASK QUESTIONS ABOUT DOCUMENT
// =====================================
router.post("/ask", async (req, res) => {

  try {

    const {
      documentId,
      documentText,
      question
    } = req.body;

    if (!documentText || !question) {

      return res.status(400).json({

        success: false,

        error:
          "Document text and question are required"
      });
    }

    const answer =
      await askQuestion(
        documentText,
        question
      );
      // SAVE CHAT TO DATABASE
if (documentId) {

  const document =
    await Document.findById(
      documentId
    );

  if (document) {

    document.messages.push({

      type: "user",

      text: question
    });

    document.messages.push({

      type: "ai",

      text: answer
    });

    await document.save();
  }
}

    res.json({

      success: true,

      answer
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      error:
        "Question answering failed"
    });
  }
});
// =====================================
// GET ALL DOCUMENTS
// =====================================
router.get("/documents", async (req, res) => {

  try {

    const documents =
      await Document.find()
      .sort({ uploadedAt: -1 });

    res.json({

      success: true,

      documents
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      error:
        "Failed to fetch documents"
    });
  }
});
// =====================================
// DELETE DOCUMENT
// =====================================

router.delete(

  "/documents/:id",

  async (req, res) => {

    try {

      await Document.findByIdAndDelete(

        req.params.id
      );

      res.json({

        success: true,

        message:
          "Document deleted successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        error:
          "Delete failed"
      });
    }
  }
);
module.exports = router;