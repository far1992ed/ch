/* FarAni home — loading home page data with Kitsu fallback */
async function loadHome(){
 ['animeTop','animeSeason','seriesTop','seriesRunning'].forEach(function(id){skel(document.getElementById(id),8);});
 // انمي: Jikan ثم Kitsu بديل
 var topDone=false;
 try{
  var d=await jikan('/top/anime');
  renderGrid(document.getElementById('animeTop'),(d.data||[]).slice(0,12).map(mapAnime));
  topDone=true;
 }catch(e){}
 if(!topDone){
  try{
   var k=await kitsu('/trending/anime');
   renderGrid(document.getElementById('animeTop'),(k.data||[]).slice(0,12).map(mapKitsu));
  }catch(e2){document.getElementById('animeTop').innerHTML='<p class="wl-empty">تعذر تحميل الانمي، حدث الصفحة</p>';}
 }
 // موسم حالي: Jikan ثم Kitsu
 var seasonDone=false;
 try{
  var s=await jikan('/seasons/now');
  renderGrid(document.getElementById('animeSeason'),(s.data||[]).slice(0,12).map(mapAnime));
  seasonDone=true;
 }catch(e){}
 if(!seasonDone){
  try{
   var k2=await kitsu('/anime?sort=-userCount&filter[status]=current&limit=12');
   renderGrid(document.getElementById('animeSeason'),(k2.data||[]).map(mapKitsu));
  }catch(e3){document.getElementById('animeSeason').innerHTML='<p class="wl-empty">تعذر تحميل انمي الموسم</p>';}
 }
 // مسلسلات: TVMaze
 try{
  var r=await fetchT(API.tvmaze+'/shows');
  var shows=await r.json();
  renderGrid(document.getElementById('seriesTop'),shows.slice(0,24).map(mapSeries));
  var run=shows.filter(function(x){return x.status==='Running';}).slice(0,12);
  renderGrid(document.getElementById('seriesRunning'),run.map(mapSeries));
 }catch(e){
  document.getElementById('seriesTop').innerHTML='<p class="wl-empty">تعذر تحميل المسلسلات</p>';
  document.getElementById('seriesRunning').innerHTML='<p class="wl-empty">تعذر تحميل المسلسلات الجارية</p>';
 }
}
