import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: 'Demasiados intentos, intentá de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 60, 
  message: { message: 'Demasiadas solicitudes, intentá de nuevo en un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: (hits) => hits * 500, 
});