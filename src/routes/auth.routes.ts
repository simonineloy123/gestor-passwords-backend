import { Router } from 'express';
import { createUser, findUserByEmail, findUserById } from '../services/user.service';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from '../utils/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const newUser = await createUser({ email, password: password });

    const isPasswordValid = await bcrypt.compare(password, newUser.password);

    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Malformed token' });

    const payload = verifyToken(token);
    const user = await findUserById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
