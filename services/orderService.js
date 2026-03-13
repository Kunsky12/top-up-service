// topupService.js
const repo = require("../repository/orderRepository");
const playfab = require("./playfabService");
const telegram = require("./telegramService");

// Helper: format timestamp for display
function formatDate(ts) {
    const date = new Date(ts);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ` +
           `${date.getHours() % 12 || 12}:${date.getMinutes().toString().padStart(2, '0')} ` +
           `${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

// Generate safe unique 4-digit order code
async function generate4DigitCode() {
    let code;
    let exists = true;

    while (exists) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const order = await repo.findByCode(code);
        if (!order) exists = false; // unique
    }

    return code;
}

// Create a new order
exports.createOrder = async (playerId, type, pack, amount, paymentMethod) => {

    let created = false;
    let code;

    const createdAt = Date.now();

    while (!created) {

        code = await generate4DigitCode();

        try {

            await repo.create({
                playerId,
                type,
                pack,
                amount,
                code,
                status: "PENDING",
                paymentMethod,
                createdAt
            });

            created = true;

        } catch (err) {

            if (err.message.includes("UNIQUE constraint failed")) {
                console.log("Duplicate code generated, retrying...");
            } else {
                throw err;
            }

        }

    }

        const formattedCreatedAt = formatDate(createdAt);

        await telegram.sendMessage(
        `🕒 *Pending Order*\n` +
        `Player ID: ${playerId}\n` +
        `Type: ${type}\n` +
        `Pack: ${pack}\n` +
        `Amount: $${amount}\n` +
        `Payment Method: ${paymentMethod}\n` +
        `Order Code: ${code}\n` +
        `Ordered Date: ${formattedCreatedAt}`
    );

    return code;
};

exports.verifyPayment = async (code, amount) => {
    const order = await repo.findByCode(code);

    if (!order) {
            await telegram.sendMessage(
                `❌ Order not found\nCode: ${code}`
            );
            return false;
        }

        if (order.status !== "PENDING") {
            await telegram.sendMessage(
                `❌ Order already paid or invalid\nCode: ${code}`
            );
            return false;
        }

        if (order.amount != amount) {
            await telegram.sendMessage(
                `❌ Amount mismatch\nCode: ${code}\nExpected: $${order.amount}, Received: $${amount}`
            );
            return false;
        }


    // Record payment time
    const paidAt = Date.now();

    // Mark order as paid
    await repo.markPaid(code, { paymentMethod: order.paymentMethod, paidAt });

    const formattedPaidAt = formatDate(paidAt);

    if (order.type === "RP") {
        let coins = 0;
        switch (order.pack) {
            case "500 RP": coins = 550; break;
            case "1500 RP": coins = 1700; break;
            case "3000 RP": coins = 3400; break;
            case "6000 RP": coins = 6800; break;
            default: coins = 0; break;
        }

        console.log("Player ID =" + order.playerId);

        await playfab.addCoins(order.playerId, coins);

        await telegram.sendMessage(
        `✅ *Top-Up Success*
        Player ID: ${order.playerId}
        Coins Pack: ${order.pack}
        Amount: $${order.amount}
        Coins Received: ${coins}
        Order Code: ${order.code}
        Paid At: ${formattedPaidAt}`
                );

            } else if (order.type === "vipmembership") {
                await playfab.addVipMembership(order.playerId);

        await telegram.sendMessage(
        `👑 **VIP Activated*
        Player ID: ${order.playerId}
        Granted Bonus: 550 RP
        Amount: $${order.amount}
        Order Code: ${order.code}
        Paid At: ${formattedPaidAt}`
                );
            }

    return true;
};