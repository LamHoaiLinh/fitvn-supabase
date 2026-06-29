import { clearUserSession } from '@/lib/auth';import { ok } from '@/lib/apiResponse';export async function POST(){await clearUserSession();return ok({message:'Đã đăng xuất.'})}
