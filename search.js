/* AnimeX search */
var _db2;
function debounce2(f,ms){clearTimeout(_db2);_db2=setTimeout(f,ms);}
function hookSearch(){
 var box=document.getElementById('searchBox');
 if(box)box.addEventListener('input',function(){debounce2(doSearch.bind(null,box.value),500);});
}
async function doSearch(q){
 q=(q||'').trim();if(q.length<2)return;
 var anList=[],tvList=[];
 try{var an=await jikan('/search/anime?q='+encodeURIComponent(q)+'&limit=10');anList=(an.data||[]).map(mapAnime);}catch(e){}
 try{var r=await fetch(API.tvmaze+'/search/shows?q='+encodeURIComponent(q));var tv=await r.json();tvList=(tv||[]).map(function(x){return mapSeries(x.show);});}catch(e){}
 showResults(anList.concat(tvList));
}
function showResults(list){
 var app=document.getElementById('app');
 app.innerHTML='<section><div class="row-head"><h2>نتائج البحث</h2><a href="index.html" class="see-all">رجوع</a></div><div class="grid" id="searchGrid"></div></section>';
 renderGrid(document.getElementById('searchGrid'),list);
}
