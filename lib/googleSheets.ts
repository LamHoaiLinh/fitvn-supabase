import { google } from 'googleapis';
import { env, requireSheetsEnv } from '@/lib/env';

function client(){
  requireSheetsEnv();
  const auth=new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g,'\n'),
    scopes:['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({version:'v4',auth});
}
export async function ensureHeader(sheetName:string,headers:string[]){const sheets=client();const id=env.GOOGLE_SHEETS_ID!;const meta=await sheets.spreadsheets.get({spreadsheetId:id});const exists=meta.data.sheets?.some(s=>s.properties?.title===sheetName);if(!exists)await sheets.spreadsheets.batchUpdate({spreadsheetId:id,requestBody:{requests:[{addSheet:{properties:{title:sheetName}}}]}});const values=(await sheets.spreadsheets.values.get({spreadsheetId:id,range:`${sheetName}!1:1`})).data.values?.[0]||[];if(values.join('|')!==headers.join('|'))await sheets.spreadsheets.values.update({spreadsheetId:id,range:`${sheetName}!1:1`,valueInputOption:'RAW',requestBody:{values:[headers]}})}
export async function readObjects<T=any>(sheetName:string,headers:string[]):Promise<T[]>{const res=await client().spreadsheets.values.get({spreadsheetId:env.GOOGLE_SHEETS_ID!,range:`${sheetName}!A2:ZZ`});return (res.data.values||[]).map((row,i)=>Object.fromEntries(headers.map((h,idx)=>[h,row[idx]??''])).__proto__?{}:{}).map((_,i)=>{const row=(res.data.values||[])[i];const o:any={__rowNumber:i+2};headers.forEach((h,idx)=>o[h]=row[idx]??'');return o})}
export async function appendObject(sheetName:string,headers:string[],obj:Record<string,any>){await ensureHeader(sheetName,headers);await client().spreadsheets.values.append({spreadsheetId:env.GOOGLE_SHEETS_ID!,range:`${sheetName}!A:ZZ`,valueInputOption:'RAW',requestBody:{values:[headers.map(h=>obj[h]??'')]}})}
export async function updateObjectByKey(sheetName:string,headers:string[],key:string,value:string,obj:Record<string,any>){const rows=await readObjects(sheetName,headers);const hit:any=rows.find((r:any)=>r[key]===value);if(!hit)throw new Error('Không tìm thấy dòng cần cập nhật.');await client().spreadsheets.values.update({spreadsheetId:env.GOOGLE_SHEETS_ID!,range:`${sheetName}!A${hit.__rowNumber}:ZZ${hit.__rowNumber}`,valueInputOption:'RAW',requestBody:{values:[headers.map(h=>obj[h]??'')]}})}
export async function clearSheet(sheetName:string,headers:string[]){await ensureHeader(sheetName,headers);await client().spreadsheets.values.clear({spreadsheetId:env.GOOGLE_SHEETS_ID!,range:`${sheetName}!A2:ZZ`})}
export async function deleteSheet(sheetName:string){const sheets=client(),id=env.GOOGLE_SHEETS_ID!;const meta=await sheets.spreadsheets.get({spreadsheetId:id});const sh=meta.data.sheets?.find(s=>s.properties?.title===sheetName);if(!sh?.properties?.sheetId)return;await sheets.spreadsheets.batchUpdate({spreadsheetId:id,requestBody:{requests:[{deleteSheet:{sheetId:sh.properties.sheetId}}]}})}
