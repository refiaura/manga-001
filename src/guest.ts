import type { LibraryItem, Manga, Status } from './types';
const KEY='manga-reader:guest-library:v1';
const valid=(v:any):v is LibraryItem=>v&&v.provider==='JIKAN'&&Number.isInteger(v.externalMangaId)&&v.externalMangaId>0&&typeof v.titleSnapshot==='string'&&['READING','PLAN_TO_READ','COMPLETED','ON_HOLD','DROPPED'].includes(v.readingStatus)&&!Number.isNaN(Date.parse(v.updatedAt));
export function readGuest():LibraryItem[]{try{const raw=localStorage.getItem(KEY);if(!raw)return[];const parsed=JSON.parse(raw);return parsed?.schemaVersion===1&&Array.isArray(parsed.items)?parsed.items.filter(valid):[];}catch{return[];}}
function write(items:LibraryItem[]){try{localStorage.setItem(KEY,JSON.stringify({schemaVersion:1,items}));return true;}catch{return false;}}
export function upsertGuest(items:LibraryItem[],m:Manga,status:Status='PLAN_TO_READ'){const now=new Date().toISOString();const old=items.find(x=>x.externalMangaId===m.id);const item:LibraryItem={provider:'JIKAN',externalMangaId:m.id,titleSnapshot:m.title,coverUrlSnapshot:m.imageUrl,readingStatus:status,addedAt:old?.addedAt||now,updatedAt:now};const next=[item,...items.filter(x=>x.externalMangaId!==m.id)];write(next);return next;}
export function changeGuest(items:LibraryItem[],id:number,status:Status){const next=items.map(x=>x.externalMangaId===id?{...x,readingStatus:status,updatedAt:new Date().toISOString()}:x);write(next);return next;}
export function removeGuest(items:LibraryItem[],id:number){const next=items.filter(x=>x.externalMangaId!==id);write(next);return next;}
export function clearGuest(){try{localStorage.removeItem(KEY);}catch{/* storage may be blocked */}}
