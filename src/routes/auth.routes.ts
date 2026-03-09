import { Router, Request, Response } from 'express';
import { createUser, findUserByEmail, findUserById } from '../services/user.service';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from '../utils/auth';
import { authRateLimit, authSlowDown } from '../middleware/rate-limit.middleware';
import { validateRegister, validateLogin } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', authRateLimit, authSlowDown, validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'No se pudo completar el registro' });

    const newUser = await createUser({ email, password });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', authRateLimit, authSlowDown, validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    const dummyHash = '$2b$10$dummyhashfortimingattackprevention00000000000000000000';
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/me', async (req: Request, res: Response
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token malformado' });

    const payload = verifyToken(token);
    const user = await findUserById(payload.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token inválido' });
  }
});

export default router;