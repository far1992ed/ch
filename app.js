/* AnimeX core — Jikan (MyAnimeList) + TVMaze */
const API={jikan:'https://api.jikan.moe/v4',tvmaze:'https://api.tvmaze.com'};
const QUALITIES=['1080p','720p','480p','360p'];
const SRC={
 muse:{name:'Muse Asia',url:'https://www.youtube.com/@MuseAsia'},
 anione:{name:'Ani-One',url:'https://www.youtube.com/@Ani-One'},
 crunchy:{name:'Crunchyroll',url:'https://www.crunchyroll.com'},
 yt:{name:'YouTube',url:'https://www.youtube.com/results?search_query='}
};
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const _cache=new Map();
function toast(m){const t=$('#toast');if(!t)return alert(m);t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600);}
function save(k,v){localStorage.setItem('anx:'+k,JSON.stringify(v));}
function load(k,d){try{return JSON.parse(localStorage.getItem('anx:'+k))??d;}catch{return d;}}
function img(src){const s=(src||'').trim();return /^https:\/\//.test(s)?s:'https://placehold.co/300x450/1a2338/93a0b8?text=%D8%A8%D8%AF%D9%88%D9%86+%D8%B5%D9%88%D8%B1%D8%A9';}
let _db;function debounce(f,ms){clearTimeout(_db);_db=setTimeout(f,ms);}
async function jget(url,ttl=6e5){const h=_cache.get(url);if(h&&Date.now()-h.t<ttl)return h.d;const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();_cache.set(url,{t:Date.now(),d});return d;}
async function jikan(p){for(let i=0;i<3;i++){try{return await jget(API.jikan+p);}catch(e){if(String(e).includes('429'))await new Promise(r=>setTimeout(r,1100));else throw e;}}throw new Error('تعذر الاتصال بمصدر الأنمي');}

const WL={all(){return load('wl',[]);},has(id){return this.all().some(x=>x.id===id);},toggle(it){let l=this.all();if(this.has(it.id)){l=l.filter(x=>x.id!==it.id);toast('تمت الإزالة من قائمتي ✕');}else{l.unshift(it);toast('أُضيف إلى قائمتي ✓');}save('wl',l);}};

function mapAnime(a){return{id:'an'+a.mal_id,kind:'anime',title:a.title,titleEn:a.title_english||'',poster:img(a.images?.jpg?.large_image_url),score:a.score,episodes:a.episodes||12,year:a.year||a.aired?.from?.slice(0,4)||'',genres:(a.genres||[]).map(g=>g.name).slice(0,3),synopsis:a.synopsis||'لا يوجد وصف متاح.',mal_id:a.mal_id};}
function mapSeries(s){return{id:'tv'+s.id,kind:'series',title:s.name,titleEn:'',poster:img(s.image?.original||s.image?.medium),score:s.rating?.average,episodes:s._embedded?.episodes?.length||12,year:(s.premiered||'').slice(0,4),genres:(s.genres||[]).slice(0,3),synopsis:s.summary?s.summary.replace(/<[^>]+>/g,''):'لا يوجد وصف متاح.',tvmaze_id:s.id,officialSite:s.officialSite||s.network?.officialSite||''};}

function cardHTML(it){
 const tag=it.score?'★ '+it.score:(it.kind==='anime'?'أنمي':'مسلسل');
 const sub=it.kind==='anime'?'مترجم + مدبلج':'مترجم';
 return `<article class="card" data-id="${it.id}"><div class="thumb"><img src="${it.poster}" alt="" loading="lazy"><span class="tag">${tag}</span><span class="subtag">${sub}</span></div><div class="info"><div class="title">${it.title}</div><div class="meta"><span>${it.year||''}</span>•<span>${it.episodes||'?'} حلقة</span></div></div></article>`;
}
function renderGrid(el,list){
 if(!el)return;
 if(!list.length){el.innerHTML='<p class="wl-empty">لا توجد نتائج.</p>';return;}
 el.innerHTML=list.map(cardHTML).join('');
 $$('.card',el).forEach(c=>c.addEventListener('click',()=>openDetail(c.dataset.id)));
}
function skeleton(el,n){if(el)el.innerHTML=Array.from({length:n},()=>'<div class="skeleton"><div class="thumb"></div></div>').join('');}

const detailStore=new Map();
function remember(it){detailStore.set(it.id,it);}

async function openDetail(id){
 if(!id)return;
 let it=detailStore.get(id);
 if(!it){
  try{
   if(id.startsWith('an')){const d=await jikan('/anime/'+id.slice(2));it=mapAnime(d.data||d);}
   else{const r=await fetch(`${API.tvmaze}/shows/${id.slice(2)}?embed[]=episodes`);it=mapSeries(await r.json());}
  }catch{toast('تعذر تحميل التفاصيل');return;}
 }
 remember(it);renderDetail(it);
}
