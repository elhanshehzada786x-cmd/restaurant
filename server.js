// ============================================
// SPICE GARDEN - EXPRESS BACKEND SERVER
// ============================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// DATABASE SETUP (SQLite)
// ============================================
const dbPath = path.join(__dirname, 'bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('❌ Table error:', err.message);
    } else {
        console.log('✅ Bookings table ready');
    }
});

// ============================================
// ROUTES / API ENDPOINTS
// ============================================

// Home route
app.get('/', (req, res) => {
    res.json({ 
        message: '🍽️ Spice Garden Backend Running',
        status: 'OK',
        endpoints: [
            'POST /api/bookings',
            'GET /api/bookings',
            'DELETE /api/bookings/:id'
        ]
    });
});

// CREATE - New booking
app.post('/api/bookings', (req, res) => {
    const { name, phone, email, date, time, guests, message } = req.body;

    if (!name || !phone || !email || !date || !time || !guests) {
        return res.status(400).json({ 
            error: 'Please fill all required fields' 
        });
    }

    const sql = `
        INSERT INTO bookings (name, phone, email, date, time, guests, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, phone, email, date, time, guests, message || null], function(err) {
        if (err) {
            console.error('❌ Insert error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log(`✅ Booking created: ID ${this.lastID}`);

        res.status(201).json({
            success: true,
            message: 'Booking confirmed!',
            bookingId: this.lastID
        });
    });
});

// READ - Get all bookings
app.get('/api/bookings', (req, res) => {
    const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Fetch error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json({
            success: true,
            count: rows.length,
            bookings: rows
        });
    });
});

// DELETE - Remove booking
app.delete('/api/bookings/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM bookings WHERE id = ?', id, function(err) {
        if (err) {
            console.error('❌ Delete error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        console.log(`✅ Booking deleted: ID ${id}`);

        res.json({
            success: true,
            message: 'Booking deleted'
        });
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║  🍽️  SPICE GARDEN BACKEND SERVER      ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running: http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('');
});