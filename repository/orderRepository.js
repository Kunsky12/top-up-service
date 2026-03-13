const db = require('../db'); // your sqlite3 database instance

// Create a new order
exports.create = (order) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO orders(playerId, pack, amount, code, status, createdAt)
        VALUES(?,?,?,?,?,?)
        `;
        db.run(
            query,
            [
                order.playerId,
                order.pack,
                order.amount,
                order.code,
                order.status,
                Date.now()
            ],
            function(err) {
                if (err) return reject(err);
                resolve(order); // resolve with the inserted order object
            }
        );
    });
};

// Find order by code
exports.findByCode = (code) => {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM orders WHERE code = ?",
            [code],
            (err, row) => {
                if (err) return reject(err);
                resolve(row);
            }
        );
    });
};

// Mark order as paid
exports.markPaid = (code) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE orders SET status='PAID', paidAt=? WHERE code=?",
            [Date.now(), code],
            function(err) {
                if (err) return reject(err);
                resolve(true);
            }
        );
    });
};

// Optional: get all orders (for debugging)
exports.getAll = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM orders", [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};