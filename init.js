/* AnimeX watchlist + init */
function renderWatchlist(){
 var app=document.getElementById('app');
 var list=WL.all();
 var head='<section><div class="row-head"><h2>قائمتي ('+list.length+')</h2>';
 if(list.length)head+='<button class="clear-btn" onclick="clearWL()">مسح الكل</button>';
 head+='</div>';
 if(list.length)head+='<div class="grid" id="wlGrid"></div>';
 else head+='<div class="wl-empty"><div class="big">🍿</div><p>لا شيء هنا بعد</p><p style="margin-top:14px"><a class="see-all" href="index.html">تصفح الانمي والمسلسلات</a></p></div>';
 head+='</section>';
 app.innerHTML=head;
 if(list.length){renderGrid(document.getElementById('wlGrid'),list);list.forEach(remember);}
}
function clearWL(){save('wl',[]);renderWatchlist();toast('تم مسح القائمة');}
window.addEventListener('DOMContentLoaded',function(){
 bindUI();
 hookSearch();
 if(document.body.dataset.page==='watchlist')renderWatchlist();
 else if(document.getElementById('homeView'))loadHome();
});
