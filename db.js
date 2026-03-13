// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./orders.db');

// Step 1: Create the table if it doesn't exist (without 'type' column)
db.serialize(() => {
    db.run(`
        CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playerId TEXT,
        type TEXT,
        pack TEXT,
        amount REAL,
        code TEXT UNIQUE,
        status TEXT,
        paymentMethod TEXT,
        createdAt INTEGER,
        paidAt INTEGER
    );
    `, (err) => {
        if (err) console.error("Failed to create orders table:", err.message);
    });

    // Step 2: Check if 'type' column exists
    db.all(`PRAGMA table_info(orders)`, (err, columns) => {
        if (err) {
            console.error("Failed to fetch table info:", err.message);
            return;
        }

        const hasTypeColumn = columns.some(col => col.name === 'type');
        if (!hasTypeColumn) {
            // Step 3: Add 'type' column safely
            db.run(`ALTER TABLE orders ADD COLUMN type TEXT DEFAULT 'coins'`, (err) => {
                if (err) {
                    console.error("Failed to add 'type' column:", err.message);
                } else {
                    console.log("✅ Added 'type' column to orders table");
                }
            });
        }
    });
});

module.exports = db;