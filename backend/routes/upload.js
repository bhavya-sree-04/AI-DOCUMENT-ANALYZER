const express = require("express");
const multer = require("multer");
const s3 = require("../config/aws");
const AWS = require("aws-sdk");
const mammoth = require("mammoth");
const Groq = require("groq-sdk");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

const textract = new AWS.Textract();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


// =====================================
// DOCUMENT TYPE DETECTION
// =====================================
function detectDocumentType(text) {

  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("education") &&
    lowerText.includes("experience")
  ) {
    return "Resume";
  }

  if (
    lowerText.includes("invoice") ||
    lowerText.includes("total amount")
  ) {
    return "Invoice";
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

      // PDF / IMAGE
      if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg"
      ) {

        const textractData = await textract
          .detectDocumentText({
            Document: {
              Bytes: file.buffer
            }
          })
          .promise();

        extractedText = textractData.Blocks
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
      const summary =
        await generateSummary(extractedText);


      // =====================================
      // FINAL RESPONSE
      // =====================================
      res.json({

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

        summary
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

module.exports = router;