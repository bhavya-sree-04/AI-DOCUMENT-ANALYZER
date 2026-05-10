const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

  type: String,

  text: String

});


const documentSchema = new mongoose.Schema({

  fileName: {

    type: String,

    required: true
  },

  documentType: String,

  fileUrl: String,

  summary: String,

  documentText: String,

  chunkCount: Number,

  messages: [messageSchema],

  uploadedAt: {

    type: Date,

    default: Date.now
  }

});

module.exports = mongoose.model(
  "Document",
  documentSchema
);