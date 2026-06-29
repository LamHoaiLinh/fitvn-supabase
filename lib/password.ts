import bcrypt from 'bcrypt';
export const hashPassword=(p:string)=>bcrypt.hash(p,12);
export const verifyPassword=(p:string,h:string)=>bcrypt.compare(p,h);
export const hashToken=(t:string)=>bcrypt.hash(t,12);
export const verifyToken=(t:string,h?:string)=>h?bcrypt.compare(t,h):false;
