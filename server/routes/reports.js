import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '../storage/reports');

// List reports
router.get('/', (req, res) => {
  if (!fs.existsSync(REPORTS_DIR)) {
    return res.json([]);
  }

  const files = fs.readdirSync(REPORTS_DIR)
    .filter(file => file.endsWith('.pdf'))
    .map(file => {
      const stats = fs.statSync(path.join(REPORTS_DIR, file));
      return {
        id: file,
        filename: file,
        created_at: stats.mtime,
        size: stats.size
      };
    })
    .sort((a, b) => b.created_at - a.created_at);

  res.json(files);
});

// Download report
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(REPORTS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  res.download(filepath);
});

export default router;
