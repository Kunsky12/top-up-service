const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db');

db.run(`
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerId TEXT,
    pack TEXT,
    amount REAL,
    code TEXT UNIQUE,
    status TEXT,
    createdAt INTEGER,
    paidAt INTEGER
)
`);

module.exports = db;
