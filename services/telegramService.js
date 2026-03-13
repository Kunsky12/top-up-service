// services/telegramService.js
const TelegramBot = require('node-telegram-bot-api');
const orderService = require('./orderService'); // <-- missing import
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (!token || !GROUP_CHAT_ID) {
    console.warn("Telegram bot token or group chat ID not set!");
}

// Enable polling so bot can READ messages
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {

    const text = msg.text || "";

    console.log("Telegram:", text);

    // Detect amount
    let amountMatch =
        text.match(/\$([0-9.]+)/) ||
        text.match(/Received\s([0-9.]+)\sUSD/i);

    // Detect order code (ABA / ACLEDA)
    const codeMatch =
        text.match(/Remark:\s*(\d{3,6})/i) ||
        text.match(/Purpose:\s*(\d{3,6})/i);

    // Detect transaction ID
    const trxMatch =
        text.match(/Trx\.?\sID:\s*([0-9]+)/i) ||   // ABA
        text.match(/Ref\.?ID:\s*([0-9]+)/i);       // ACLEDA

    if (!amountMatch || !codeMatch) {
        console.log("Message ignored");
        return;
    }

    const amount = parseFloat(amountMatch[1]);
    const code = codeMatch[1];

    try {

        await orderService.verifyPayment(code, amount);

    } catch(err){

        console.error("Verification error:", err);

    }

});

// send message function (used by orderService)
exports.sendMessage = async (text) => {
    try {
        const res = await bot.sendMessage(
            GROUP_CHAT_ID,
            text,
        );

        console.log("Message sent:", res.text);

    } catch (err) {

        console.error("Telegram send failed:", err.message);

    }

};