import { NextResponse } from 'next/server';import { ZodError } from 'zod';
export const ok=(d:any={})=>NextResponse.json({ok:true,...d});
export function fail(e:any,status=400){const message=e instanceof ZodError?e.errors.map(x=>x.message).join('; '):e instanceof Error?e.message:String(e||'Có lỗi xảy ra.');return NextResponse.json({ok:false,message},{status});}
