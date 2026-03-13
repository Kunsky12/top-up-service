const db = require('../db');

exports.createOrder = (order) => {
    return new Promise((resolve, reject) => {

        const query = `
        INSERT INTO orders(playerId, pack, amount, code, status, createdAt)
        VALUES(?,?,?,?,?,?)
        `;

        db.run(query,
            [
                order.playerId,
                order.pack,
                order.amount,
                order.code,
                order.status,
                Date.now()
            ],
            function(err){
                if(err) reject(err);
                resolve(order);
            }
        );
    });
};

exports.findByCode = (code) => {
    return new Promise((resolve,reject)=>{

        db.get(
            "SELECT * FROM orders WHERE code = ?",
            [code],
            (err,row)=>{
                if(err) reject(err);
                resolve(row);
            }
        );

    });
};

exports.markPaid = (code) => {
    db.run(
        "UPDATE orders SET status='PAID', paidAt=? WHERE code=?",
        [Date.now(), code]
    );
};
