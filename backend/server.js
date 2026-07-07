require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log4js = require('log4js');

log4js.configure({
    appenders: { console: { type: 'console', layout: { type: 'pattern', pattern: '%m' } } },
    categories: { default: { appenders: ['console'], level: 'info' } }
});
const logger = log4js.getLogger('API-Server');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                token VARCHAR(512) DEFAULT NULL
            );
        `);
        
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [process.env.ADMIN_EMAIL]);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [process.env.ADMIN_EMAIL, hashedPassword]);
            console.log('Default user created successfully.');
        } else {
            console.log('Database connected and verified.');
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}
initializeDatabase();

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed or email already exists' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        await pool.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

        logger.info(JSON.stringify({
            timestamp: new Date().toISOString(),
            userId: user.id,
            action: 'LOGIN',
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
        }));

        res.json({ message: 'Logged in successfully!', token });
    } catch (error) {
        res.status(500).json({ error: 'Login process failed' });
    }
});

app.get('/api/protected', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });

    try {
        jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await pool.query('SELECT * FROM users WHERE token = ?', [token]);
        if (rows.length === 0) return res.status(403).json({ error: 'Invalid or revoked token' });

        res.json({ message: 'You have accessed protected data!', user: rows[0].email });
    } catch (error) {
        res.status(403).json({ error: 'Token is invalid or expired' });
    }
});

app.listen(3000, () => console.log('Server on port 3000'));