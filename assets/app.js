// medlgerr — enhanced interactions
// Small helpers and initialization (Chart.js required in HTML)
function onDOM(cb){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', cb); else cb(); }

onDOM(()=>{

  // mobile nav toggle
  const menu = document.getElementById('menuBtn');
  if(menu) menu.addEventListener('click', ()=>{ const l=document.querySelector('.nav-links'); if(!l) return; l.style.display = (l.style.display==='flex') ? 'none' : 'flex'; });

  // subtle title pulse
  setTimeout(()=>document.querySelectorAll('.h-title').forEach(h=>h.classList.add('animate')), 220);

  initCounters();
  initPageLinks();
  // init small visuals if present
  const visPairs = document.getElementById('vis-pairs');
  if(visPairs) renderPairs(visPairs);
  const visORB = document.getElementById('vis-orb');
  if(visORB) renderORB(visORB);
  // portfolio chart draw-in (if present)
  if(document.getElementById('eqChart')) initPortfolio();
});

// ========== COUNTERS ==========
function initCounters(){
  const counters = document.querySelectorAll('.counter');
  if(!counters.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, {threshold:0.5});
  counters.forEach(c=>obs.observe(c));
}
function animateCounter(el){
  const to = parseFloat(el.dataset.to || el.textContent.replace(/[^0-9.-]/g,'')) || 0;
  const dur = 900;
  let start = null;
  const from = 0;
  function step(ts){
    if(!start) start = ts;
    const progress = Math.min((ts-start)/dur, 1);
    const val = Math.round(from + (to-from)*easeOut(progress));
    el.textContent = val.toLocaleString();
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOut(t){ return 1 - Math.pow(1-t, 3); }

// ========== PAGE TRANSITION OVERLAY ==========
function initPageLinks(){
  document.querySelectorAll('a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href) return;
    // intercept only internal html links
    if(href.endsWith('.html') && !href.startsWith('http')){
      a.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const overlay = document.getElementById('pageOverlay');
        if(!overlay) { window.location = href; return; }
        overlay.classList.add('show');
        setTimeout(()=> window.location = href, 420);
      });
    }
  });
}

// ========== STRATEGY PANEL ==========
const STRATS = {
  'stat-arb': {
    title: 'Statistical Arbitrage',
    desc: 'Framework for capturing short-term mispricings across correlated instruments. Uses correlation/cointegration filters, spread z-scores, and execution priority to monetize mean reversion windows.',
    equity: [100,101,103,102,105,109,112,115,118,121,125]
  },
  'orb': {
    title: 'Opening Range Breakout',
    desc: 'Systematic detection of Early-session volatility bursts. Defines a time-bound opening range, applies liquidity/volume confirmation, and routes orders with DMA for slippage control.',
    equity: [100,99,104,108,115,120,118,124,129,138,145]
  }
};

function openPanel(key){
  const p = document.getElementById('panel');
  if(!p) return;
  const data = STRATS[key];
  p.querySelector('#pTitle').textContent = data.title;
  p.querySelector('#pDesc').textContent = data.desc;

  // small mini-candle animation
  const mini = document.getElementById('miniCandle');
  if(mini) drawMiniCandle(mini);

  // equity chart (animated draw)
  const chartCanvas = document.getElementById('pChart');
  if(window.pChart) try{ window.pChart.destroy(); }catch(e){}
  const ctx = chartCanvas.getContext('2d');
  window.pChart = new Chart(ctx, {
    type: 'line',
    data: { labels: data.equity.map((_,i)=>i+1), datasets: [{ data: data.equity, fill: true, borderWidth: 2, backgroundColor:'rgba(91,125,247,0.08)', borderColor:'rgba(91,125,247,0.95)', pointRadius:0 }] },
    options: { responsive:true, maintainAspectRatio:false, animation:{duration:900, easing:'easeOutQuart'}, plugins:{legend:{display:false}}, scales:{x:{display:false}} }
  });

  p.classList.add('open');
}
function closePanel(){
  const p = document.getElementById('panel');
  if(p) p.classList.remove('open');
}

// mini candlestick "header" visual
function drawMiniCandle(canvas){
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const n = 14, step = w/n;
  for(let i=0;i<n;i++){
    const x = i*step + step*0.5;
    const base = h*0.5;
    const o = base + Math.sin(i*0.6)*h*0.06;
    const c = o + (Math.random()-0.5)*h*0.12;
    const up = c > o;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(x,h*0.12); ctx.lineTo(x,h*0.88); ctx.stroke();
    ctx.fillStyle = up ? 'rgba(0,230,195,0.95)' : 'rgba(255,107,107,0.95)';
    ctx.fillRect(x-4, Math.min(o,c), 8, Math.max(4, Math.abs(c-o)));
  }
  // subtle sweep highlight while panel is open
  let t = 0;
  function sweep(){
    if(!document.getElementById('panel') || !document.getElementById('panel').classList.contains('open')) return;
    t += 0.02;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    const x = Math.abs(Math.sin(t)) * w * 0.4;
    ctx.fillRect(x, 0, w*0.18, h);
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(sweep);
  }
  sweep();
}

// ========== Portfolio chart init ==========
function initPortfolio(){
  const c = document.getElementById('eqChart'); if(!c) return;
  const ctx = c.getContext('2d');
  const equity = [10000,10400,10320,10980,12040,11800,12950,13330,14010,15100,16280,17000];
  new Chart(ctx, {
    type:'line',
    data:{ labels: equity.map((_,i)=>i+1), datasets:[{ data: equity, fill:true, borderWidth:2, pointRadius:0, backgroundColor:'rgba(91,125,247,0.08)', borderColor:'rgba(91,125,247,0.98)' }]},
    options:{ responsive:true, maintainAspectRatio:false, animation:{duration:1200, easing:'easeOutCubic'}, plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{grid:{color:'rgba(255,255,255,0.04)'}}} }
  });
}

// ========== small canvas visuals used on strategies page ==========
function renderPairs(canvas){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.lineWidth = 2.2;
  const baseY = h*0.5;
  ctx.strokeStyle = 'rgba(0,230,195,0.95)'; ctx.beginPath();
  for(let x=0;x<w;x++){ const y = baseY + Math.sin(x*0.02)*18 + Math.sin(x*0.12)*6; if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke();
  ctx.strokeStyle = 'rgba(91,125,247,0.95)'; ctx.beginPath();
  for(let x=0;x<w;x++){ const diverge = (x > w*0.45 && x < w*0.65) ? 14 : 0; const y = baseY + Math.sin(x*0.02+0.12)*18 + Math.sin(x*0.11+0.6)*6 + diverge; if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke();
}

function renderORB(canvas){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const boxTop = h*0.36, boxBottom = h*0.64;
  ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(0,boxTop,w*0.26,boxBottom-boxTop);
  const n=32, step=w/n;
  for(let i=0;i<n;i++){
    const x = i*step + step*0.5;
    const o = (Math.sin(i*0.3)+1)/2;
    const high = h*0.28 + o*36; const low = h*0.72 - o*36;
    const open = (high+low)/2 + (Math.random()-0.5)*8;
    const close = open + (Math.random()-0.5)*18 + (i>8?12:0);
    const up = close > open;
    ctx.strokeStyle='rgba(154,174,203,0.9)'; ctx.beginPath(); ctx.moveTo(x,high); ctx.lineTo(x,low); ctx.stroke();
    ctx.fillStyle = up ? 'rgba(0,230,195,0.95)' : 'rgba(255,107,107,0.95)';
    ctx.fillRect(x-4, Math.min(open,close), 8, Math.max(6, Math.abs(close-open)));
  }
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.setLineDash([6,6]); ctx.beginPath(); ctx.moveTo(w*0.26,boxTop); ctx.lineTo(w,boxTop); ctx.stroke(); ctx.setLineDash([]);
}

