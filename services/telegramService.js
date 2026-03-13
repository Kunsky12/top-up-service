const TelegramBot = require('node-telegram-bot-api');
const orderService = require('./orderService');

const token = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

const bot = new TelegramBot(token, { polling:true });

bot.on("message", async (msg) => {
    const text = msg.text || "";
    console.log("Telegram message:", text);

    const amountMatch = text.match(/\$([0-9.]+)/);
    const codeMatch = text.match(/KK\d{4}/);

    if(!amountMatch || !codeMatch) return;

    const amount = parseFloat(amountMatch[1]);
    const code = codeMatch[0];

    try {
        const success = await orderService.verifyPayment(code, amount);

        if(success){
            bot.sendMessage(msg.chat.id, `✅ Payment verified for order ${code} ($${amount})`);
            if(ADMIN_CHAT_ID){
                bot.sendMessage(ADMIN_CHAT_ID, `Player topped up: Order ${code}, Amount $${amount}`);
            }
            console.log("Payment verified:", code);
        } else {
            bot.sendMessage(msg.chat.id, `❌ Payment verification failed for order ${code} ($${amount})`);
        }
    } catch (err) {
        console.error(err);
        bot.sendMessage(msg.chat.id, `⚠️ Error verifying payment: ${err.message}`);
    }
});

module.exports = bot;