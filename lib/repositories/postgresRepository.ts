import { nanoid } from 'nanoid';
import { db, tx } from '@/lib/db';
import { env } from '@/lib/env';
import type { Metrics, ProfileInput, UserIndexRow, WorkoutLogInput, WorkoutSessionEventInput } from '@/types/fitness';

function mapUser(row: any): UserIndexRow {
  return {
    userId: row.user_id,
    email: row.email,
    name: row.name,
    sheetPrefix: row.sheet_prefix || '',
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash,
    resetTokenHash: row.reset_token_hash || '',
    resetExpiresAt: row.reset_expires_at ? new Date(row.reset_expires_at).toISOString() : '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : '',
    deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : '',
    note: row.note || '',
  };
}

export async function getUsers() {
  const r = await db('select * from users order by created_at asc');
  return r.rows.map(mapUser);
}

export async function getUserByEmail(email: string) {
  const r = await db('select * from users where lower(email)=lower($1) limit 1', [email]);
  return r.rows[0] ? mapUser(r.rows[0]) : undefined;
}

export async function getUserById(userId: string) {
  const r = await db('select * from users where user_id=$1 limit 1', [userId]);
  return r.rows[0] ? mapUser(r.rows[0]) : undefined;
}

export async function registerUser(a: {email:string; name:string; passwordHash:string}) {
  return tx(async client => {
    const existing = await client.query('select * from users where lower(email)=lower($1) and status <> $2 limit 1', [a.email, 'deleted']);
    if (existing.rows[0]) throw new Error('Email này đã tồn tại trong hệ thống.');
    const active = await client.query("select count(*)::int as c from users where status in ('active','locked')");
    if (active.rows[0].c >= env.MAX_ACTIVE_USERS) throw new Error(`Hệ thống chỉ hỗ trợ tối đa ${env.MAX_ACTIVE_USERS} tài khoản active.`);
    const userId = `usr_${nanoid(12)}`;
    const prefixNo = active.rows[0].c + 1;
    const sheetPrefix = `PG_${String(prefixNo).padStart(3,'0')}`;
    const inserted = await client.query(`insert into users(user_id,email,name,sheet_prefix,role,status,password_hash,created_at,updated_at)
      values($1,lower($2),$3,$4,'user','active',$5,now(),now()) returning *`, [userId, a.email, a.name, sheetPrefix, a.passwordHash]);
    return mapUser(inserted.rows[0]);
  });
}

const patchMap: Record<string,string> = {
  email:'email', name:'name', sheetPrefix:'sheet_prefix', role:'role', status:'status', passwordHash:'password_hash',
  resetTokenHash:'reset_token_hash', resetExpiresAt:'reset_expires_at', deletedAt:'deleted_at', note:'note'
};

export async function updateUser(userId: string, patch: Partial<UserIndexRow>) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [key, value] of Object.entries(patch)) {
    const col = patchMap[key];
    if (!col) continue;
    vals.push(value === '' ? null : value);
    sets.push(`${col}=$${vals.length}`);
  }
  if (!sets.length) return;
  vals.push(userId);
  await db(`update users set ${sets.join(', ')}, updated_at=now() where user_id=$${vals.length}`, vals);
}

export async function hardDeleteUserData(userId: string) {
  const u = await getUserById(userId);
  if (!u) throw new Error('Không tìm thấy tài khoản.');
  await db('delete from measurements where user_id=$1', [userId]);
  await db('delete from assessments where user_id=$1', [userId]);
  await db('delete from workout_plans where user_id=$1', [userId]);
  await db('delete from workout_logs where user_id=$1', [userId]);
  await db('delete from workout_session_events where user_id=$1', [userId]);
  await db('delete from nutrition_logs where user_id=$1', [userId]);
  await db('delete from notifications where user_id=$1', [userId]);
  await db('delete from pending_sync where user_id=$1', [userId]);
  await updateUser(userId, { status: 'deleted', deletedAt: new Date().toISOString(), note: 'Đã hard delete dữ liệu riêng trong PostgreSQL.' });
  return u;
}

export async function getCurrentProfile(userId: string) {
  const r = await db('select profile_json, metrics_json, updated_at from user_profiles where user_id=$1', [userId]);
  const row = r.rows[0];
  return row ? { profile: row.profile_json, metrics: row.metrics_json, updatedAt: row.updated_at } : { profile: null, metrics: null };
}

export async function saveProfileAndMeasurement(userId: string, profile: ProfileInput, metrics: Metrics) {
  await tx(async client => {
    await client.query(`insert into user_profiles(user_id,profile_json,metrics_json,updated_at) values($1,$2,$3,now())
      on conflict(user_id) do update set profile_json=excluded.profile_json, metrics_json=excluded.metrics_json, updated_at=now()`, [userId, profile, metrics]);
    await client.query(`insert into measurements(measurement_id,user_id,weight_kg,height_cm,neck_cm,chest_cm,waist_cm,hip_cm,thigh_cm,arm_cm,calf_cm,resting_heart_rate,daily_steps,metrics_json,created_at)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())`, [
        `mes_${nanoid(12)}`, userId, profile.weightKg ?? null, profile.heightCm ?? null, profile.neckCm ?? null, profile.chestCm ?? null,
        profile.waistCm ?? null, profile.hipCm ?? null, profile.thighCm ?? null, profile.armCm ?? null, profile.calfCm ?? null,
        profile.restingHeartRate ?? null, profile.dailySteps ?? null, metrics
      ]);
  });
}

export async function getMeasurements(userId: string) {
  const r = await db('select * from measurements where user_id=$1 order by created_at asc', [userId]);
  return r.rows;
}

export async function saveAssessment(userId: string, assessment: Record<string,number>, level: string) {
  const assessmentId = `ass_${nanoid(12)}`;
  await db('insert into assessments(assessment_id,user_id,assessment_json,level,created_at) values($1,$2,$3,$4,now())', [assessmentId,userId,assessment,level]);
  return { assessmentId, level };
}

export async function getLatestAssessment(userId: string) {
  const r = await db('select assessment_json, level from assessments where user_id=$1 order by created_at desc limit 1', [userId]);
  return r.rows[0] ? { assessment: r.rows[0].assessment_json, level: r.rows[0].level } : { assessment: {}, level: null };
}

export async function getLatestWorkoutPlan(userId: string) {
  const r = await db('select plan_json from workout_plans where user_id=$1 order by created_at desc limit 1', [userId]);
  return r.rows[0]?.plan_json || null;
}

export async function saveWorkoutPlan(userId: string, plan: unknown, planId: string) {
  await db('insert into workout_plans(plan_id,user_id,plan_json,created_at,updated_at) values($1,$2,$3,now(),now())', [planId,userId,plan]);
}

export async function getWorkoutLogs(userId: string) {
  const r = await db('select * from workout_logs where user_id=$1 order by created_at desc limit 500', [userId]);
  return r.rows;
}

export async function saveWorkoutLog(userId: string, i: WorkoutLogInput) {
  const id = i.logId || `log_${nanoid(12)}`;
  await db(`insert into workout_logs(log_id,session_id,user_id,day_index,status,exercise_id,exercise_name,planned_set,completed_set,planned_rep_or_time,actual_rep_or_time,skip_reason,started_at,ended_at,duration_sec,created_at)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,coalesce($16::timestamptz,now()))
    on conflict(log_id) do nothing`, [id,i.sessionId,userId,i.dayIndex,i.status,i.exerciseId||null,i.exerciseName||null,i.plannedSet??null,i.completedSet??null,i.plannedRepOrTime||null,i.actualRepOrTime||null,i.skipReason||null,i.startedAt||null,i.endedAt||null,i.durationSec??null,i.createdAt||null]);
  return id;
}

export async function saveWorkoutEvent(userId: string, i: WorkoutSessionEventInput) {
  const id = i.eventId || `evt_${nanoid(12)}`;
  await db(`insert into workout_session_events(event_id,session_id,user_id,day_index,event_type,exercise_id,exercise_name,planned_set,completed_set,planned_rep_or_time,actual_rep_or_time,skip_reason,detail,created_at)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,coalesce($14::timestamptz,now()))
    on conflict(event_id) do nothing`, [id,i.sessionId,userId,i.dayIndex,i.eventType,i.exerciseId||null,i.exerciseName||null,i.plannedSet??null,i.completedSet??null,i.plannedRepOrTime||null,i.actualRepOrTime||null,i.skipReason||null,i.detail||null,i.createdAt||null]);
  return id;
}

export async function savePendingSync(userId: string, item: any, status = 'pending', errorMessage = '') {
  await db(`insert into pending_sync(pending_id,user_id,kind,payload_json,status,retry_count,error_message,created_at,updated_at)
    values($1,$2,$3,$4,$5,$6,$7,coalesce($8::timestamptz,now()),now())
    on conflict(pending_id) do update set status=excluded.status,retry_count=excluded.retry_count,error_message=excluded.error_message,updated_at=now()`,
    [item.pendingId || `pend_${nanoid(12)}`, userId, item.kind, item.payload || {}, status, item.retryCount || 0, errorMessage, item.createdAt || null]);
}

export async function logAdminAction(a:{actionType:string;targetUserId?:string;targetEmail?:string;detail?:unknown;adminName:string}) {
  await db('insert into admin_actions(action_id,action_type,target_user_id,target_email,detail,admin_name,created_at) values($1,$2,$3,$4,$5,$6,now())',
    [`adm_${nanoid(12)}`, a.actionType, a.targetUserId || null, a.targetEmail || null, a.detail ?? {}, a.adminName]);
}

export async function logSync(a:{userId:string;sheetName:string;actionType:string;status:string;errorMessage?:string;retryCount?:number}) {
  await db('insert into sync_logs(log_id,user_id,sheet_name,action_type,status,error_message,retry_count,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,now(),now())',
    [`sync_${nanoid(12)}`, a.userId, a.sheetName, a.actionType, a.status, a.errorMessage || '', a.retryCount || 0]);
}

export async function saveDeleteRequest(a:{userId:string;email:string;deleteType:string;status:string;note?:string}) {
  const now = new Date().toISOString();
  await db('insert into delete_requests(request_id,user_id,email,delete_type,status,requested_at,completed_at,note) values($1,$2,$3,$4,$5,$6,$6,$7)',
    [`del_${nanoid(12)}`, a.userId, a.email, a.deleteType, a.status, now, a.note || '']);
}

export async function getAdminUserDetail(userId: string) {
  const u = await getUserById(userId);
  if (!u) throw new Error('Không tìm thấy tài khoản.');
  const [profile, measurements, assessments, plans, logs, events, pending] = await Promise.all([
    db('select * from user_profiles where user_id=$1', [userId]),
    db('select * from measurements where user_id=$1 order by created_at desc limit 100', [userId]),
    db('select * from assessments where user_id=$1 order by created_at desc limit 50', [userId]),
    db('select * from workout_plans where user_id=$1 order by created_at desc limit 20', [userId]),
    db('select * from workout_logs where user_id=$1 order by created_at desc limit 200', [userId]),
    db('select * from workout_session_events where user_id=$1 order by created_at desc limit 300', [userId]),
    db('select * from pending_sync where user_id=$1 order by created_at desc limit 100', [userId]),
  ]);
  return { user: { ...u, passwordHash: undefined, resetTokenHash: undefined }, data: {
    Profile: profile.rows, Measurements: measurements.rows, Assessments: assessments.rows, WorkoutPlans: plans.rows,
    WorkoutLogs: logs.rows, WorkoutSessionEvents: events.rows, PendingSync: pending.rows
  }};
}
