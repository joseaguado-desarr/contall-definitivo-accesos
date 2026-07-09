import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const isLegacyPassword = (passwordHash) => typeof passwordHash === 'string' && !passwordHash.trim().startsWith('$2');

const isValidPassword = async (providedPassword, storedPasswordHash) => {
  if (!storedPasswordHash) return false;

  const normalizedProvided = String(providedPassword ?? '').trim();
  const normalizedStored = String(storedPasswordHash ?? '').trim();

  if (normalizedProvided && normalizedStored && normalizedProvided === normalizedStored) {
    return true;
  }

  if (isLegacyPassword(normalizedStored)) {
    return false;
  }

  try {
    return bcrypt.compare(normalizedProvided, normalizedStored);
  } catch (error) {
    console.error('Password comparison failed', error);
    return false;
  }
};

// Register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = uuidv4();
    const profileId = uuidv4();
    const roleId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await connection.execute(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );

    // Create profile
    await connection.execute(
      'INSERT INTO profiles (id, user_id, full_name, email) VALUES (?, ?, ?, ?)',
      [profileId, userId, full_name, email]
    );

    // Assign a standard role to any newly registered user
    const role = 'operator';
    await connection.execute(
      'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
      [roleId, userId, role]
    );

    await connection.commit();

    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: userId, email, full_name, role } });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  } finally {
    connection.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    console.log('Login failed: missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // First, find the user
    const [userList] = await pool.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (userList.length === 0) {
      console.log('Login failed: user not found', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userList[0];
    const isPasswordValid = await isValidPassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Login failed: invalid password', { email });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user role and full name
    const [roleData] = await pool.execute(
      'SELECT role FROM user_roles WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    const [profileData] = await pool.execute(
      'SELECT full_name FROM profiles WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    if (roleData.length === 0 || profileData.length === 0) {
      console.log('Login failed: incomplete user profile', { userId: user.id, email, hasRole: roleData.length > 0, hasProfile: profileData.length > 0 });
      return res.status(500).json({ error: 'User profile is incomplete. Please contact support.' });
    }

    const role = roleData[0].role;
    const full_name = profileData[0].full_name;

    // Update legacy passwords
    if (isLegacyPassword(user.password_hash)) {
      const hashedPassword = await bcrypt.hash(String(password ?? '').trim(), 10);
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('Login successful', { userId: user.id, email, role });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        full_name, 
        role 
      } 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in. Please try again.' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT u.id, u.email, u.created_at, r.role, p.full_name FROM users u ' +
      'LEFT JOIN user_roles r ON u.id = r.user_id ' +
      'LEFT JOIN profiles p ON u.id = p.user_id ' +
      'ORDER BY u.created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Me (Verify session)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT u.id, u.email, r.role, p.full_name FROM users u ' +
      'JOIN user_roles r ON u.id = r.user_id ' +
      'JOIN profiles p ON u.id = p.user_id ' +
      'WHERE u.id = ?',
      [decoded.userId]
    );

    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ user: users[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
