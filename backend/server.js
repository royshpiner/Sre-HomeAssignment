const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'app_db'
});

app.get('/api/health', (req, res) => {
    pool.query('SELECT 1', (error) => {
        if (error) return res.status(500).send('DB Error');
        res.send('Backend and DB connected');
    });
});

app.listen(3000, () => console.log('Server on port 3000'));