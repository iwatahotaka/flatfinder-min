// src/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /users/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, birth_date } = req.body || {};
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be >= 6 chars' });
    }

    // Duplicate check
    const [exists] = await pool.query(
      'SELECT id FROM user_table WHERE email = ? LIMIT 1',
      [email]
    );
    if (exists.length > 0) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // 先生ルール: createdAt は INSERT 時に NOW() を明示
    const [result] = await pool.query(
      `INSERT INTO user_table (email, password_hash, first_name, last_name, birth_date, is_admin, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [email, password_hash, first_name || null, last_name || null, birth_date || null]
    );

    const user = { id: result.insertId, email, first_name, last_name, is_admin: 0 };

    // Issue JWT immediately
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({ ok: true, user, token });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /users/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM user_table WHERE email = ? LIMIT 1',
      [email]
    );
    const found = rows[0];
    if (!found) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, found.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: found.id, email: found.email, is_admin: !!found.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: found.id,
        email: found.email,
        first_name: found.first_name,
        last_name: found.last_name,
        is_admin: !!found.is_admin,
      },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /users/me (要ログイン)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, is_admin FROM user_table WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    const me = rows[0] || null;
    return res.json({ ok: true, me });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * GET /users (admin only)
 * - 普通ユーザー: 403 Forbidden を返す（これをスクショ）
 * - 管理者: ユーザー一覧を返す
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ ok: false, error: 'Only admin can access this endpoint' });
    }
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, is_admin, createdAt FROM user_table ORDER BY id DESC'
    );
    return res.json({ ok: true, users: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;