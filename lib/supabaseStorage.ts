import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function exerciseImagePath(exerciseId: string) {
  return `/exercise-images/${exerciseId}.svg`;
}

export function exerciseImageUrl(exerciseId: string) {
  if (env.EXERCISE_IMAGES_BASE_URL) return `${env.EXERCISE_IMAGES_BASE_URL.replace(/\/$/,'')}/${exerciseId}.svg`;
  return exerciseImagePath(exerciseId);
}
