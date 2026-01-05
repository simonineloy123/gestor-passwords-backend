import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createPasswordRecord, getPasswordsByUserId, updatePasswordRecord, deletePasswordRecord } from '../services/password.service';
import { encrypt, decrypt, EncryptedData } from '../utils/encryption';
import { Request } from '../types/express.d'; // Usamos nuestro tipo extendido

type PasswordRecordType = {
  id: string;
  userId: string;
  service: string;
  username: string;
  password: string;
  createdAt: Date;
};

const router = Router();

// Aplicamos el middleware a todas las rutas de este router
router.use(authMiddleware);

// --- GET /passwords ---
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

      return { ...p, password: decrypt(encryptedData) };
    });


    res.json(decryptedPasswords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// --- POST /passwords ---
router.post('/passwords', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { service, category, username, password } = req.body;

    // Validaciones básicas
    if (!service || !username || !password) {
      return res.status(400).json({ message: 'Service, username, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const encryptedPassword = encrypt(password);
    const newPassword = await createPasswordRecord({
      userId,
      service,
      username,
      password: encryptedPassword,
      category
    });

    res.status(201).json(newPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// --- PUT /passwords/:id ---
router.put('/passwords/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { service, category, username, password } = req.body;

    if (!service || !username || !password) {
      return res.status(400).json({ message: 'Service, username, and password are required' });
    }

    const encryptedPassword = encrypt(password);
    const updatedPassword = await updatePasswordRecord(id, userId, {
      service,
      category,
      username,
      password: JSON.stringify(encryptedPassword),
    });

    res.json(updatedPassword);
  } catch (error: any) {
    // Prisma lanza un error si no encuentra el registro para actualizar
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Password record not found or you do not have permission to edit it' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// --- DELETE /passwords/:id ---
router.delete('/passwords/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await deletePasswordRecord(id, userId);

    res.status(204).send(); // 204 No Content es estándar para eliminaciones exitosas
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Password record not found or you do not have permission to delete it' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;