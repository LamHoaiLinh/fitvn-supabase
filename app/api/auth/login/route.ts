import { loginSchema } from '@/lib/validators';
import { verifyPassword } from '@/lib/password';
import { getUserByEmail } from '@/lib/dataRepository';
import { setUserSession } from '@/lib/auth';
import { fail,ok } from '@/lib/apiResponse';
export const runtime='nodejs';
export async function POST(req:Request){try{const i=loginSchema.parse(await req.json());const u=await getUserByEmail(i.email);if(!u||u.status==='deleted'||u.status==='soft_deleted')throw new Error('Không tìm thấy tài khoản hoặc tài khoản đã bị xoá.');if(u.status==='locked')throw new Error('Tài khoản của bạn đang bị khoá.');if(!(await verifyPassword(i.password,u.passwordHash)))throw new Error('Email hoặc mật khẩu không đúng.');await setUserSession({userId:u.userId,email:u.email,role:'user'});return ok({user:{userId:u.userId,email:u.email,name:u.name}})}catch(e){return fail(e,401)}}
