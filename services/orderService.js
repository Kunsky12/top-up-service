const repo = require("../repository/orderRepository");
const playfab = require("./playfabService");
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const bot = new TelegramBot(token, { polling: false }); // polling false for sending only

const sendTelegram = async (text) => {
    if (!token || !ADMIN_CHAT_ID) return;
    try { await bot.sendMessage(ADMIN_CHAT_ID, text); }
    catch(err){ console.error("Telegram send failed:", err.message); }
};

// Create a new order
exports.createOrder = async (playerId, pack, amount) => {
    const code = `KK${Math.floor(1000 + Math.random()*9000)}`; // e.g., KK1234
    
    await repo.create({
        playerId,
        pack,
        amount,
        code,
        status: "PENDING",
        createdAt: Date.now()
    });

    // Notify admin: new pending order
    await sendTelegram(
        `🕒 New pending order:\nPlayer: ${playerId}\nPack: ${pack}\nAmount: $${amount}\nOrder Code: ${code}`
    );

    return code;
};

// Verify payment
exports.verifyPayment = async (code, amount) => {
    const order = await repo.findByCode(code);
    if (!order) return false;
    if (order.status !== "PENDING") return false;
    if (order.amount != amount) return false;

    await repo.markPaid(code);

    // Determine coins
    let coins = 0;
    switch(order.pack){
        case "500": coins = 550; break;
        case "1500": coins = 1700; break;
        case "3000": coins = 3400; break;
        case "6000": coins = 6800; break;
    }

    await playfab.addCoins(order.playerId, coins);

    // Notify admin: successful top-up
    await sendTelegram(
        `✅ Payment succeeded:\nPlayer: ${order.playerId}\nPack: ${order.pack}\nAmount: $${order.amount}\nCoins: ${coins}\nOrder Code: ${order.code}`
    );

    return true;
};