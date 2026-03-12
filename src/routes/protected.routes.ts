import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createPasswordRecord, getPasswordsByUserId, updatePasswordRecord, deletePasswordRecord } from '../services/password.service';
import { encrypt, decrypt, EncryptedData } from '../utils/encryption';
import { Request } from '../types/express.d';
import { validatePasswordRecord } from '../middleware/validation.middleware';

type PasswordRecordType = {
  id: string;
  userId: string;
  service: string;
  username: string;
  password: string;
  category: string;
  googleLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const router = Router();

router.use(authMiddleware);

router.get('/passwords', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const passwords: PasswordRecordType[] = await getPasswordsByUserId(userId);

    const decryptedPasswords = passwords.map(p => {
      if (!p.password) return { ...p, password: '' };

      let encryptedData: EncryptedData;
      try {
        encryptedData = JSON.parse(p.password);
      } catch (err) {
        console.error('Invalid encrypted password in DB', err);
        return { ...p, password: '' };
      }

      const { userId: _, ...rest } = p;
      return { ...rest, password: decrypt(encryptedData) };
    });

    res.json(decryptedPasswords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/passwords', validatePasswordRecord, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { service, category, username, password, googleLogin } = req.body;

    const encryptedPassword = encrypt(password);
    const newPassword = await createPasswordRecord({
      userId,
      service,
      username,
      password: encryptedPassword,
      category,
      googleLogin: googleLogin ?? false,
    });

    const { userId: _, ...rest } = newPassword;
    res.status(201).json({ ...rest, password });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/passwords/:id', validatePasswordRecord, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { service, category, username, password, googleLogin } = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const encryptedPassword = encrypt(password);
    const updatedPassword = await updatePasswordRecord(id, userId, {
      service,
      category,
      username,
      password: JSON.stringify(encryptedPassword),
      googleLogin: googleLogin ?? false,
    });

    const { userId: _, ...rest } = updatedPassword;
    res.json({ ...rest, password });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Registro no encontrado o sin permisos' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/passwords/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await deletePasswordRecord(id, userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Registro no encontrado o sin permisos' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;