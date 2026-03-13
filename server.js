// server.js
const express = require("express");
const bodyParser = require("body-parser");
const topupRoutes = require("./routes/topup");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/topup", topupRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Top-up service running on http://localhost:${PORT}`);
});