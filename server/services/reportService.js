import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../lib/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../storage/reports');

// Ensure directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export const generateDailyReport = async () => {
  const date = new Date().toISOString().split('T')[0];
  const filename = `reporte_${date}.pdf`;
  const filepath = path.join(REPORTS_DIR, filename);

  // Fetch data
  const [visits] = await pool.execute(
    'SELECT * FROM visits WHERE DATE(entry_time) = CURDATE()'
  );
  
  const [accessLogs] = await pool.execute(
    'SELECT l.*, p.first_name, p.last_name, p.document, p.type FROM access_logs l ' +
    'JOIN persons p ON l.person_id = p.id ' +
    'WHERE DATE(l.created_at) = CURDATE()'
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Reporte Diario de Accesos', { align: 'center' });
    doc.fontSize(12).text(`Fecha: ${date}`, { align: 'center' });
    doc.moveDown();

    // Visitors Section
    doc.fontSize(16).fillColor('#1e3a8a').text('Visitantes Registrados');
    doc.moveDown(0.5);
    
    if (visits.length === 0) {
      doc.fontSize(10).fillColor('black').text('No hubo registros de visitantes hoy.');
    } else {
      visits.forEach((v, index) => {
        doc.fontSize(10).fillColor('black').text(
          `${index + 1}. [VISITANTE] ${v.visitor_name} (${v.visitor_document})`
        );
        doc.fontSize(9).fillColor('#666666').text(
          `   Hora Entrada: ${new Date(v.entry_time).toLocaleTimeString()} | Vehículo: ${v.vehicle_plate || 'N/A'}`
        );
        doc.text(
          `   Anfitrión: ${v.host_name || 'N/A'} | Motivo: ${v.reason || 'Sín motivo'}`
        );
        doc.moveDown(0.5);
      });
    }
    
    doc.moveDown();

    // Personnel Section
    doc.fontSize(16).fillColor('#1e3a8a').text('Ingresos de Personal y Residentes');
    doc.moveDown(0.5);

    if (accessLogs.length === 0) {
      doc.fontSize(10).fillColor('black').text('No hubo registros de personal hoy.');
    } else {
      accessLogs.forEach((l, index) => {
        doc.fontSize(10).fillColor('black').text(
          `${index + 1}. [${l.type.toUpperCase()}] ${l.first_name} ${l.last_name} (${l.document})`
        );
        doc.fontSize(9).fillColor('#666666').text(
          `   Hora Registro: ${new Date(l.created_at).toLocaleTimeString()} | Dirección: ${l.direction === 'entry' ? 'Entrada' : 'Salida'}`
        );
        doc.text(
          `   Unidad: ${l.unit || 'N/A'} | Teléfono: ${l.phone || 'N/A'}`
        );
        doc.moveDown(0.5);
      });
    }

    doc.end();

    stream.on('finish', () => resolve({ filename, filepath }));
    stream.on('error', reject);
  });
};

export const sendReportByEmail = async (filename, filepath) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"ContaALL Reports" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Reporte Diario de Accesos - ${new Date().toLocaleDateString()}`,
    text: 'Se adjunta el reporte diario de accesos generado por el sistema.',
    attachments: [
      {
        filename: filename,
        path: filepath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

export const cleanupOldReports = async (days = 30) => {
  const files = fs.readdirSync(REPORTS_DIR);
  const now = Date.now();
  const expiration = days * 24 * 60 * 60 * 1000;

  files.forEach(file => {
    const filepath = path.join(REPORTS_DIR, file);
    const stats = fs.statSync(filepath);
    if (now - stats.mtimeMs > expiration) {
      fs.unlinkSync(filepath);
      console.log(`Eliminado reporte antiguo: ${file}`);
    }
  });
};
