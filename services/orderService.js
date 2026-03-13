const { v4: uuidv4 } = require('uuid');
const repo = require('../repository/orderRepository');

function generateCode(){
    return "KK" + Math.floor(1000 + Math.random()*9000);
}

exports.createOrder = async (playerId, pack, amount)=>{

    const order = {
        playerId,
        pack,
        amount,
        code: generateCode(),
        status: "PENDING"
    };

    await repo.createOrder(order);

    return order;
};

exports.verifyPayment = async (code, amount)=>{

    const order = await repo.findByCode(code);

    if(!order) return false;
    if(order.status !== "PENDING") return false;
    if(order.amount != amount) return false;

    repo.markPaid(code);

    console.log("Coins delivered to player:", order.playerId);

    return true;
};
