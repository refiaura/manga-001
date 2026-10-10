export type Status = 'READING'|'PLAN_TO_READ'|'COMPLETED'|'ON_HOLD'|'DROPPED';
export type Manga = { id:number; title:string; titleEnglish:string|null; titleJapanese:string|null; imageUrl:string|null; synopsis:string|null; type:string|null; status:string|null; score:number|null; chapters:number|null; volumes:number|null; authors:string[]; genres:{id:number;name:string}[]; url:string|null };
export type LibraryItem = { id?:string; provider:'JIKAN'; externalMangaId:number; titleSnapshot:string; coverUrlSnapshot:string|null; readingStatus:Status; addedAt:string; updatedAt:string };
export type Page<T> = { data:T; pagination:{page:number;limit:number;hasNext:boolean;total:number} };
