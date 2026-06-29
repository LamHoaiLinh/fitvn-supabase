create extension if not exists pgcrypto;

create table if not exists app_config(
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists users(
  user_id text primary key,
  email text not null unique,
  name text not null,
  sheet_prefix text,
  role text not null default 'user' check(role in ('user','admin')),
  status text not null default 'active' check(status in ('active','locked','soft_deleted','deleted')),
  password_hash text not null,
  reset_token_hash text,
  reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  note text
);
create index if not exists idx_users_status on users(status);
create index if not exists idx_users_email_lower on users(lower(email));

create table if not exists admin_actions(
  action_id text primary key,
  action_type text not null,
  target_user_id text,
  target_email text,
  detail jsonb not null default '{}'::jsonb,
  admin_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists sync_logs(
  log_id text primary key,
  user_id text,
  sheet_name text,
  action_type text,
  status text,
  error_message text,
  retry_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists delete_requests(
  request_id text primary key,
  user_id text,
  email text,
  delete_type text,
  status text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  note text
);

create table if not exists exercise_library(
  id text primary key,
  payload jsonb not null,
  name_vi text generated always as (payload->>'nameVi') stored,
  name_en text generated always as (payload->>'nameEn') stored,
  level text generated always as (payload->>'level') stored,
  category jsonb generated always as (payload->'category') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_exercise_level on exercise_library(level);
create index if not exists idx_exercise_payload_gin on exercise_library using gin(payload);

create table if not exists workout_templates(
  template_id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists user_profiles(
  user_id text primary key references users(user_id) on delete cascade,
  profile_json jsonb not null default '{}'::jsonb,
  metrics_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists measurements(
  measurement_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  weight_kg numeric,
  height_cm numeric,
  neck_cm numeric,
  chest_cm numeric,
  waist_cm numeric,
  hip_cm numeric,
  thigh_cm numeric,
  arm_cm numeric,
  calf_cm numeric,
  resting_heart_rate numeric,
  daily_steps numeric,
  metrics_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_measurements_user_created on measurements(user_id, created_at desc);

create table if not exists assessments(
  assessment_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  assessment_json jsonb not null default '{}'::jsonb,
  level text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_assessments_user_created on assessments(user_id, created_at desc);

create table if not exists workout_plans(
  plan_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  plan_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_workout_plans_user_created on workout_plans(user_id, created_at desc);

create table if not exists workout_logs(
  log_id text primary key,
  session_id text not null,
  user_id text not null references users(user_id) on delete cascade,
  day_index int,
  status text not null check(status in ('completed','partial','skipped','abandoned')),
  exercise_id text,
  exercise_name text,
  planned_set int,
  completed_set int,
  planned_rep_or_time text,
  actual_rep_or_time text,
  skip_reason text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_sec int,
  created_at timestamptz not null default now()
);
create index if not exists idx_workout_logs_user_created on workout_logs(user_id, created_at desc);
create index if not exists idx_workout_logs_session on workout_logs(session_id);

create table if not exists workout_session_events(
  event_id text primary key,
  session_id text not null,
  user_id text not null references users(user_id) on delete cascade,
  day_index int,
  event_type text not null,
  exercise_id text,
  exercise_name text,
  planned_set int,
  completed_set int,
  planned_rep_or_time text,
  actual_rep_or_time text,
  skip_reason text,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_user_created on workout_session_events(user_id, created_at desc);
create index if not exists idx_events_session on workout_session_events(session_id);

create table if not exists nutrition_logs(
  nutrition_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  calories numeric,
  protein_g numeric,
  fat_g numeric,
  carb_g numeric,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists notifications(
  notification_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  type text,
  message text,
  status text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists pending_sync(
  pending_id text primary key,
  user_id text not null references users(user_id) on delete cascade,
  kind text not null,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  retry_count int not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_pending_user_status on pending_sync(user_id, status);

insert into app_config(key,value) values
('appVersion','"2.0-supabase"'::jsonb),
('maxUsers','20'::jsonb),
('maintenanceMode','false'::jsonb)
on conflict(key) do nothing;
