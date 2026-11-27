/* AnimeX proxy and cache helpers */
const API={jikan:'https://api.jikan.moe/v4',tvmaze:'https://api.tvmaze.com'};
const QUALITIES=['1080p','720p','480p','360p'];
const IMGPROXY='https://wsrv.nl/?url=';
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
function toast(m){const t=$('#toast');if(!t)return alert(m);t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600);}
function save(k,v){try{localStorage.setItem('anx:'+k,JSON.stringify(v));}catch(e){}}
function load(k,d){try{return JSON.parse(localStorage.getItem('anx:'+k))??d;}catch{return d;}}
function imgFail(el){el.onerror=null;el.src='data:image/svg+xml;charset=utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="340" height="500"><rect width="100%" height="100%" fill="#1a2338"/><text x="50%" y="50%" fill="#93a0b8" text-anchor="middle" font-size="22">AnimeX</text></svg>');}
function img(src){const s=(src||'').trim();if(!s)return '';if(s.indexOf('wsrv.nl')>-1)return s;return IMGPROXY+encodeURIComponent(s)+'&w=340&h=500&fit=cover&output=webp&q=72';}
let _db;function debounce(f,ms){clearTimeout(_db);_db=setTimeout(f,ms);}
const _mem=new Map();
function memGet(u){const h=_mem.get(u);if(h&&Date.now()-h.t<6e5)return h.d;}
function memSet(u,d){_mem.set(u,{t:Date.now(),d});}
async function fetchJSON(url,cacheKey,ttl){
 const now=Date.now();
 try{const c=JSON.parse(localStorage.getItem('anxc:'+cacheKey)||'null');if(c&&now-c.t<ttl)return c.d;}catch(e){}
 try{const m=memGet(url);if(m)return m;}catch(e){}
 const r=await fetch(url);
 if(!r.ok)throw new Error('HTTP '+r.status);
 const d=await r.json();
 memSet(url,d);
 try{localStorage.setItem('anxc:'+cacheKey,JSON.stringify({t:now,d}));}catch(e){}
 return d;
}
async function jikan(p){
 for(let i=0;i<4;i++){
  try{return await fetchJSON(API.jikan+p,'jk'+p,36e5);}
  catch(e){
   if(String(e).indexOf('429')>-1)await new Promise(r=>setTimeout(r,1200*(i+1)));
   else if(i===0)await new Promise(r=>setTimeout(r,800));
   else throw e;
  }
 }
 try{const c=JSON.parse(localStorage.getItem('anxc:jk'+p)||'null');if(c&&c.d)return c.d;}catch(e){}
 throw new Error('تعذر الاتصال بمصدر الانمي');
}
async function tvmaze(p){
 try{return await fetchJSON(API.tvmaze+p,'tv'+p,72e5);}
 catch(e){
  try{const c=JSON.parse(localStorage.getItem('anxc:tv'+p)||'null');if(c&&c.d)return c.d;}catch(e2){}
  throw e;
 }
}
