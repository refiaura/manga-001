import type { Manga, Page, LibraryItem, Status } from './types';
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
async function request<T>(path:string, init:RequestInit={}):Promise<T>{
  const response=await fetch(`${base}${path}`,{...init,credentials:'include',headers:{'Content-Type':'application/json',...init.headers}});
  if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.message||`Permintaan gagal (${response.status})`);}
  return response.status===204?undefined as T:response.json();
}
export const api={
  catalog:(query:URLSearchParams,signal?:AbortSignal)=>request<Page<Manga[]>>(`/manga?${query}`,{signal}),
  detail:(id:string)=>request<{data:Manga}>(`/manga/${id}`),
  genres:()=>request<{data:{id:number;name:string}[]}>('/genres'),
  library:()=>request<{data:LibraryItem[]}>('/library'),
  add:(item:LibraryItem)=>request<{data:LibraryItem}>('/library',{method:'POST',body:JSON.stringify(item)}),
  update:(id:string,status:Status)=>request(`/library/${id}`,{method:'PATCH',body:JSON.stringify({readingStatus:status})}),
  remove:(id:string)=>request(`/library/${id}`,{method:'DELETE'}),
  sync:(items:LibraryItem[])=>request<{data:{succeeded:number;failed:number}}>('/sync/guest-library',{method:'POST',body:JSON.stringify({items})}),
  register:(email:string,password:string,displayName:string)=>request('/auth/register',{method:'POST',body:JSON.stringify({email,password,displayName})}),
  login:(email:string,password:string)=>request('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  logout:()=>request('/auth/logout',{method:'POST'}),
  me:()=>request<{data:{email:string;displayName:string}}>('/users/me')
};
