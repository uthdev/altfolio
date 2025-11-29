import { z } from 'zod';
import logger from '../utils/logger';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  FRONTEND_URL: z.string().url().optional(),
});

export const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    logger.info('Environment variables validated successfully');
    return env;
  } catch (error) {
    logger.error('Environment validation failed:', error);
    process.exit(1);
  }
};

export type Env = z.infer<typeof envSchema>;