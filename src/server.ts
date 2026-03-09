import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';
import { apiRateLimit } from './middleware/rate-limit.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  noSniff: true,
  xssFilter: true,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://pass-vault-manager.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing con límite ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP Parameter Pollution ──────────────────────────────────────────────────
app.use(hpp());

// ── Rate Limiting Global ──────────────────────────────────────────────────────
app.use('/api', apiRateLimit);

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isDev = process.env.NODE_ENV === 'development';
  console.error(`[ERROR] ${err.message}`);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS no permitido' });
  }

  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});