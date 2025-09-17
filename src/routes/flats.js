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

/** GET /flats  list */
router.get('/', requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id
       FROM flat_table ORDER BY id DESC`
    );
    res.json({ ok: true, flats: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** GET /flats/:id  detail */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok:false, error:'Invalid id' });
    const [rows] = await pool.query(
      `SELECT id, city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id
       FROM flat_table WHERE id = ? LIMIT 1`, [id]
    );
    res.json({ ok: true, flat: rows[0] || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** POST /flats  create */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      city, street_name, street_number,
      area_size, has_ac, year_built, rent_price, date_available
    } = req.body || {};

    if (!city || !street_name || !street_number) {
      return res.status(400).json({ ok:false, error:'city, street_name, street_number are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO flat_table
        (city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        city, street_name, street_number,
        typeof area_size === 'number' ? area_size : null,
        has_ac ? 1 : 0,
        typeof year_built === 'number' ? year_built : null,
        typeof rent_price === 'number' ? rent_price : null,
        date_available || null,
        req.user.id
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id
       FROM flat_table WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    res.status(201).json({ ok:true, flat: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

/** PATCH /flats/:id  edit */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok:false, error:'Invalid id' });

    const check = await assertOwnerOrAdmin(req.user, id);
    if (!check.ok) return res.status(check.status).json({ ok:false, error: check.error });

    const {
      city, street_name, street_number,
      area_size, has_ac, year_built, rent_price, date_available
    } = req.body || {};

    const fields = [];
    const params = [];
    if (typeof city          !== 'undefined') { fields.push('city=?');           params.push(city); }
    if (typeof street_name   !== 'undefined') { fields.push('street_name=?');    params.push(street_name); }
    if (typeof street_number !== 'undefined') { fields.push('street_number=?');  params.push(street_number); }
    if (typeof area_size     !== 'undefined') { fields.push('area_size=?');      params.push(area_size); }
    if (typeof has_ac        !== 'undefined') { fields.push('has_ac=?');         params.push(has_ac ? 1 : 0); }
    if (typeof year_built    !== 'undefined') { fields.push('year_built=?');     params.push(year_built); }
    if (typeof rent_price    !== 'undefined') { fields.push('rent_price=?');     params.push(rent_price); }
    if (typeof date_available!== 'undefined') { fields.push('date_available=?'); params.push(date_available); }

    if (fields.length === 0) return res.status(400).json({ ok:false, error:'No updatable fields' });

    params.push(id);
    await pool.query(`UPDATE flat_table SET ${fields.join(', ')} WHERE id = ? LIMIT 1`, params);

    const [rows] = await pool.query(
      `SELECT id, city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id
       FROM flat_table WHERE id = ? LIMIT 1`, [id]
    );
    res.json({ ok:true, flat: rows[0] || null });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

/** DELETE /flats/:id  delete */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok:false, error:'Invalid id' });

    const check = await assertOwnerOrAdmin(req.user, id);
    if (!check.ok) return res.status(check.status).json({ ok:false, error: check.error });

    await pool.query('DELETE FROM flat_table WHERE id = ? LIMIT 1', [id]);
    res.json({ ok:true, deletedId: id });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

module.exports = router;
