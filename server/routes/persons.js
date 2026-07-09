import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../lib/db.js';

const router = express.Router();

// Get all persons
router.get('/', async (req, res) => {
  try {
    const { document, name } = req.query;
    let query = 'SELECT * FROM persons';
    let params = [];

    if (document) {
      query += ' WHERE document = ?';
      params.push(document);
    } else if (name) {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ?';
      params.push(`%${name}%`, `%${name}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching persons' });
  }
});

// Create person
router.post('/', async (req, res) => {
  const { first_name, last_name, document, type, phone, email, unit, notes, photo_url, status } = req.body;
  const id = uuidv4();

  try {
    console.log(`[Persons] Intentando registrar: ${first_name} ${last_name} (${document})`);
    await pool.execute(
      'INSERT INTO persons (id, first_name, last_name, document, type, phone, email, unit, notes, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, first_name, last_name, document, type, phone || null, email || null, unit || null, notes || null, photo_url || null, status || 'active']
    );
    const [rows] = await pool.execute('SELECT * FROM persons WHERE id = ?', [id]);
    console.log(`[Persons] Registro exitoso: ${id}`);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[Persons] Error al crear:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El documento ya está registrado en el sistema' });
    }
    
    res.status(500).json({ error: 'No se pudo guardar la persona: ' + error.message });
  }
});

// Update person
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, document, type, phone, email, unit, notes, status, photo_url } = req.body;

  try {
    await pool.execute(
      'UPDATE persons SET first_name=?, last_name=?, document=?, type=?, phone=?, email=?, unit=?, notes=?, status=?, photo_url=? WHERE id=?',
      [first_name, last_name, document, type, phone, email, unit, notes, status, photo_url, id]
    );
    const [rows] = await pool.execute('SELECT * FROM persons WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating person' });
  }
});

// Delete person
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM persons WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting person' });
  }
});

export default router;
