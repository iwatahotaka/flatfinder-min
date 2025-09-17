const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/** owner check */
async function assertOwnerOrAdmin(user, flatId) {
  const [rows] = await pool.query('SELECT owner_id FROM flat_table WHERE id = ? LIMIT 1', [flatId]);
  const rec = rows[0];
  if (!rec) return { ok: false, status: 404, error: 'Flat not found' };
  if (user.is_admin || Number(user.id) === Number(rec.owner_id)) return { ok: true };
  return { ok: false, status: 403, error: 'Owner or admin only' };
}

/** sender check */
function assertSenderSelf(user, senderId) {
  if (user.is_admin || Number(user.id) === Number(senderId)) return { ok: true };
  return { ok: false, status: 403, error: 'Sender only' };
}

/** POST /flats/:id/messages */
router.post('/flats/:id/messages', requireAuth, async (req, res) => {
  try {
    const flatId = Number(req.params.id);
    const { content } = req.body || {};
    if (!flatId) return res.status(400).json({ ok:false, error:'Invalid flat id' });
    if (!content || !String(content).trim()) return res.status(400).json({ ok:false, error:'content is required' });

    // Flat
    const [exists] = await pool.query('SELECT id FROM flat_table WHERE id = ? LIMIT 1', [flatId]);
    if (exists.length === 0) return res.status(404).json({ ok:false, error:'Flat not found' });

    const [result] = await pool.query(
      `INSERT INTO message_table (content, flat_id, sender_id, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [content, flatId, req.user.id]
    );

    const [rows] = await pool.query(
      `SELECT id, content, flat_id, sender_id, createdAt
         FROM message_table WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    res.status(201).json({ ok:true, message: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

/** GET /flats/:id/messages */
router.get('/flats/:id/messages', requireAuth, async (req, res) => {
  try {
    const flatId = Number(req.params.id);
    if (!flatId) return res.status(400).json({ ok:false, error:'Invalid flat id' });

    const check = await assertOwnerOrAdmin(req.user, flatId);
    if (!check.ok) return res.status(check.status).json({ ok:false, error: check.error });

    const [rows] = await pool.query(
      `SELECT id, content, flat_id, sender_id, createdAt
         FROM message_table
        WHERE flat_id = ?
        ORDER BY id DESC`,
      [flatId]
    );
    res.json({ ok:true, messages: rows });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

/** GET /flats/:id/messages/:senderId */
router.get('/flats/:id/messages/:senderId', requireAuth, async (req, res) => {
  try {
    const flatId = Number(req.params.id);
    const senderId = Number(req.params.senderId);
    if (!flatId || !senderId) return res.status(400).json({ ok:false, error:'Invalid ids' });

    const check = assertSenderSelf(req.user, senderId);
    if (!check.ok) return res.status(check.status).json({ ok:false, error: check.error });

    const [rows] = await pool.query(
      `SELECT id, content, flat_id, sender_id, createdAt
         FROM message_table
        WHERE flat_id = ? AND sender_id = ?
        ORDER BY id DESC`,
      [flatId, senderId]
    );
    res.json({ ok:true, messages: rows });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

module.exports = router;
