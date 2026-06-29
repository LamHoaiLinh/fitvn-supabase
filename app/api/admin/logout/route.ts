import { clearAdminSession } from '@/lib/adminAuth';import { ok } from '@/lib/apiResponse';export async function POST(){await clearAdminSession();return ok({message:'Đã đăng xuất admin.'})}
