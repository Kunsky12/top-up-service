// server.js
const express = require("express");
const bodyParser = require("body-parser");
const topupRoutes = require("./routes/topup");
const cors = require("cors");

const app = express(); // <-- define app first

app.use(cors()); // allow all origins for testing
app.use(bodyParser.json());

// Routes
app.use("/topup", topupRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));