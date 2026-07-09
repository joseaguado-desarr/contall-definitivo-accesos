import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../lib/db.js';

const router = express.Router();

// Register Access Log
router.post('/', async (req, res) => {
  try {
    const { person_id, visit_id, method, result, direction, notes } = req.body;
    const id = uuidv4();
    
    await pool.execute(
      'INSERT INTO access_logs (id, person_id, visit_id, method, result, direction, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, person_id || null, visit_id || null, method, result, direction, notes || null]
    );

    res.status(201).json({ id, message: 'Access logged' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Access Logs with filters
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `
      SELECT 
        l.*,
        p.first_name, p.last_name,
        v.visitor_name
      FROM access_logs l
      LEFT JOIN persons p ON l.person_id = p.id
      LEFT JOIN visits v ON l.visit_id = v.id
    `;
    let params = [];

    if (from || to) {
      query += ' WHERE ';
      if (from && to) {
        query += 'l.created_at BETWEEN ? AND ?';
        params.push(`${from} 00:00:00`, `${to} 23:59:59`);
      } else if (from) {
        query += 'l.created_at >= ?';
        params.push(`${from} 00:00:00`);
      } else if (to) {
        query += 'l.created_at <= ?';
        params.push(`${to} 23:59:59`);
      }
    }

    query += ' ORDER BY l.created_at DESC LIMIT 200';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
