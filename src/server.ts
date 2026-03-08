import 'dotenv/config'; 

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://gestor-passwords-frontend.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api', protectedRoutes);

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Express backend with Prisma!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});