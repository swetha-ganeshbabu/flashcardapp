const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

const FILE_NAME = "flashcards.json";

// Middleware
app.use(bodyParser.json());
app.use(express.static(".")); // Serve static files (index.html, app.js, etc.)

// Ensure the file exists
if (!fs.existsSync(FILE_NAME)) {
  fs.writeFileSync(FILE_NAME, JSON.stringify([]), "utf8"); // Initialize with an empty array
}

// API to get flashcards
app.get("/flashcards", (req, res) => {
  const data = fs.readFileSync(FILE_NAME, "utf8");
  res.json(JSON.parse(data));
});

// API to save flashcards
app.post("/flashcards", (req, res) => {
  const flashcards = req.body;
  fs.writeFileSync(FILE_NAME, JSON.stringify(flashcards, null, 2), "utf8");
  res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});