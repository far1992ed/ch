/* AnimeX home v2 — تسلسلي مع تخزين */
function skel(el,n){
 if(!el)return;var h='';
 for(var i=0;i<n;i++)h+='<div class="skeleton"><div class="thumb"></div></div>';
 el.innerHTML=h;
}
async function loadHome(){
 ['animeTop','animeSeason','seriesTop','seriesRunning'].forEach(function(id){skel(document.getElementById(id),8);});
 /* تحميل تسلسلي: انمي شعبي ثم الموسم ثم المسلسلات — لتجنب 429 */
 try{
  var d=await jikan('/top/anime');
  renderGrid(document.getElementById('animeTop'),(d.data||[]).slice(0,12).map(mapAnime));
 }catch(e){document.getElementById('animeTop').innerHTML='<p class="wl-empty">تعذر تحميل الانمي</p>';}
 try{
  var s=await jikan('/seasons/now');
  renderGrid(document.getElementById('animeSeason'),(s.data||[]).slice(0,12).map(mapAnime));
 }catch(e){document.getElementById('animeSeason').innerHTML='<p class="wl-empty">تعذر تحميل انمي الموسم</p>';}
 try{
  var sh=await tvmaze('/shows');
  renderGrid(document.getElementById('seriesTop'),sh.slice(0,24).map(mapSeries));
  var run=sh.filter(function(x){return x.status==='Running';}).slice(0,12);
  renderGrid(document.getElementById('seriesRunning'),run.map(mapSeries));
 }catch(e){
  document.getElementById('seriesTop').innerHTML='<p class="wl-empty">تعذر تحميل المسلسلات</p>';
  document.getElementById('seriesRunning').innerHTML='<p class="wl-empty">تعذر تحميل المسلسلات</p>';
 }
}
