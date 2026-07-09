import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import personRoutes from './routes/persons.js';
import visitRoutes from './routes/visits.js';
import accessRoutes from './routes/access.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import { generateDailyReport, sendReportByEmail, cleanupOldReports } from './services/reportService.js';
import pool from './lib/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Automation: Daily Cron Job at 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('--- Iniciando tareas automáticas de medianoche ---');
  
  try {
    // 1. Generate and Send Report
    console.log('Generando reporte diario...');
    const { filename, filepath } = await generateDailyReport();
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('Enviando reporte por email...');
      await sendReportByEmail(filename, filepath);
    } else {
      console.log('Saltando envío de email (SMTP no configurado). El reporte se guardó localmente.');
    }

    // 2. Reset Visitors Status (Inside -> Auto-exited)
    console.log('Reiniciando contador de visitantes...');
    const [result] = await pool.execute(
      "UPDATE visits SET status = 'outside', exit_time = NOW(), reason = CONCAT(IFNULL(reason, ''), ' [Cierre automático medianoche]') WHERE status = 'inside'"
    );
    console.log(`Visitantes reiniciados: ${result.affectedRows}`);

    // 3. Cleanup old reports (> 30 days)
    console.log('Limpiando reportes antiguos...');
    await cleanupOldReports(30);

    console.log('--- Tareas de medianoche completadas con éxito ---');
  } catch (error) {
    console.error('Error durante las tareas automáticas:', error);
  }
}).start();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
