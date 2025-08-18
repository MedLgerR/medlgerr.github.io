
// ---------- Mobile nav toggle ----------
const toggle = () => {
  const links = document.querySelector('.nav-links');
  if(!links) return;
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
};
window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.querySelector('#menuBtn');
  if(btn) btn.addEventListener('click', toggle);
});

// ---------- Floating particles background (hero) ----------
(function(){
  const c = document.getElementById('fx-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let w= c.width = window.innerWidth, h = c.height = window.innerHeight;
  const N = 80;
  const pts = Array.from({length:N}, ()=>({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4}));
  function draw(){
    ctx.clearRect(0,0,w,h);
    // glow background grid
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
    }
    // lines
    for(let i=0;i<N;i++){
      for(let j=i+1;j<N;j++){
        const a=pts[i], b=pts[j];
        const dx=a.x-b.x, dy=a.y-b.y; const d=Math.hypot(dx,dy);
        if(d<140){
          const alpha = (140-d)/140 * 0.18;
          ctx.strokeStyle = `rgba(0,230,195,${alpha})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    // points
    for(const p of pts){
      ctx.fillStyle='rgba(91,125,247,0.7)';
      ctx.beginPath(); ctx.arc(p.x,p.y,1.4,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{w=c.width=window.innerWidth;h=c.height=window.innerHeight;});
  draw();
})();

// ---------- Strategy visuals (pairs divergence & ORB) ----------
function renderPairs(canvas){
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.lineWidth = 2;
  const baseY = h*0.5;
  // Pair A
  ctx.strokeStyle = 'rgba(0,230,195,0.9)';
  ctx.beginPath();
  for(let x=0;x<w;x++){
    const y = baseY + Math.sin(x*0.02)*18 + Math.sin(x*0.11)*6;
    if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  // Pair B (slight divergence window)
  ctx.strokeStyle = 'rgba(91,125,247,0.9)';
  ctx.beginPath();
  for(let x=0;x<w;x++){
    const diverge = (x> w*0.45 && x< w*0.65) ? 16 : 0;
    const y = baseY + Math.sin(x*0.02+0.12)*18 + Math.sin(x*0.11+0.6)*6 + diverge;
    if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  // highlight window
  ctx.fillStyle='rgba(255,255,255,0.05)';
  ctx.fillRect(w*0.45, 0, w*0.20, h);
}

function renderORB(canvas){
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  // Opening range box
  const boxTop = h*0.35, boxBottom = h*0.65;
  ctx.fillStyle='rgba(255,255,255,0.06)';
  ctx.fillRect(0, boxTop, w*0.25, boxBottom-boxTop);

  // Candles
  const n=32, step = w/n;
  for(let i=0;i<n;i++){
    const x=i*step + step*0.5;
    const o = (Math.sin(i*0.3)+1)/2;
    const high = h*0.28 + o*40;
    const low  = h*0.72 - o*40;
    const open = (high+low)/2 + (Math.random()-0.5)*10;
    const close= open + (Math.random()-0.5)*18 + (i>8?12:0); // breakout after 8
    const up = close>open;
    ctx.strokeStyle='rgba(154,174,203,0.9)';
    ctx.beginPath(); ctx.moveTo(x,high); ctx.lineTo(x,low); ctx.stroke();
    ctx.fillStyle= up ? 'rgba(0,230,195,0.9)' : 'rgba(255,107,107,0.9)';
    const top = Math.min(open,close), bottom = Math.max(open,close);
    ctx.fillRect(x-4, top, 8, Math.max(6, bottom-top));
  }

  // Breakout line
  ctx.strokeStyle='rgba(255,255,255,0.25)';
  ctx.setLineDash([6,6]); ctx.beginPath(); ctx.moveTo(w*0.25, boxTop); ctx.lineTo(w, boxTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.25, boxBottom); ctx.lineTo(w, boxBottom); ctx.stroke();
  ctx.setLineDash([]);
}

// ---------- Slide-in panel content ----------
const STRATS = {
  'stat-arb': {
    title: 'Statistical Arbitrage',
    desc: 'Framework for capturing short-term mispricings across correlated instruments. Uses correlation/cointegration filters, spread z-scores, and execution priority to monetize mean reversion windows.',
    equity: [100,101,103,102,105,109,112,115,118,121,125]
  },
  'orb': {
    title: 'Opening Range Breakout',
    desc: 'Systematic detection of early-session volatility bursts. Defines a time-bound opening range, applies liquidity/volume confirmation, and routes orders with DMA for slippage control.',
    equity: [100,99,104,108,115,120,118,124,129,138,145]
  }
};

function openPanel(key){
  const p = document.getElementById('panel');
  if(!p) return;
  const data = STRATS[key];
  p.querySelector('#pTitle').textContent = data.title;
  p.querySelector('#pDesc').textContent = data.desc;
  // chart
  const el = p.querySelector('#pChart');
  if(window.pChart) window.pChart.destroy();
  const ctx = el.getContext('2d');
  window.pChart = new Chart(ctx, {
    type:'line',
    data:{labels:data.equity.map((_,i)=>i+1),
          datasets:[{data:data.equity, fill:true, borderWidth:2,
                     backgroundColor:'rgba(0,230,195,0.12)', borderColor:'rgba(0,230,195,0.9)', pointRadius:0}]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
  p.classList.add('open');
}
function closePanel(){ const p = document.getElementById('panel'); if(p) p.classList.remove('open'); }
window.openPanel = openPanel; window.closePanel = closePanel;

// ---------- Portfolio Chart ----------
function initPortfolio(){
  const c = document.getElementById('eqChart'); if(!c) return;
  const ctx = c.getContext('2d');
  const equity = [10000,10400,10320,10980,12040,11800,12950,13330,14010,15100,16280,17000];
  new Chart(ctx, {
    type:'line',
    data:{labels:equity.map((_,i)=>i+1),
          datasets:[{data:equity, fill:true, borderWidth:2,
                     backgroundColor:'rgba(91,125,247,0.12)', borderColor:'rgba(91,125,247,0.95)', pointRadius:0}]},
    options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
}

// ---------- Simple reveal on scroll ----------
(function(){
  const obs = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.style.transform='translateY(0)'; e.target.style.opacity='1'; obs.unobserve(e.target); }
    }
  }, {threshold:0.2});
  window.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.reveal').forEach(el=>{
      el.style.opacity='0'; el.style.transform='translateY(12px)'; el.style.transition='all .5s ease-out';
      obs.observe(el);
    });
  });
})();
