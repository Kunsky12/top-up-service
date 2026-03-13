const TelegramBot = require('node-telegram-bot-api');
const orderService = require('./orderService');

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling:true });

bot.on("message", async (msg)=>{

    const text = msg.text || "";

    console.log("Telegram:", text);

    const amountMatch = text.match(/\$([0-9.]+)/);
    const codeMatch = text.match(/KK\d{4}/);

    if(!amountMatch || !codeMatch) return;

    const amount = parseFloat(amountMatch[1]);
    const code = codeMatch[0];

    const success = await orderService.verifyPayment(code, amount);

    if(success){
        console.log("Payment verified:", code);
    }

});

module.exports = bot;
