import { cookies } from 'next/headers';import { SignJWT,jwtVerify } from 'jose';import { cookieSecure,env } from '@/lib/env';import { verifyPassword } from '@/lib/password';
const secret=new TextEncoder().encode(env.JWT_SECRET);
export async function verifyAdminPassword(p:string){return env.ADMIN_PASSWORD_HASH?verifyPassword(p,env.ADMIN_PASSWORD_HASH):Boolean(env.ADMIN_PASSWORD&&p===env.ADMIN_PASSWORD)}
export async function setAdminSession(){const token=await new SignJWT({role:'admin',adminName:env.ADMIN_NAME}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret);(await cookies()).set('fitvn_admin',token,{httpOnly:true,sameSite:'lax',secure:cookieSecure,path:'/',maxAge:28800});}
export async function clearAdminSession(){(await cookies()).set('fitvn_admin','',{httpOnly:true,path:'/',maxAge:0});}
export async function requireAdminSession(){const token=(await cookies()).get('fitvn_admin')?.value;if(!token)throw new Error('Bạn cần đăng nhập admin.');const {payload}=await jwtVerify(token,secret);if(payload.role!=='admin')throw new Error('Bạn không có quyền admin.');return {adminName:String(payload.adminName||env.ADMIN_NAME)}}
