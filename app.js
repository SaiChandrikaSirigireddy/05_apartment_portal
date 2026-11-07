// ==========================================================
// APARTMENT MANAGEMENT BACKEND SERVER (Node.js + Express + MySQL)
// Developer: S. Sai Chandrika
// Roll No: 25ATA05L40
// Topic: Apartment Management & Housing Portal
// ==========================================================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
// Default to Port 3002 so it runs independently alongside other projects
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------------
// MySQL Workbench Configuration
// (Change password below if your MySQL Workbench password differs)
// ----------------------------------------------------------
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password', // <-- CHANGE TO YOUR MYSQL WORKBENCH PASSWORD (e.g., 'root', '1234', '')
    database: 'apartment_db',
    multipleStatements: true
};

let db = null;
let isDbConnected = false;

// Fallback in-memory apartments array so the app NEVER crashes during faculty viva
let inMemoryApartments = [
    { apartment_id: 101, flat_no: 'Flat 302 - Block A', apartment_name: 'Green Valley Heights', bhk_type: '3 BHK', rent_price: 32000.00, location: 'Kurnool (Near GPCET)', status: 'Available' },
    { apartment_id: 102, flat_no: 'Flat 104 - Block B', apartment_name: 'Royal Palms Luxury Enclave', bhk_type: '2 BHK', rent_price: 24000.00, location: 'Hyderabad (Hitec City)', status: 'Occupied' },
    { apartment_id: 103, flat_no: 'Flat 501 - Penthouse', apartment_name: 'Skyline Horizon Towers', bhk_type: '4 BHK', rent_price: 65000.00, location: 'Bangalore (Whitefield)', status: 'Available' },
    { apartment_id: 104, flat_no: 'Flat 203 - Block C', apartment_name: 'Sai Balaji Residency', bhk_type: '2 BHK', rent_price: 18500.00, location: 'Kurnool (Nandyal Road)', status: 'Available' },
    { apartment_id: 105, flat_no: 'Flat 405 - Block A', apartment_name: 'Godrej Woods County', bhk_type: '3 BHK', rent_price: 38000.00, location: 'Hyderabad (Gachibowli)', status: 'Occupied' },
    { apartment_id: 106, flat_no: 'Studio 12 - Ground', apartment_name: 'Urban Prime Living', bhk_type: '1 BHK', rent_price: 12500.00, location: 'Bangalore (Electronic City)', status: 'Available' },
    { apartment_id: 107, flat_no: 'Flat 208 - Block D', apartment_name: 'Prestige Silver Crest', bhk_type: '3 BHK', rent_price: 42000.00, location: 'Hyderabad (Kondapur)', status: 'Available' },
    { apartment_id: 108, flat_no: 'Flat 101 - Block B', apartment_name: 'Sri Sai Nilayam Apartments', bhk_type: '2 BHK', rent_price: 16000.00, location: 'Kurnool (Joharapuram)', status: 'Maintenance' }
];

function connectToDatabase() {
    try {
        db = mysql.createConnection(dbConfig);
        db.connect((err) => {
            if (err) {
                console.warn('⚠️ [MySQL Notice]: Could not connect to MySQL Workbench database "apartment_db".');
                console.warn('   Reason:', err.message);
                console.warn('   Running in Fallback Demo Mode with in-memory storage (Demo will still work smoothly!).');
                console.warn('   Tip: Check your MySQL password in app.js and execute database.sql in Workbench.');
                isDbConnected = false;
            } else {
                console.log('✅ [MySQL Success]: Connected to MySQL Workbench database "apartment_db" successfully!');
                isDbConnected = true;
            }
        });

        db.on('error', (err) => {
            console.error('MySQL connection error:', err);
            isDbConnected = false;
        });
    } catch (e) {
        console.warn('⚠️ Running in fallback mode:', e.message);
        isDbConnected = false;
    }
}

connectToDatabase();

// ----------------------------------------------------------
// API ROUTES FOR APARTMENTS
// ----------------------------------------------------------

// 1. Connection status check
app.get('/api/status', (req, res) => {
    res.json({
        connected: isDbConnected,
        database: 'apartment_db',
        mode: isDbConnected ? 'MySQL Workbench Live' : 'Demo Mode (Offline Fallback)',
        developer: 'S. Sai Chandrika (25ATA05L40)'
    });
});

// 2. GET all apartments (with search & filter options)
app.get('/api/apartments', (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();
    const bhk = (req.query.bhk || '').trim();
    const status = (req.query.status || '').trim();

    if (isDbConnected) {
        let sql = 'SELECT * FROM apartments WHERE 1=1';
        let params = [];

        if (query) {
            sql += ' AND (apartment_name LIKE ? OR flat_no LIKE ? OR location LIKE ? OR apartment_id = ?)';
            params.push(`%${query}%`, `%${query}%`, `%${query}%`, isNaN(query) ? -1 : Number(query));
        }

        if (bhk) {
            sql += ' AND bhk_type = ?';
            params.push(bhk);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY apartment_id DESC';

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Error fetching apartments:', err);
                return res.status(500).json({ error: 'Database query error', details: err.message });
            }
            res.json(results);
        });
    } else {
        let filtered = [...inMemoryApartments];
        if (query) {
            filtered = filtered.filter(a =>
                a.apartment_name.toLowerCase().includes(query) ||
                a.flat_no.toLowerCase().includes(query) ||
                a.location.toLowerCase().includes(query) ||
                String(a.apartment_id) === query
            );
        }
        if (bhk) {
            filtered = filtered.filter(a => a.bhk_type === bhk);
        }
        if (status) {
            filtered = filtered.filter(a => a.status === status);
        }
        res.json(filtered);
    }
});

// 3. GET single apartment by ID
app.get('/api/apartments/:id', (req, res) => {
    const id = req.params.id;

    if (isDbConnected) {
        const sql = 'SELECT * FROM apartments WHERE apartment_id = ?';
        db.query(sql, [id], (err, results) => {
            if (err) return res.status(500).json({ error: 'Database query error' });
            if (results.length === 0) return res.status(404).json({ error: `Apartment #${id} not found!` });
            res.json(results[0]);
        });
    } else {
        const found = inMemoryApartments.find(a => String(a.apartment_id) === String(id));
        if (!found) return res.status(404).json({ error: `Apartment #${id} not found!` });
        res.json(found);
    }
});

// 4. POST: Add a new apartment
app.post('/api/apartments', (req, res) => {
    const { apartment_id, flat_no, apartment_name, bhk_type, rent_price, location, status } = req.body;

    if (!flat_no || !apartment_name || !bhk_type || rent_price === undefined || !location) {
        return res.status(400).json({ error: 'Flat No, Apartment Name, BHK Type, Rent Price, and Location are all required!' });
    }

    const priceNum = parseFloat(rent_price);
    if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ error: 'Please enter a valid positive rent price.' });
    }

    const currentStatus = status || 'Available';

    if (isDbConnected) {
        let sql = '';
        let params = [];
        if (apartment_id) {
            sql = 'INSERT INTO apartments (apartment_id, flat_no, apartment_name, bhk_type, rent_price, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
            params = [apartment_id, flat_no, apartment_name, bhk_type, priceNum, location, currentStatus];
        } else {
            sql = 'INSERT INTO apartments (flat_no, apartment_name, bhk_type, rent_price, location, status) VALUES (?, ?, ?, ?, ?, ?)';
            params = [flat_no, apartment_name, bhk_type, priceNum, location, currentStatus];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error inserting apartment:', err);
                return res.status(500).json({ error: 'Database insert failed: ' + err.message });
            }
            res.status(201).json({
                message: 'Apartment record added successfully to MySQL Workbench!',
                apartment_id: apartment_id || result.insertId
            });
        });
    } else {
        const newId = apartment_id ? Number(apartment_id) : (inMemoryApartments.length > 0 ? Math.max(...inMemoryApartments.map(a => a.apartment_id)) + 1 : 101);
        const newApt = {
            apartment_id: newId,
            flat_no,
            apartment_name,
            bhk_type,
            rent_price: priceNum,
            location,
            status: currentStatus
        };
        inMemoryApartments.unshift(newApt);
        res.status(201).json({
            message: 'Apartment added successfully (Demo fallback mode)!',
            apartment_id: newId
        });
    }
});

// 5. PUT: Update an existing apartment
app.put('/api/apartments/:id', (req, res) => {
    const id = req.params.id;
    const { flat_no, apartment_name, bhk_type, rent_price, location, status } = req.body;

    if (!flat_no || !apartment_name || !bhk_type || rent_price === undefined || !location) {
        return res.status(400).json({ error: 'All fields are required to update an apartment.' });
    }

    const priceNum = parseFloat(rent_price);
    if (isNaN(priceNum)) {
        return res.status(400).json({ error: 'Please enter a valid numeric rent price.' });
    }

    const currentStatus = status || 'Available';

    if (isDbConnected) {
        const sql = 'UPDATE apartments SET flat_no = ?, apartment_name = ?, bhk_type = ?, rent_price = ?, location = ?, status = ? WHERE apartment_id = ?';
        db.query(sql, [flat_no, apartment_name, bhk_type, priceNum, location, currentStatus, id], (err, result) => {
            if (err) {
                console.error('Error updating apartment:', err);
                return res.status(500).json({ error: 'Database update failed: ' + err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Apartment ID #${id} not found in database.` });
            }
            res.json({ message: `Apartment #${id} updated successfully in MySQL Workbench!` });
        });
    } else {
        const index = inMemoryApartments.findIndex(a => String(a.apartment_id) === String(id));
        if (index === -1) {
            return res.status(404).json({ error: `Apartment ID #${id} not found.` });
        }
        inMemoryApartments[index] = {
            apartment_id: Number(id),
            flat_no,
            apartment_name,
            bhk_type,
            rent_price: priceNum,
            location,
            status: currentStatus
        };
        res.json({ message: `Apartment #${id} updated successfully (Demo fallback mode)!` });
    }
});

// 6. DELETE: Remove / Delete an apartment
app.delete('/api/apartments/:id', (req, res) => {
    const id = req.params.id;

    if (isDbConnected) {
        const sql = 'DELETE FROM apartments WHERE apartment_id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error deleting apartment:', err);
                return res.status(500).json({ error: 'Database delete failed: ' + err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Apartment ID #${id} does not exist.` });
            }
            res.json({ message: `Apartment #${id} deleted successfully from MySQL database!` });
        });
    } else {
        const beforeLen = inMemoryApartments.length;
        inMemoryApartments = inMemoryApartments.filter(a => String(a.apartment_id) !== String(id));
        if (inMemoryApartments.length === beforeLen) {
            return res.status(404).json({ error: `Apartment ID #${id} not found.` });
        }
        res.json({ message: `Apartment #${id} deleted successfully (Demo fallback mode)!` });
    }
});

// Fallback to index.html for SPA-style browsing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏢 APARTMENT MANAGEMENT PORTAL STARTED`);
    console.log(`👩‍💻 Developer: S. Sai Chandrika (Roll No: 25ATA05L40)`);
    console.log(`🌐 Website URL: http://localhost:${PORT}`);
    console.log(`📂 Public Folder: ${path.join(__dirname, 'public')}`);
    console.log(`=======================================================`);
});
