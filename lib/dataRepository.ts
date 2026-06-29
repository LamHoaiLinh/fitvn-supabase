import { isDbBackend } from '@/lib/env';
import * as sheets from '@/lib/userSheetManager';
import * as pg from '@/lib/repositories/postgresRepository';
import { appendObject, readObjects } from '@/lib/googleSheets';
import { SYSTEM_HEADERS, USER_HEADERS, userSheetName } from '@/lib/userSheetManager';
import type { Metrics, ProfileInput, UserIndexRow, WorkoutLogInput, WorkoutSessionEventInput } from '@/types/fitness';

export const getUsers = () => isDbBackend ? pg.getUsers() : sheets.getUsers();
export const getUserByEmail = (email:string) => isDbBackend ? pg.getUserByEmail(email) : sheets.getUserByEmail(email);
export const getUserById = (userId:string) => isDbBackend ? pg.getUserById(userId) : sheets.getUserById(userId);
export const registerUser = (a:{email:string;name:string;passwordHash:string}) => isDbBackend ? pg.registerUser(a) : sheets.registerUser(a);
export const updateUser = (userId:string, patch:Partial<UserIndexRow>) => isDbBackend ? pg.updateUser(userId, patch) : sheets.updateUser(userId, patch);
export const hardDeleteUserData = (userId:string) => isDbBackend ? pg.hardDeleteUserData(userId) : sheets.hardDeleteUserSheets(userId);

export async function getCurrentProfile(userId:string) {
  if (isDbBackend) return pg.getCurrentProfile(userId);
  const u = await sheets.getUserById(userId);
  if (!u) throw new Error('Không tìm thấy tài khoản.');
  const rows = await readObjects(userSheetName(u.sheetPrefix,'Profile'), USER_HEADERS.Profile);
  const r:any = rows.find((x:any)=>x.userId===userId);
  return { profile: r?.profileJson ? JSON.parse(r.profileJson) : null, metrics: r?.metricsJson ? JSON.parse(r.metricsJson) : null };
}

export async function saveProfileAndMeasurement(userId:string, profile:ProfileInput, metrics:Metrics) {
  if (isDbBackend) return pg.saveProfileAndMeasurement(userId, profile, metrics);
  const u = await sheets.getUserById(userId);
  if (!u) throw new Error('Không tìm thấy tài khoản.');
  const { nanoid } = await import('nanoid');
  const { appendObject, readObjects, updateObjectByKey } = await import('@/lib/googleSheets');
  const sheet = userSheetName(u.sheetPrefix,'Profile');
  const old = await readObjects(sheet, USER_HEADERS.Profile);
  const row = { userId, profileJson: JSON.stringify(profile), metricsJson: JSON.stringify(metrics), updatedAt: new Date().toISOString() };
  if ((old as any[]).some(x=>x.userId===userId)) await updateObjectByKey(sheet, USER_HEADERS.Profile, 'userId', userId, row);
  else await appendObject(sheet, USER_HEADERS.Profile, row);
  await appendObject(userSheetName(u.sheetPrefix,'Measurements'), USER_HEADERS.Measurements, {
    measurementId:`mes_${nanoid(12)}`, userId, weightKg:profile.weightKg||'', heightCm:profile.heightCm||'', neckCm:profile.neckCm||'', chestCm:profile.chestCm||'', waistCm:profile.waistCm||'', hipCm:profile.hipCm||'', thighCm:profile.thighCm||'', armCm:profile.armCm||'', calfCm:profile.calfCm||'', restingHeartRate:profile.restingHeartRate||'', dailySteps:profile.dailySteps||'', metricsJson:JSON.stringify(metrics), createdAt:new Date().toISOString()
  });
}

export async function getLatestAssessment(userId:string) {
  if (isDbBackend) return pg.getLatestAssessment(userId);
  const u = await sheets.getUserById(userId); if (!u) throw new Error('Không tìm thấy tài khoản.');
  const ar:any[] = await readObjects(userSheetName(u.sheetPrefix,'Assessments'), USER_HEADERS.Assessments);
  const row = ar.reverse()[0];
  return { assessment: row?.assessmentJson ? JSON.parse(row.assessmentJson) : {}, level: row?.level || null };
}

export async function saveAssessment(userId:string, assessment:Record<string,number>, level:string) {
  if (isDbBackend) return pg.saveAssessment(userId, assessment, level);
  const { nanoid } = await import('nanoid');
  const u = await sheets.getUserById(userId); if (!u) throw new Error('Không tìm thấy tài khoản.');
  await appendObject(userSheetName(u.sheetPrefix,'Assessments'), USER_HEADERS.Assessments, {assessmentId:`ass_${nanoid(12)}`,userId,assessmentJson:JSON.stringify(assessment),level,createdAt:new Date().toISOString()});
}

export async function getLatestWorkoutPlan(userId:string) {
  if (isDbBackend) return pg.getLatestWorkoutPlan(userId);
  const u = await sheets.getUserById(userId); if (!u) throw new Error('Không tìm thấy tài khoản.');
  const rows:any[] = await readObjects(userSheetName(u.sheetPrefix,'WorkoutPlans'), USER_HEADERS.WorkoutPlans);
  const r = rows.reverse().find(x=>x.userId===userId);
  return r?.planJson ? JSON.parse(r.planJson) : null;
}

export async function saveWorkoutPlan(userId:string, plan:any, planId:string) {
  if (isDbBackend) return pg.saveWorkoutPlan(userId, plan, planId);
  const u = await sheets.getUserById(userId); if (!u) throw new Error('Không tìm thấy tài khoản.');
  await appendObject(userSheetName(u.sheetPrefix,'WorkoutPlans'), USER_HEADERS.WorkoutPlans, {planId,userId,planJson:JSON.stringify(plan),createdAt:plan.createdAt,updatedAt:plan.createdAt});
}

export async function getWorkoutLogs(userId:string) {
  if (isDbBackend) return pg.getWorkoutLogs(userId);
  const u = await sheets.getUserById(userId); if (!u) throw new Error('Không tìm thấy tài khoản.');
  return readObjects(userSheetName(u.sheetPrefix,'WorkoutLogs'), USER_HEADERS.WorkoutLogs);
}

export const saveWorkoutLog = (userId:string, i:WorkoutLogInput) => isDbBackend ? pg.saveWorkoutLog(userId,i) : saveSheetWorkoutLog(userId,i);
async function saveSheetWorkoutLog(userId:string,i:WorkoutLogInput){const {nanoid}=await import('nanoid');const u=await sheets.getUserById(userId);if(!u)throw new Error('Không tìm thấy tài khoản.');await appendObject(userSheetName(u.sheetPrefix,'WorkoutLogs'), USER_HEADERS.WorkoutLogs,{...i,logId:i.logId||`log_${nanoid(12)}`,userId,createdAt:new Date().toISOString()});}

export const saveWorkoutEvent = (userId:string, i:WorkoutSessionEventInput) => isDbBackend ? pg.saveWorkoutEvent(userId,i) : saveSheetWorkoutEvent(userId,i);
async function saveSheetWorkoutEvent(userId:string,i:WorkoutSessionEventInput){const {nanoid}=await import('nanoid');const u=await sheets.getUserById(userId);if(!u)throw new Error('Không tìm thấy tài khoản.');await appendObject(userSheetName(u.sheetPrefix,'WorkoutSessionEvents'), USER_HEADERS.WorkoutSessionEvents,{...i,eventId:i.eventId||`evt_${nanoid(12)}`,userId,createdAt:i.createdAt||new Date().toISOString()});}

export const savePendingSync = (userId:string,item:any,status?:string,errorMessage?:string) => isDbBackend ? pg.savePendingSync(userId,item,status,errorMessage) : saveSheetPending(userId,item,status,errorMessage);
async function saveSheetPending(userId:string,item:any,status='pending',errorMessage=''){const u=await sheets.getUserById(userId);if(!u)throw new Error('Không tìm thấy tài khoản.');await appendObject(userSheetName(u.sheetPrefix,'PendingSync'), USER_HEADERS.PendingSync,{pendingId:item.pendingId,userId,kind:item.kind,payloadJson:JSON.stringify(item.payload),status,retryCount:item.retryCount||0,errorMessage,createdAt:item.createdAt,updatedAt:new Date().toISOString()});}

export async function logAdminAction(a:{actionType:string;targetUserId?:string;targetEmail?:string;detail?:unknown;adminName:string}) { return isDbBackend ? pg.logAdminAction(a) : legacyLogAdminAction(a); }
async function legacyLogAdminAction(a:{actionType:string;targetUserId?:string;targetEmail?:string;detail?:unknown;adminName:string}){const {nanoid}=await import('nanoid');await appendObject('Admin_Actions',SYSTEM_HEADERS.Admin_Actions,{actionId:`adm_${nanoid(12)}`,actionType:a.actionType,targetUserId:a.targetUserId||'',targetEmail:a.targetEmail||'',detail:typeof a.detail==='string'?a.detail:JSON.stringify(a.detail||{}),adminName:a.adminName,createdAt:new Date().toISOString()})}

export async function logSync(a:{userId:string;sheetName:string;actionType:string;status:string;errorMessage?:string;retryCount?:number}) { return isDbBackend ? pg.logSync(a) : legacyLogSync(a); }
async function legacyLogSync(a:{userId:string;sheetName:string;actionType:string;status:string;errorMessage?:string;retryCount?:number}){const {nanoid}=await import('nanoid');await appendObject('Sync_Logs',SYSTEM_HEADERS.Sync_Logs,{logId:`sync_${nanoid(12)}`,userId:a.userId,sheetName:a.sheetName,actionType:a.actionType,status:a.status,errorMessage:a.errorMessage||'',retryCount:a.retryCount??0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}

export async function saveDeleteRequest(a:{userId:string;email:string;deleteType:string;status:string;note?:string}) { return isDbBackend ? pg.saveDeleteRequest(a) : appendObject('Delete_Requests', SYSTEM_HEADERS.Delete_Requests, {requestId:`del_${Date.now()}`,...a,requestedAt:new Date().toISOString(),completedAt:new Date().toISOString()}); }
export async function getAdminUserDetail(userId:string) { return isDbBackend ? pg.getAdminUserDetail(userId) : legacyAdminDetail(userId); }
async function legacyAdminDetail(userId:string){const u=await sheets.getUserById(userId);if(!u)throw new Error('Không tìm thấy tài khoản.');const data:Record<string,unknown>={};for(const k of Object.keys(USER_HEADERS) as (keyof typeof USER_HEADERS)[])data[k]=await readObjects(userSheetName(u.sheetPrefix,k),USER_HEADERS[k]);return {user:{...u,passwordHash:undefined,resetTokenHash:undefined},data};}
