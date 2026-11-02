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
(function(){var nav=document.querySelector('[data-routemap]');if(!nav)return;
var hdr=document.querySelector('.site-header'),secs=[].slice.call(document.querySelectorAll('[data-chap]')),links=[].slice.call(nav.querySelectorAll('[data-stop]')),
fill=nav.querySelector('[data-rm-fill]'),now=nav.querySelector('[data-rm-now]'),sc=nav.querySelector('.rm-scroll'),track=nav.querySelector('.rm-track'),line=nav.querySelector('.rm-line'),last=-2,tick=false;
function setH(){var h=hdr?hdr.offsetHeight:0;document.documentElement.style.setProperty('--hdr',h+'px');}
function cx(a){var n=a.querySelector('.rm-node');return n.offsetLeft+a.offsetLeft+a.parentNode.offsetLeft+n.offsetWidth/2-line.offsetLeft;}
function upd(){tick=false;var top=(hdr?hdr.offsetHeight:0)+nav.offsetHeight+40,idx=-1,frac=0;
secs.forEach(function(s,i){var b=s.getBoundingClientRect();if(b.top<=top){idx=i;frac=Math.min(1,Math.max(0,(top-b.top)/b.height));}});
nav.classList.toggle('stuck',nav.getBoundingClientRect().top<=(hdr?hdr.offsetHeight:0)+1);
var w=0;if(idx>=0){var a=cx(links[idx]),b=idx<links.length-1?cx(links[idx+1]):line.offsetWidth;w=a+(b-a)*frac;}fill.style.width=Math.max(0,w)+'px';
if(idx!==last){last=idx;links.forEach(function(l,i){l.classList.toggle('on',i===idx);l.classList.toggle('done',i<idx);if(i===idx)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current');});
if(now)now.textContent=idx>=0?links[idx].querySelector('b').textContent+' · '+links[idx].querySelector('.rm-lbl').textContent:'Start';
if(idx>=0&&sc.scrollWidth>sc.clientWidth){var l=links[idx].parentNode;sc.scrollTo({left:l.offsetLeft-sc.clientWidth/2+l.offsetWidth/2,behavior:'smooth'});}}}
function req(){if(!tick){tick=true;requestAnimationFrame(upd);}}
setH();window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',function(){setH();req();});upd();})();
