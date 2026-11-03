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

(function(){var btns=[].slice.call(document.querySelectorAll('[data-plan-btn]'));if(!btns.length)return;
var panels=[].slice.call(document.querySelectorAll('[data-plan]')),hint=document.querySelector('[data-plan-hint]');
function pick(k,scroll){btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-plan-btn')===k?'true':'false');});
panels.forEach(function(p){p.hidden=p.getAttribute('data-plan')!==k;});if(hint)hint.hidden=true;
try{localStorage.setItem('dg-plan',k);}catch(e){}
if(scroll){var p=document.querySelector('[data-plan="'+k+'"]');if(p&&p.getBoundingClientRect().top>window.innerHeight*0.7)p.scrollIntoView({behavior:'smooth',block:'center'});}}
btns.forEach(function(b){b.addEventListener('click',function(){pick(b.getAttribute('data-plan-btn'),true);});});
var s=null;try{s=localStorage.getItem('dg-plan');}catch(e){}pick(s&&document.querySelector('[data-plan="'+s+'"]')?s:'cafe',false);})();
(function(){var e=document.querySelector('[data-est]');if(!e)return;
var P={light:[15,5,1,6,3],typical:[25,10,1,12,5],heavy:[50,20,2,25,12]},R=[0.5,1.5,1,3,21];
var D={light:'15 alerts, 5 prepared actions, 1 brief and 6 questions a day',typical:'25 alerts, 10 prepared actions, 1 brief and 12 questions a day',heavy:'50 alerts, 20 prepared actions, 2 briefs and 25 questions a day'};
var v=e.querySelector('[data-est-v]'),d=e.querySelector('[data-est-d]'),bs=[].slice.call(e.querySelectorAll('[data-est-btn]'));
function set(k){var p=P[k],m=(p[0]*R[0]+p[1]*R[1]+p[2]*R[2]+p[3]*R[3])*30+p[4]*R[4];v.textContent='₹'+Math.round(m).toLocaleString('en-IN');d.textContent=D[k]+', plus '+p[4]+' deep analyses a month';
bs.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-est-btn')===k?'true':'false');});}
bs.forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-est-btn'));});});set('typical');})();
(function(){var f=document.querySelector('form[data-demo]');if(!f)return;var q=new URLSearchParams(location.search),k=q.get('plan');if(!k)return;
var M={cloud:['cloud','Cloud Kitchen'],qsr:['cafes','QSR / Darshini'],cafe:['cafes','Café'],fine:['fine','Fine Dine'],smallpub:['bars','Small Pub / Bar'],pub:['bars','Pub'],largepub:['bars','Large Pub'],brewery:['bars','Brewery / Mega Venue'],quote:['','Custom quote']};
var m=M[k];if(!m)return;var t=f.querySelector('#f-type');if(t&&m[0])t.value=m[0];var h=f.querySelector('input[name="plan"]');if(h)h.value=m[1];
var ti=document.querySelector('[data-form-title]');if(ti)ti.textContent='Get a quote'+(k==='quote'?'':' for '+m[1]);
var btn=f.querySelector('button[type="submit"]');if(btn)btn.firstChild.textContent='Request my quote ';})();
