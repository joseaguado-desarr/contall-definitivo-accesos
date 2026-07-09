import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../lib/db.js';

const router = express.Router();

// Get all visits
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM visits ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching visits' });
  }
});

// Create visit
router.post('/', async (req, res) => {
  const { visitor_name, visitor_document, visitor_phone, vehicle_plate, host_id, host_name, reason, status, created_by } = req.body;
  const id = uuidv4();

  try {
    await pool.execute(
      'INSERT INTO visits (id, visitor_name, visitor_document, visitor_phone, vehicle_plate, host_id, host_name, reason, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, visitor_name, visitor_document, visitor_phone, vehicle_plate, host_id, host_name, reason, status || 'inside', created_by || null]
    );
    const [rows] = await pool.execute('SELECT * FROM visits WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating visit' });
  }
});

// Update visit status/exit
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, exit_time } = req.body;

  try {
    await pool.execute(
      'UPDATE visits SET status=?, exit_time=? WHERE id=?',
      [status, exit_time, id]
    );
    const [rows] = await pool.execute('SELECT * FROM visits WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating visit' });
  }
});

export default router;
