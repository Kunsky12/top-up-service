const db = require('../db');

exports.create = (order) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO orders(playerId, type, pack, amount, code, status, paymentMethod, createdAt)
            VALUES(?,?,?,?,?,?,?,?)
        `;
        db.run(
        query,
        [
            order.playerId,            // playerId
            order.type || "RP",     // type (default COINS)
            order.pack,                // pack
            order.amount,              // amount
            order.code,                // code
            order.status,              // status
            order.paymentMethod,       // paymentMethod
            order.createdAt || Date.now() // createdAt
        ],
        function(err){
            if(err) return reject(err);
            resolve(order);
        }
    );
    });
};

exports.findByCode = (code) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM orders WHERE code = ?",
            [code],
            (err, row) => {
                if(err) return reject(err);
                resolve(row);
            }
        );
    });
};

exports.markPaid = (code, { paymentMethod }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE orders 
             SET status='PAID', paidAt=?, paymentMethod=? 
             WHERE code=?`,
            [Date.now(), paymentMethod, code],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes); // number of rows updated
            }
        );
    });
};

// Optional: get all orders (for debugging)
exports.getAll = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM orders", [], (err, rows) => {
            if(err) return reject(err);
            resolve(rows);
        });
    });
};