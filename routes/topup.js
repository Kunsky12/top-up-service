// routes/topup.js
const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

// Create a new top-up order

router.post("/create", async (req, res) => {
    const { playerId, pack, amount, type, paymentMethod } = req.body;

    if (!playerId || !pack || !amount || !paymentMethod) {
        return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    try {
        const code = await orderService.createOrder(playerId, type, pack, amount, paymentMethod);
        res.json({ success: true, orderCode: code });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

// Verify payment
router.post("/verify", async (req, res) => {
    const { code, amount } = req.body;
    if (!code || !amount) {
        return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    try {
        const success = await orderService.verifyPayment(code, amount);
        res.json({ success });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;