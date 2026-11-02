(function(){
  var h=document.querySelector('.site-header'),b=document.querySelector('.menu-btn');
  if(b&&h){b.addEventListener('click',function(){var o=h.classList.toggle('nav-open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Close menu':'Open menu');});}
  var dd=[].slice.call(document.querySelectorAll('.nav-links details'));
  dd.forEach(function(d){d.addEventListener('toggle',function(){if(d.open){dd.forEach(function(o){if(o!==d)o.open=false;});}});});
  document.addEventListener('click',function(e){dd.forEach(function(d){if(!d.contains(e.target))d.open=false;});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){dd.forEach(function(d){d.open=false;});if(h)h.classList.remove('nav-open');}});
  var f=document.querySelector('form[data-demo]');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();if(!f.reportValidity())return;f.closest('.form-wrap').classList.add('sent');var ok=document.querySelector('.form-ok');if(ok){ok.setAttribute('tabindex','-1');ok.focus();}});}
})();

(function(){var g=document.querySelector('[data-bento]');if(!g)return;var t=[].slice.call(g.children),k=0,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function step(){t.forEach(function(x){x.classList.remove('on');});t[k%t.length].classList.add('on');k++;}
step();if(!RM){var iv=setInterval(step,2600);g.addEventListener('mouseenter',function(){clearInterval(iv);});g.addEventListener('mouseleave',function(){iv=setInterval(step,2600);});
t.forEach(function(x,i){x.addEventListener('mouseenter',function(){t.forEach(function(y){y.classList.remove('on');});x.classList.add('on');k=i+1;});});}
var n=g.querySelector('[data-count]');if(n&&!RM){var v=+n.getAttribute('data-count');setInterval(function(){v+=Math.round(200+Math.random()*1800);n.textContent='₹'+v.toLocaleString('en-IN');},1700);}})();
(function(){var r=document.querySelector('[data-chap-rail]');if(!r)return;var secs=[].slice.call(document.querySelectorAll('[data-chap]')),links=[].slice.call(r.querySelectorAll('a'));
function upd(){var y=window.innerHeight*0.5,cur=null;secs.forEach(function(s){var b=s.getBoundingClientRect();if(b.top<=y)cur=s;});
var last=secs[secs.length-1].getBoundingClientRect().bottom;r.classList.toggle('show',!!cur&&last>y);
links.forEach(function(a){a.classList.toggle('on',!!cur&&a.getAttribute('data-rail')===cur.getAttribute('data-chap'));});}
window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();})();
