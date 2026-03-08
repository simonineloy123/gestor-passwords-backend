// src/middleware/auth.middleware.ts
import { Response, NextFunction } from 'express';
import { Request as CoreRequest } from 'express-serve-static-core';
import { verifyToken } from '../utils/auth';
import { User } from '@prisma/client';

// Tipado de req con user
export interface AuthRequest extends CoreRequest {
  user?: Pick<User, 'id' | 'email'>;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedUser = verifyToken(token);

    // Añadimos la info del usuario al request
    req.user = decodedUser;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
