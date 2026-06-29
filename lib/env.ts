import { z } from 'zod';

const raw = {
  APP_ENV: process.env.APP_ENV || process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_change_me_please_make_32_chars',
  ADMIN_NAME: process.env.ADMIN_NAME || 'admin-gia-dinh',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  MAX_ACTIVE_USERS: process.env.MAX_ACTIVE_USERS || '20',
  DATA_BACKEND: process.env.DATA_BACKEND || 'supabase',

  // Google Sheets legacy/fallback.
  GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,

  // Supabase/PostgreSQL.
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_EXERCISE_BUCKET: process.env.SUPABASE_EXERCISE_BUCKET || 'fitvn-exercise-images',
  EXERCISE_IMAGES_BASE_URL: process.env.EXERCISE_IMAGES_BASE_URL || '',
};

const schema = z.object({
  APP_ENV: z.string(),
  APP_URL: z.string().url(),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET cần tối thiểu 24 ký tự.'),
  ADMIN_NAME: z.string().default('admin-gia-dinh'),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  MAX_ACTIVE_USERS: z.coerce.number().int().min(1).max(20),
  DATA_BACKEND: z.enum(['supabase', 'postgres', 'sheets']).default('supabase'),

  GOOGLE_SHEETS_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),

  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_EXERCISE_BUCKET: z.string(),
  EXERCISE_IMAGES_BASE_URL: z.string().optional(),
});

export const env = schema.parse(raw);
export const cookieSecure = env.APP_ENV === 'production';
export const isDbBackend = env.DATA_BACKEND === 'supabase' || env.DATA_BACKEND === 'postgres';

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) {
    throw new Error('Thiếu DATABASE_URL. Bạn cần cấu hình Supabase/PostgreSQL trước khi dùng DATA_BACKEND=supabase.');
  }
  return env.DATABASE_URL;
}

export function requireSheetsEnv() {
  if (!env.GOOGLE_SHEETS_ID || !env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Thiếu cấu hình Google Sheets. Nếu dùng Supabase, đặt DATA_BACKEND=supabase.');
  }
}
