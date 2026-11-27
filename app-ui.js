/* AnimeX UI — detail page, audio toggle */
let AUDIO='sub',Q='720p',_cur=null;
function epBtn(id,n){return '<button class="ep-btn" onclick="openPlayer(\''+id+'\','+n+')">الحلقة '+n+'</button>';}
function dlBtns(inp){return '<button class="dl-btn adm" onclick="dl(\'adm\',\''+inp+'\')">⬇ ADM</button><button class="dl-btn dl1dm" onclick="dl(\'1dm\',\''+inp+'\')">⬇ 1DM</button><button class="dl-btn native" onclick="dl(\'direct\',\''+inp+'\')">⬇ مباشر</button><button class="dl-btn copy" onclick="dl(\'copy\',\''+inp+'\')">📋 نسخ</button>';}
function renderDetail(it){
 _cur=it;document.title=it.title+' — AnimeX';
 var app=document.getElementById('app');if(!app)return;
 var audio=it.kind==='anime'
  ?'<span class="pill ok" id="pillSub" onclick="switchAudio(\'sub\')">مترجم</span><span class="pill" id="pillDub" onclick="switchAudio(\'dub\')">مدبلج</span>'
  :'<span class="pill ok">مترجم (رسمي)</span>';
 app.innerHTML='<section><div class="detail-hero"><div class="detail-poster"><img src="'+img(it.poster)+'" onerror="imgFail(this)" alt=""></div>'
 +'<div class="detail-body"><h1>'+it.title+' '+(it.titleEn&&it.titleEn!==it.title?'<small style="color:var(--muted)">('+it.titleEn+')</small>':'')+'</h1>'
 +'<div class="detail-meta"><span class="pill '+(it.score>=8?'ok':'warn')+'">★ '+(it.score||'—')+'</span><span class="pill">'+(it.year||'—')+'</span><span class="pill">'+(it.episodes||'?')+' حلقة</span><span class="pill">'+((it.genres||[]).join(' • ')||'—')+'</span>'+audio+'</div>'
 +'<p class="synopsis" id="syn"></p>'
 +'<div class="dl-row" style="margin-top:18px"><button class="dl-btn native" onclick="openPlayer(\''+it.id+'\',1)">▶ شاهد الحلقة 1</button><button class="dl-btn copy" id="wlBtn" onclick="toggleWL()">'+(WL.has(it.id)?'✓ في قائمتي':'+ قائمتي')+'</button><button class="dl-btn copy" onclick="scrollDl()">⬇ التنزيل</button></div>'
 +'</div></div><h2 style="margin:24px 22px 12px">قائمة الحلقات</h2><div class="ep-list" id="epList"></div>'
 +'<div id="downloadZone"><h2 style="margin:24px 22px 12px">⬇ مركز التنزيل</h2><div class="dl-section dl-box"><input id="dlUrl" class="dl-input" type="url" dir="ltr" placeholder="ضع رابط الحلقة (mp4) هنا"><div class="dl-row">'+dlBtns('dlUrl')+'</div>'
 +'<p class="dl-hint">ADM و 1DM: ثبتهما من Google Play. يدعمان استكمال التنزيل والجودات المتعددة.</p></div></div></section>';
 var syn=document.getElementById('syn');
 syn.innerHTML=short(it.synopsis,300)+(it.synopsis.length>300?' <span class="synopsis-more" onclick="expandSyn()">المزيد…</span>':'');
 syn.dataset.full='0';
 var eps=Math.min(Number(it.episodes)||1,400);
 var list=document.getElementById('epList'),h='';
 for(var i=1;i<=eps;i++)h+=epBtn(it.id,i);
 list.innerHTML=h;
 window.scrollTo(0,0);
}
function scrollDl(){document.getElementById('downloadZone').scrollIntoView({behavior:'smooth'});}
function short(t,n){return (t||'').length>n?t.slice(0,n)+'…':t;}
function expandSyn(){var s=document.getElementById('syn');
 if(s.dataset.full==='1'){s.innerHTML=short(_cur.synopsis,300)+' <span class="synopsis-more" onclick="expandSyn()">المزيد…</span>';s.dataset.full='0';}
 else{s.innerHTML=_cur.synopsis+' <span class="synopsis-more" onclick="expandSyn()">أقل</span>';s.dataset.full='1';}}
function toggleWL(){WL.toggle(_cur);document.getElementById('wlBtn').textContent=WL.has(_cur.id)?'✓ في قائمتي':'+ قائمتي';}
function switchAudio(m){AUDIO=m;
 var s=document.getElementById('pillSub'),d=document.getElementById('pillDub');
 if(s)s.classList.toggle('ok',m==='sub');
 if(d)d.classList.toggle('ok',m==='dub');
 toast(m==='dub'?'الوضع: مدبلج':'الوضع: مترجم');}
