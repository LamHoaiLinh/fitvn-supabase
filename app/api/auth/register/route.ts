import { registerSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';
import { registerUser } from '@/lib/dataRepository';
import { setUserSession } from '@/lib/auth';
import { fail, ok } from '@/lib/apiResponse';
export const runtime='nodejs';
export async function POST(req:Request){try{const i=registerSchema.parse(await req.json());const u=await registerUser({...i,passwordHash:await hashPassword(i.password)});await setUserSession({userId:u.userId,email:u.email,role:'user'});return ok({user:{userId:u.userId,email:u.email,name:u.name}})}catch(e){return fail(e)}}
