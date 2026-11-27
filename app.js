/* FarAni core — Jikan (MyAnimeList) + TVMaze + Kitsu fallback */
const API={jikan:'https://api.jikan.moe/v4',tvmaze:'https://api.tvmaze.com',kitsu:'https://kitsu.io/api/edge'};
const QUALITIES=['1080p','720p','480p','360p'];
const PLACEHOLDER='https://placehold.co/300x450/1a2338/93a0b8?text=FarAni';
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const _cache=new Map();
function toast(m){const t=$('#toast');if(!t)return alert(m);t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600);}
function save(k,v){localStorage.setItem('anx:'+k,JSON.stringify(v));}
function load(k,d){try{return JSON.parse(localStorage.getItem('anx:'+k))??d;}catch{return d;}}
function img(src){const s=(src||'').trim();return /^https?:\/\//.test(s)?s:PLACEHOLDER;}
let _db;function debounce(f,ms){clearTimeout(_db);_db=setTimeout(f,ms);}

/* fetch مع مهلة زمنية 8 ثوانٍ */
function fetchT(url,opt){
 opt=opt||{};
 if(AbortController){
  var c=new AbortController();
  var t=setTimeout(function(){c.abort();},8000);
  opt=Object.assign({},opt,{signal:c.signal});
  return fetch(url,opt).finally(function(){clearTimeout(t);});
 }
 return fetch(url,opt);
}
async function jget(url,ttl){
 ttl=ttl||600000;
 var h=_cache.get(url);
 if(h&&Date.now()-h.t<ttl)return h.d;
 var r=await fetchT(url);
 if(!r.ok)throw new Error('HTTP '+r.status);
 var d=await r.json();
 _cache.set(url,{t:Date.now(),d:d});
 return d;
}
async function jikan(p){
 for(var i=0;i<2;i++){
  try{return await jget(API.jikan+p);}
  catch(e){
   if(String(e).includes('429'))await new Promise(r=>setTimeout(r,1100));
   else throw e;
  }
 }
 throw new Error('jikan fail');
}
/* Kitsu fallback للانمي */
async function kitsu(path){return await jget(API.kitsu+path,600000);}

const WL={all(){return load('wl',[]);},has(id){return this.all().some(x=>x.id===id);},toggle(it){var l=this.all();if(this.has(it.id)){l=l.filter(x=>x.id!==it.id);toast('تمت الازالة من قائمتي');}else{l.unshift(it);toast('اضيف الى قائمتي');}save('wl',l);}};

function mapAnime(a){return{id:'an'+a.mal_id,kind:'anime',title:a.title,titleEn:a.title_english||'',poster:img(a.images&&a.images.jpg?a.images.jpg.large_image_url:null),score:a.score,episodes:a.episodes||12,year:a.year||(a.aired&&a.aired.from?a.aired.from.slice(0,4):''),genres:(a.genres||[]).map(g=>g.name).slice(0,3),synopsis:a.synopsis||'لا يوجد وصف متاح.',mal_id:a.mal_id};}
function mapKitsu(x){
 var a=x.attributes||{};
 return{id:'ks'+x.id,kind:'anime',title:a.canonicalTitle||a.titles&&a.titles.en||'',titleEn:a.titles&&a.titles.en_jp||'',poster:img(a.posterImage&&a.posterImage.medium),score:a.averageRating?(Math.round(parseFloat(a.averageRating))/10).toFixed(1):null,episodes:a.episodeCount||12,year:(a.startDate||'').slice(0,4),genres:(a.categories||[]).slice(0,3),synopsis:(a.synopsis||'لا يوجد وصف متاح.').replace(/<[^>]+>/g,''),kitsu_id:x.id};
}
function mapSeries(s){return{id:'tv'+s.id,kind:'series',title:s.name,titleEn:'',poster:img(s.image&&(s.image.original||s.image.medium)),score:s.rating&&s.rating.average,episodes:s._embedded&&s._embedded.episodes?s._embedded.episodes.length:12,year:(s.premiered||'').slice(0,4),genres:(s.genres||[]).slice(0,3),synopsis:s.summary?s.summary.replace(/<[^>]+>/g,''):'لا يوجد وصف متاح.',tvmaze_id:s.id,officialSite:s.officialSite||s.network&&s.network.officialSite||''};}

function cardHTML(it){
 var tag=it.score?'★ '+it.score:(it.kind==='anime'?'انمي':'مسلسل');
 var sub=it.kind==='anime'?'مترجم + مدبلج':'مترجم';
 return '<article class="card" data-id="'+it.id+'"><div class="thumb"><img src="'+it.poster+'" alt="" loading="lazy" onerror="this.onerror=null;this.src=\''+PLACEHOLDER+'\'"><span class="tag">'+tag+'</span><span class="subtag">'+sub+'</span></div><div class="info"><div class="title">'+it.title+'</div><div class="meta"><span>'+(it.year||'')+'</span>•<span>'+(it.episodes||'?')+' حلقة</span></div></div></article>';
}
function renderGrid(el,list){
 if(!el)return;
 if(!list||!list.length){el.innerHTML='<p class="wl-empty">لا توجد نتائج.</p>';return;}
 el.innerHTML=list.map(cardHTML).join('');
 $$('.card',el).forEach(c=>c.addEventListener('click',function(){openDetail(c.dataset.id);}));
}
function skel(el,n){
 if(!el)return;var h='';
 for(var i=0;i<n;i++)h+='<div class="skeleton"><div class="thumb"></div></div>';
 el.innerHTML=h;
}
const detailStore=new Map();
function remember(it){detailStore.set(it.id,it);}
async function openDetail(id){
 if(!id)return;
 var it=detailStore.get(id);
 if(!it){
  try{
   if(id.slice(0,2)==='an'){var d=await jikan('/anime/'+id.slice(2));it=mapAnime(d.data||d);}
   else if(id.slice(0,2)==='ks'){var k=await kitsu('/anime/'+id.slice(2));it=mapKitsu(k.data);}
   else{var r=await fetchT(API.tvmaze+'/shows/'+id.slice(2)+'?embed[]=episodes');it=mapSeries(await r.json());}
  }catch(e){toast('تعذر تحميل التفاصيل');return;}
 }
 remember(it);renderDetail(it);
}
