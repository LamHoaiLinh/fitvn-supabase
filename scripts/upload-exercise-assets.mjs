import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_EXERCISE_BUCKET || 'fitvn-exercise-images';
if (!url || !key) throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
const supabase = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false }});

const dir = path.join('public','exercise-images');
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.svg'));
for (const file of files) {
  const body = fs.readFileSync(path.join(dir,file));
  const { error } = await supabase.storage.from(bucket).upload(file, body, { contentType:'image/svg+xml', upsert:true });
  if (error) throw error;
}
console.log(`Đã upload ${files.length} ảnh lên bucket ${bucket}.`);
console.log(`Public base URL: ${url}/storage/v1/object/public/${bucket}`);
