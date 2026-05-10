const express = require("express");
const cors = require("cors");
require("dotenv").config();

const uploadRoute = require("./routes/upload");

const connectDB = require("./config/db");
const app = express();
connectDB();



app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoute);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});