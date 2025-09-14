require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { pool } = require('./db');

const usersRouter = require('./routes/users');
const flatsRouter = require('./routes/flats');
const messagesRouter = require('./routes/messages');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

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

app.use('/users', usersRouter);
app.use('/flats', flatsRouter);
app.use('/', messagesRouter); // messagesはフルパスで定義

app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
