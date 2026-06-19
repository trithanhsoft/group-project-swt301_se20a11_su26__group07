import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { sendSuccess } from './utils/apiResponse.js';

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (req, res, next) => {
  try {
    const db = await testConnection();
    return sendSuccess(res, {
      message: 'Mini Coffee POS API is running.',
      data: {
        service: 'backend',
        databaseTime: db.now,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
