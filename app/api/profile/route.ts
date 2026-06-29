import { requireUserSession } from '@/lib/auth';
import { calculateMetrics } from '@/lib/fitnessCalculations';
import { profileSchema } from '@/lib/validators';
import { getCurrentProfile, getUserById, saveProfileAndMeasurement } from '@/lib/dataRepository';
import { fail,ok } from '@/lib/apiResponse';
export const runtime='nodejs';
export async function GET(){try{const s=await requireUserSession();const u=await getUserById(s.userId);if(!u||u.status!=='active')throw new Error('Tài khoản không khả dụng.');const data=await getCurrentProfile(u.userId);return ok(data)}catch(e){return fail(e,401)}}
export async function POST(req:Request){try{const s=await requireUserSession();const u=await getUserById(s.userId);if(!u||u.status!=='active')throw new Error('Tài khoản không khả dụng.');const p=profileSchema.parse(await req.json());const m=calculateMetrics(p);await saveProfileAndMeasurement(u.userId,p,m);return ok({message:'Đã ghi nhận tiến độ.',profile:p,metrics:m})}catch(e){return fail(e)}}
