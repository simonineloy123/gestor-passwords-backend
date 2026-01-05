// Este archivo extiende los tipos de Express para incluir `user` en el Request
import { Request } from 'express';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email'>;
    }
  }
}

export { Request };
