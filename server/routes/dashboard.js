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

// Get Charts Data
router.get('/charts', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace('T', ' ');

    // 1. Hourly Flow Today
    const [logsToday] = await pool.execute(`
      SELECT direction, HOUR(created_at) as hour 
      FROM access_logs 
      WHERE created_at >= ?
    `, [todayStr]);

    const [visitsToday] = await pool.execute(`
      SELECT HOUR(entry_time) as entry_hour, HOUR(exit_time) as exit_hour
      FROM visits 
      WHERE entry_time >= ?
    `, [todayStr]);

    const hourlyData = [];
    for (let i = 6; i <= 22; i += 2) {
      let entries = 0;
      let exits = 0;
      
      logsToday.forEach(log => {
        if (log.hour >= i && log.hour < i + 2) {
          if (log.direction === 'entry') entries++;
          if (log.direction === 'exit') exits++;
        }
      });
      visitsToday.forEach(v => {
        if (v.entry_hour !== null && v.entry_hour >= i && v.entry_hour < i + 2) entries++;
        if (v.exit_hour !== null && v.exit_hour >= i && v.exit_hour < i + 2) exits++;
      });

      hourlyData.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        entries,
        exits
      });
    }

    // 2. Weekly Data (Last 7 days)
    const [weeklyLogs] = await pool.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM access_logs 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
    `);
    const [weeklyVisits] = await pool.execute(`
      SELECT DATE(entry_time) as date, COUNT(*) as count 
      FROM visits 
      WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(entry_time)
    `);

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyMap.set(dateStr, { day: days[d.getDay()], accesses: 0 });
    }

    weeklyLogs.forEach(l => {
      // The DB returns a Date object in js for DATE() if it uses certain config, or string. Handle both:
      const lDate = l.date instanceof Date ? l.date : new Date(l.date);
      const dateStr = lDate.toISOString().split('T')[0];
      if (weeklyMap.has(dateStr)) weeklyMap.get(dateStr).accesses += l.count;
    });
    weeklyVisits.forEach(v => {
      const vDate = v.date instanceof Date ? v.date : new Date(v.date);
      const dateStr = vDate.toISOString().split('T')[0];
      if (weeklyMap.has(dateStr)) weeklyMap.get(dateStr).accesses += v.count;
    });
    
    const weeklyData = Array.from(weeklyMap.values());

    // 3. Access Methods
    const [methodStats] = await pool.execute(`
      SELECT method, COUNT(*) as value
      FROM access_logs
      GROUP BY method
    `);

    const methodColors = {
      manual: "hsl(220, 70%, 25%)",
      qr: "hsl(199, 89%, 48%)",
      facial: "hsl(142, 76%, 36%)",
      card: "hsl(38, 92%, 50%)"
    };

    const methodLabels = {
      facial: "Facial",
      qr: "QR",
      manual: "Manual",
      card: "Tarjeta"
    };

    let accessMethodData = methodStats.map(m => ({
      name: methodLabels[m.method] || m.method,
      value: m.value,
      color: methodColors[m.method] || "hsl(220, 15%, 45%)"
    }));

    if (accessMethodData.length === 0) {
      accessMethodData = [{ name: "Manual", value: 1, color: "hsl(220, 70%, 25%)" }];
    }

    const totalMethods = accessMethodData.reduce((acc, curr) => acc + curr.value, 0);
    const accessMethodDataWithPercentage = accessMethodData.map(m => ({
      ...m,
      percentage: Math.round((m.value / totalMethods) * 100)
    }));

    res.json({
      hourly: hourlyData,
      weekly: weeklyData,
      methods: accessMethodDataWithPercentage
    });

  } catch (error) {
    console.error('Error fetching charts:', error);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

export default router;
