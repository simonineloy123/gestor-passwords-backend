
import * as jwt from 'jsonwebtoken';

//const SALT_ROUNDS = 10;


export interface JWTPayload {
  id: string;
  email: string;
}

export const generateToken = (user: { id: string; email: string }): string => {
  const secret: jwt.Secret = process.env.JWT_SECRET ?? '';
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as `${number}${"s" | "m" | "h" | "d" | "y"}`;
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret: jwt.Secret = process.env.JWT_SECRET ?? '';
  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.verify(token, secret) as JWTPayload;
};
