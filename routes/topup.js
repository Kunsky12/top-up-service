const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

router.post("/create", async (req,res)=>{

    const { playerId, pack, amount } = req.body;

    const order = await orderService.createOrder(playerId, pack, amount);

    res.json(order);
});

module.exports = router;
