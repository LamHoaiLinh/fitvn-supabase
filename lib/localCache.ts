'use client';
export function saveLocal<T>(k:string,v:T){if(typeof window!=='undefined')localStorage.setItem(k,JSON.stringify(v))}
export function readLocal<T>(k:string):T|null{if(typeof window==='undefined')return null;const r=localStorage.getItem(k);if(!r)return null;try{return JSON.parse(r) as T}catch{return null}}
export function removeLocal(k:string){if(typeof window!=='undefined')localStorage.removeItem(k)}
