import { requireUserSession } from '@/lib/auth';
import { generateWorkoutPlan } from '@/lib/workoutEngine';
import { getCurrentProfile, getLatestAssessment, getLatestWorkoutPlan, getUserById, getWorkoutLogs, saveWorkoutPlan } from '@/lib/dataRepository';
import { fail,ok } from '@/lib/apiResponse';
export const runtime='nodejs';
export async function GET(){try{const s=await requireUserSession(),u=await getUserById(s.userId);if(!u)throw new Error('Không tìm thấy tài khoản.');return ok({plan:await getLatestWorkoutPlan(u.userId)})}catch(e){return fail(e)}}
export async function POST(){try{const s=await requireUserSession(),u=await getUserById(s.userId);if(!u)throw new Error('Không tìm thấy tài khoản.');const {profile}=await getCurrentProfile(u.userId);const {assessment}=await getLatestAssessment(u.userId);const logs:any[]=await getWorkoutLogs(u.userId);const skipped=logs.filter(x=>x.skipReason||x.skip_reason).map(x=>x.exerciseId||x.exercise_id).filter(Boolean);const plan=generateWorkoutPlan({userId:u.userId,profile:profile||{},assessment:assessment||{},skippedExerciseIds:skipped});await saveWorkoutPlan(u.userId,plan,plan.planId);return ok({message:'Đã tạo lịch tập cá nhân hóa.',plan})}catch(e){return fail(e)}}
