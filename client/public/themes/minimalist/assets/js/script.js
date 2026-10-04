var au=document.getElementById('bgm'),vn=document.querySelector('.vinyl');
function bgm(on){if(!au||!au.getAttribute('src'))return;try{if(on===true||au.paused){au.play().then(function(){vn.classList.add('spin')}).catch(function(){})}else{au.pause();vn.classList.remove('spin')}}catch(e){}}

/* buka undangan: cover memudar, isi undangan muncul */
function openInv(){
  var c=document.getElementById('cover');
  c.classList.add('leaving');
  bgm(true);
  setTimeout(function(){
    c.style.display='none';
    document.getElementById('invite').style.display='block';
    document.body.classList.add('open');
    scrollTo(0,0);
  },750);
}

/* animasi muncul saat scroll */
document.documentElement.classList.add('js');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('#invite section').forEach(function(sec){
  var rows=0;
  [].slice.call(sec.children).forEach(function(k,i){
    if(k.classList.contains('tag'))return;
    k.classList.add('rv');
    k.style.transitionDelay=Math.min(i*0.06,0.24)+'s';
    if(k.matches('img.frame,img.ii,.gframe,.qc'))k.classList.add('z');
    else if(k.classList.contains('row'))k.classList.add(rows++%2?'r':'l');
    else if(k.matches('h2'))k.classList.add('sp');
    io.observe(k);
  });
});
document.querySelectorAll('#invite .slot').forEach(function(el){el.classList.add('rv');io.observe(el)});

/* salin nomor rekening */
function cp(b){var t=b.parentNode.querySelector('span').textContent;try{navigator.clipboard.writeText(t)}catch(e){}b.textContent='Tersalin';setTimeout(function(){b.textContent='Salin'},1500)}
