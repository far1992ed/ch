/* FarAni player — modal, quality picker, download (ADM/1DM/direct) */
function closeModal(){var m=document.getElementById('playerModal');if(m)m.remove();}
function pickQ(b,q){Q=q;
 var bar=b.closest('.controls-bar');
 if(bar){bar.querySelectorAll('.q-btn').forEach(function(x){x.classList.remove('active');});}
 b.classList.add('active');
 var h=document.getElementById('qHint');if(h)h.textContent=q;
 toast('الجودة: '+q);}
function dl(method,inputId){
 var inp=document.getElementById(inputId||'dlUrl');
 var url=(inp&&inp.value||'').trim();
 if(!/^https?:\/\//i.test(url)){toast('ضع رابطا صحيحا يبدأ ب http');return;}
 if(method==='adm'){location.href='adm://'+url;toast('اذا لم يفتح ADM ثبته من Google Play');}
 else if(method==='1dm'){location.href='idm://'+url;toast('اذا لم يفتح 1DM ثبته من Google Play');}
 else if(method==='direct'){var a=document.createElement('a');a.href=url;a.download='';a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();toast('بدأ التنزيل المباشر');}
 else if(method==='copy'){if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast('تم نسخ الرابط');});}else{toast('انسخ الرابط يدويا');}}}
function openPlayer(id,ep){
 ep=ep||1;
 var it=detailStore.get(id);if(!it)return;
 var body;
 if(it.kind==='anime'){
  var q=encodeURIComponent((it.titleEn||it.title)+' ep '+ep);
  var srcs=AUDIO==='dub'
   ?[{n:'Crunchyroll (مدبلج)',u:'https://www.crunchyroll.com',q:'1080p/720p'},{n:'YouTube (مدبلج)',u:'https://www.youtube.com/results?search_query='+q,q:'حسب الفيديو'}]
   :[{n:'Muse Asia (رسمي مجاني)',u:'https://www.youtube.com/@MuseAsia',q:'1080p/720p'},{n:'Ani-One (رسمي مجاني)',u:'https://www.youtube.com/@Ani-One',q:'1080p/720p'},{n:'Crunchyroll',u:'https://www.crunchyroll.com',q:'1080p/720p/480p'},{n:'YouTube',u:'https://www.youtube.com/results?search_query='+q,q:'حسب الفيديو'}];
  body='<div class="player-note"><b>'+it.title+'</b> — الحلقة '+ep+'<br>المصادر الرسمية المجانية:</div><div class="dl-row" style="padding:0 18px 16px">';
  srcs.forEach(function(s){body+='<a class="dl-btn copy" style="text-align:center" href="'+s.u+'" target="_blank" rel="noopener">▶ '+s.n+' <small style="opacity:.7">('+s.q+')</small></a>';});
  body+='</div>';
 }else{
  body='<div class="player-note"><b>'+it.title+'</b> — الحلقة '+ep+'<br>'+(it.officialSite?'<a href="'+it.officialSite+'" target="_blank" rel="noopener" style="font-weight:700">فتح الموقع الرسمي للمشاهدة</a>':'المشاهدة متاحة عبر الموقع الرسمي للقناة.')+'</div>';
 }
 var m=document.createElement('div');m.className='modal';m.id='playerModal';
 var qs='';QUALITIES.forEach(function(x){qs+='<button class="q-btn'+(x===Q?' active':'')+'" onclick="pickQ(this,\''+x+'\')">'+x+'</button>';});
 m.innerHTML='<div class="modal-box"><div class="modal-head"><h3>▶ '+it.title+' — الحلقة '+ep+'</h3><button class="modal-close" onclick="closeModal()">✕</button></div>'
 +'<div style="background:var(--bg2);padding:20px">'+body+'</div>'
 +'<div class="controls-bar"><span class="ctl-label">الجودة:</span>'+qs+'</div>'
 +'<div class="dl-section"><input class="dl-input" type="url" id="dlUrlModal" dir="ltr" placeholder="رابط الحلقة (mp4) لتنزيلها">'
 +'<div class="dl-row"><button class="dl-btn adm" onclick="dl(\'adm\',\'dlUrlModal\')">⬇ ADM</button><button class="dl-btn dl1dm" onclick="dl(\'1dm\',\'dlUrlModal\')">⬇ 1DM</button><button class="dl-btn native" onclick="dl(\'direct\',\'dlUrlModal\')">⬇ مباشر</button></div>'
 +'<p class="dl-hint">الجودة المختارة: <b id="qHint">'+Q+'</b> — انسخ رابط الجودة المطلوبة من المصدر الرسمي والصقه هنا.</p></div></div>';
 m.addEventListener('click',function(e){if(e.target===m)closeModal();});
 document.body.appendChild(m);
}
