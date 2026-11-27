/* AnimeX events — tabs and theme */
function bindUI(){
 var tabs=document.querySelectorAll('.tab-btn');
 tabs.forEach(function(b){
  b.addEventListener('click',function(){
   tabs.forEach(function(x){x.classList.remove('active');});
   b.classList.add('active');
   document.getElementById('animePane').classList.toggle('hidden',b.dataset.tab!=='anime');
   document.getElementById('seriesPane').classList.toggle('hidden',b.dataset.tab!=='series');
  });
 });
 var navs=document.querySelectorAll('.main-nav .nav-link[data-tab]');
 navs.forEach(function(a){
  a.addEventListener('click',function(e){
   e.preventDefault();
   var btn=document.querySelector('.tab-btn[data-tab="'+a.dataset.tab+'"]');
   if(btn)btn.click();
  });
 });
 if(load('theme','dark')==='light')document.documentElement.dataset.theme='light';
 var tg=document.getElementById('themeToggle');
 if(tg)tg.addEventListener('click',function(){
  var light=document.documentElement.dataset.theme==='light';
  if(light){delete document.documentElement.dataset.theme;save('theme','dark');}
  else{document.documentElement.dataset.theme='light';save('theme','light');}
 });
}
