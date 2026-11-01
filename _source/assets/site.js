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
