/* AnimeX data mapping and cards */
const WL={all(){return load('wl',[]);},has(id){return this.all().some(x=>x.id===id);},toggle(it){let l=this.all();if(this.has(it.id)){l=l.filter(x=>x.id!==it.id);toast('تمت الازالة');}else{l.unshift(it);toast('اضيف الى قائمتي');}save('wl',l);}};
function mapAnime(a){return{id:'an'+a.mal_id,kind:'anime',title:a.title,titleEn:a.title_english||'',poster:a.images&&a.images.jpg?(a.images.jpg.large_image_url||a.images.jpg.image_url):'',score:a.score,episodes:a.episodes||12,year:a.year||(a.aired&&a.aired.from?a.aired.from.slice(0,4):''),genres:(a.genres||[]).map(function(g){return g.name;}).slice(0,3),synopsis:a.synopsis||'لا يوجد وصف.',mal_id:a.mal_id};}
function mapSeries(s){return{id:'tv'+s.id,kind:'series',title:s.name,titleEn:'',poster:s.image?(s.image.original||s.image.medium):'',score:s.rating?s.rating.average:null,episodes:s._embedded&&s._embedded.episodes?s._embedded.episodes.length:12,year:(s.premiered||'').slice(0,4),genres:(s.genres||[]).slice(0,3),synopsis:s.summary?s.summary.replace(/<[^>]+>/g,''):'لا يوجد وصف.',tvmaze_id:s.id,officialSite:s.officialSite||(s.network?s.network.officialSite:'')};}
function cardHTML(it){
 const tag=it.score?'★ '+it.score:(it.kind==='anime'?'انمي':'مسلسل');
 const sub=it.kind==='anime'?'مترجم + مدبلج':'مترجم';
 return '<article class="card" data-id="'+it.id+'"><div class="thumb"><img src="'+img(it.poster)+'" onerror="imgFail(this)" alt="" loading="lazy"><span class="tag">'+tag+'</span><span class="subtag">'+sub+'</span></div><div class="info"><div class="title">'+it.title+'</div><div class="meta"><span>'+(it.year||'')+'</span><span>'+(it.episodes||'?')+' حلقة</span></div></div></article>';
}
function renderGrid(el,list){
 if(!el)return;
 if(!list.length){el.innerHTML='<p class="wl-empty">لا توجد نتائج.</p>';return;}
 el.innerHTML=list.map(cardHTML).join('');
 $$('.card',el).forEach(function(c){c.addEventListener('click',function(){openDetail(c.dataset.id);});});
}
function skeleton(el,n){if(el)el.innerHTML=Array.from({length:n},()=>'<div class="skeleton"><div class="thumb"></div></div>').join('');}
const detailStore=new Map();
function remember(it){detailStore.set(it.id,it);}
async function openDetail(id){
 if(!id)return;
 let it=detailStore.get(id);
 if(!it){
  try{
   if(id.indexOf('an')===0){const d=await jikan('/anime/'+id.slice(2));it=mapAnime(d.data||d);}
   else{const d=await tvmaze('/shows/'+id.slice(2)+'?embed[]=episodes');it=mapSeries(d);}
  }catch(e){toast('تعذر تحميل التفاصيل');return;}
 }
 remember(it);renderDetail(it);
}
