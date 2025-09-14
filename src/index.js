require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const {
  PORT = 3000,
  MYSQL_HOST = 'mysql',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = 'rootpassword',
  MYSQL_DB = 'mydb'
} = process.env;

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
  waitForConnections: true
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'flatfinder-min-app', time: new Date().toISOString() });
});

app.get('/db-ping', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now;');
    res.json({ ok: true, dbTime: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
