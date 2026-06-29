import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const { db } = await import('../lib/db');
const { exerciseSeed } = await import('../data/exercises.seed');
const { workoutTemplateSeed } = await import('../data/workoutTemplates.seed');

async function main() {
  for (const exercise of exerciseSeed) {
    await db(`insert into exercise_library(id,payload,updated_at) values($1,$2,now())
      on conflict(id) do update set payload=excluded.payload, updated_at=now()`, [exercise.id, exercise]);
  }
  for (const template of workoutTemplateSeed) {
    await db(`insert into workout_templates(template_id,payload) values($1,$2)
      on conflict(template_id) do update set payload=excluded.payload`, [template.templateId, template]);
  }
  console.log(`Đã seed ${exerciseSeed.length} bài tập và ${workoutTemplateSeed.length} mẫu lịch vào Supabase/PostgreSQL.`);
}
main().catch((error)=>{ console.error(error); process.exit(1); });
