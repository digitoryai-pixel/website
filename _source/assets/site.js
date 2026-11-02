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

(function(){var box=document.querySelector('[data-feed] .feed-list');if(!box)return;
var ICO={alert:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',box:'<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',rupee:'<path d="M6 4h12M6 9h12M6 4h3a5 5 0 010 10H6l8 6"/>',chef:'<path d="M6 14a4 4 0 01-1-7.9A5 5 0 0112 3a5 5 0 017 3.1A4 4 0 0118 14"/><path d="M6 14h12v6H6z"/>',fix:'<path d="M5 12l4 4 10-10"/>'};
var E=[['Shift watch','#FF7A3D','alert','7 voids worth ₹5,900 at Terminal 2. Bills sent to the manager.','ALERT'],
['Reorder','#22C55E','box','Tomorrow’s order drafted: 14 items, ₹38,450. Waiting for approval.','DRAFTED'],
['Booking agent','#2DD4BF','cal','Table for 4 at 8 PM confirmed on WhatsApp. Anniversary noted.','DONE'],
['Payout check','#60A5FA','rupee','Swiggy overcharged ₹9,800 in commission. Claim ready.','DRAFTED'],
['Kitchen pace','#FBBF24','chef','Tandoor at 16 min vs usual 9. Head chef alerted.','ALERT'],
['Win-back','#F472B6','users','312 regulars missing for 30 days. WhatsApp offer drafted.','DRAFTED'],
['Recipe cost drift','#22C55E','box','Paneer up 14%. 6 dishes lost margin; new prices suggested.','ALERT'],
['Support agent','#60A5FA','fix','KOT printer back online in 2 min 40 s.','FIXED']];
var k=0,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function svg(n){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO[n]+'</svg>';}
function push(){var e=E[k++%E.length],li=document.createElement('li');li.className='fi';li.style.setProperty('--c',e[1]);
li.innerHTML='<span class="fi-ic">'+svg(e[2])+'</span><div><div class="fi-t">'+e[0]+'<em>just now</em></div><p>'+e[3]+'</p><span class="tag">'+e[4]+'</span></div>';
box.insertBefore(li,box.firstChild);[].slice.call(box.children,1).forEach(function(n,i){var t=n.querySelector('em');if(t)t.textContent=(i+1)*2+' min ago';});while(box.children.length>4)box.removeChild(box.lastChild);}
push();push();push();if(!RM)setInterval(push,2800);})();
