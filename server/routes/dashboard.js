import express from 'express';
import pool from '../lib/db.js';

const router = express.Router();

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace('T', ' ');

    const [personsCount] = await pool.execute('SELECT COUNT(*) as count FROM persons WHERE status = "active"');
    const [visitorsCount] = await pool.execute('SELECT COUNT(*) as count FROM visits WHERE entry_time >= ?', [todayStr]);
    const [insideCount] = await pool.execute('SELECT COUNT(*) as count FROM visits WHERE status = "inside"');
    const [alertsCount] = await pool.execute('SELECT COUNT(*) as count FROM access_logs WHERE result = "denied" AND created_at >= ?', [todayStr]);

    res.json({
      totalPersons: personsCount[0].count,
      visitorsToday: visitorsCount[0].count,
      insideNow: insideCount[0].count,
      alerts: alertsCount[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// Get Recent Activity
router.get('/recent', async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT 
        l.id, l.direction, l.method, l.result, l.created_at,
        p.first_name, p.last_name,
        v.visitor_name
      FROM access_logs l
      LEFT JOIN persons p ON l.person_id = p.id
      LEFT JOIN visits v ON l.visit_id = v.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching recent activity' });
  }
});

export default router;
