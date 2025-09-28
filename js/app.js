// Everyone Happy — Balloon Sky (vanilla canvas)
(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d', { alpha: true });
  const tooltip = document.getElementById('tooltip');

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W=0, H=0, time=0, balloons=[];

  const random = (min,max)=>Math.random()*(max-min)+min;

  function resize(){
    const rect = canvas.getBoundingClientRect();
    W = Math.floor(rect.width * DPR);
    H = Math.floor(rect.height * DPR);
    canvas.width = W; canvas.height = H;
    canvas.style.width = rect.width+'px';
    canvas.style.height = rect.height+'px';
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // Stars
  const stars = Array.from({length: 250}, ()=> ({
    x: Math.random()*1,
    y: Math.random()*1,
    a: Math.random()*0.8+0.2,
    s: Math.random()*0.6+0.2
  }));

  function drawStars(){
    ctx.save();
    ctx.globalAlpha = 0.9;
    for(const st of stars){
      const x = st.x * W;
      const y = st.y * H;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.8*Math.abs(Math.sin(time*0.0007 + st.x*7))})`;
      ctx.fillRect(x, y, st.s*DPR, st.s*DPR);
    }
    ctx.restore();
  }

  // Balloons
  function makeBalloon(opts={}){
    const color = opts.color || '#ff6b6b';
    const message = (opts.message || '').slice(0,120);
    const fresh = Boolean(opts.fresh);
    const startOffset = fresh ? random(6, 24) : random(20, 180);
    const speedMin = fresh ? 48 : 12;
    const speedMax = fresh ? 68 : 22;
    return {
      x: (typeof opts.x === 'number' ? opts.x : random(0.1, 0.9) * W),
      y: (typeof opts.y === 'number' ? opts.y : H + startOffset * DPR),
      r: random(12, 20) * DPR,
      color,
      message,
      speed: (opts.speed || random(speedMin, speedMax)) * DPR, // px per second baseline
      swayAmp: random(8, 22) * DPR,
      swayFreq: random(0.5, 1.2),
      born: performance.now(),
      id: Math.random().toString(36).slice(2,9)
    };
  }

  function loadBalloons(){
    try{
      const raw = localStorage.getItem('everyone-happy.balloons');
      if(raw){
        const arr = JSON.parse(raw);
        balloons = arr.map(b => ({...makeBalloon(b), message:b.message, color:b.color}));
      } else {
        // seed with some demo balloons
        const seed = [
          {message:"Wishing you a day full of happiness!", color:"#ff6b6b"},
          {message:"May you feel loved and safe.", color:"#72efdd"},
          {message:"Joy catches on—pass it along.", color:"#ffd166"},
          {message:"A smile finds you today.", color:"#4dabf7"},
          {message:"May the sunset glow warm your heart.", color:"#ffa94d"},
          {message:"Sprinkling the sky with rosy cheer.", color:"#f06595"},
          {message:"Peaceful breaths, bright mornings.", color:"#38d9a9"},
          {message:"Fresh hope sprouts for you today.", color:"#94d82d"},
          {message:"Waves of calm drift your way.", color:"#5c7cfa"},
          {message:"Kindness sparkles wherever you are.", color:"#b197fc"},
        ];
        balloons = seed.map(s => makeBalloon(s));
      }
    }catch(e){
      balloons = [makeBalloon({message:"Welcome to the sky!"})];
    }
  }
  function saveBalloons(){
    const compact = balloons.slice(0,200).map(b => ({message:b.message, color:b.color}));
    localStorage.setItem('everyone-happy.balloons', JSON.stringify(compact));
  }

  loadBalloons();

  let last = performance.now();
  function tick(now){
    const dt = (now - last) / 1000; // seconds
    last = now;
    time = now;

    // Clear
    ctx.clearRect(0,0,W,H);

    // Glow background
    const grad = ctx.createRadialGradient(W*0.5,H*0.95, 10, W*0.5,H*0.95, Math.max(W,H)*0.7);
    grad.addColorStop(0, 'rgba(226,183,20,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    drawStars();

    // Update + draw balloons
    for(const b of balloons){
      const sway = Math.sin((now*0.001*b.swayFreq) + b.id.length)*b.swayAmp;
      b.y -= b.speed * dt * 0.25;
      b.x += sway * dt * 0.6;

      // Recycle if off screen
      if(b.y < -50 * DPR){
        b.y = H + random(20, 120)*DPR;
        b.x = random(0.1, 0.9) * W;
      }

      // String
      ctx.strokeStyle = `rgba(255,255,255,0.18)`;
      ctx.lineWidth = 1*DPR;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r*1.2);
      ctx.lineTo(b.x, b.y + b.r*2.2);
      ctx.stroke();

      // Balloon body
      const rad = b.r;
      const g = ctx.createRadialGradient(b.x - rad*0.4, b.y - rad*0.6, rad*0.2, b.x, b.y, rad*1.2);
      // highlight + body
      g.addColorStop(0, 'rgba(255,255,255,0.85)');
      g.addColorStop(0.15, 'rgba(255,255,255,0.65)');
      g.addColorStop(0.16, b.color);
      g.addColorStop(1, b.color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, rad*0.85, rad, 0, 0, Math.PI*2);
      ctx.fill();

      // knot
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.beginPath();
      ctx.moveTo(b.x-2*DPR, b.y+rad*1.05);
      ctx.lineTo(b.x+2*DPR, b.y+rad*1.05);
      ctx.lineTo(b.x, b.y+rad*1.2);
      ctx.closePath();
      ctx.fill();

      // message when focused (set via hover)
      if(b === hoverBalloon && b.message){
        const text = b.message;
        ctx.save();
        ctx.font = `${12*DPR}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
        const metrics = ctx.measureText(text);
        const pad = 8*DPR;
        const tw = metrics.width + pad*2;
        const th = 28*DPR;
        const bx = Math.min(Math.max(8*DPR, b.x - tw/2), W - tw - 8*DPR);
        const by = Math.max(8*DPR, b.y - rad*1.8 - th);
        ctx.fillStyle = 'rgba(12,19,34,.92)';
        ctx.strokeStyle = 'rgba(255,255,255,.08)';
        ctx.lineWidth = 1*DPR;
        roundRect(ctx, bx, by, tw, th, 10*DPR);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#e8eefc';
        ctx.fillText(text, bx+pad, by+th/2+4*DPR);
        ctx.restore();
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  // Hover detection
  let hoverBalloon = null;
  canvas.addEventListener('mousemove', (e)=>{
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * DPR;
    const my = (e.clientY - rect.top) * DPR;
    hoverBalloon = null;
    for (let i=balloons.length-1; i>=0; i--) {
      const b = balloons[i];
      const dx = mx - b.x;
      const dy = my - b.y;
      if (dx*dx + dy*dy <= (b.r*1.05)*(b.r*1.05)) {
        hoverBalloon = b;
        break;
      }
    }
    if(hoverBalloon){
      tooltip.hidden = false;
      tooltip.innerHTML = `<p>${escapeHtml(hoverBalloon.message || '')}</p><div class="meta">🎈 Tap to pin</div>`;
      const tx = (hoverBalloon.x / DPR) - tooltip.offsetWidth/2;
      const ty = (hoverBalloon.y / DPR) - 48;
      tooltip.style.transform = `translate(${Math.max(8, Math.min(tx, canvas.clientWidth - tooltip.offsetWidth - 8))}px, ${Math.max(8, ty)}px)`;
    } else {
      tooltip.hidden = true;
    }
  });
  canvas.addEventListener('mouseleave', ()=>{ tooltip.hidden = true; hoverBalloon = null; });

  // Composer modal
  const composer = document.getElementById('composer');
  const releaseBtn = document.getElementById('releaseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const form = document.getElementById('composerForm');
  const messageEl = document.getElementById('message');
  const countEl = document.getElementById('count');
  const colorInput = document.getElementById('colorInput');
  const colorsEl = document.getElementById('colors');

  releaseBtn.addEventListener('click', ()=>{
    messageEl.value = '';
    countEl.textContent = '0';
    colorInput.value = '#ff6b6b';
    selectColor('#ff6b6b');
    composer.showModal();
    messageEl.focus();
  });

  messageEl.addEventListener('input', ()=>{
    countEl.textContent = String(messageEl.value.length);
  });

  colorsEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-color]');
    if(!btn) return;
    const c = btn.getAttribute('data-color');
    colorInput.value = c;
    selectColor(c);
  });

  function selectColor(c){
    [...colorsEl.querySelectorAll('button[data-color]')].forEach(b=>{
      b.classList.toggle('selected', b.getAttribute('data-color') === c);
    });
  }

  form.addEventListener('close', (e)=>{
    // noop
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!composer.open) return;
    composer.close('send');
  });

  composer.addEventListener('close', ()=>{
    if(composer.returnValue === 'send'){
      const msg = messageEl.value.trim();
      const col = colorInput.value || '#ff6b6b';
      const rect = canvas.getBoundingClientRect();
      const spawnBandStart = 0.4;
      const spawnBandWidth = 0.2;
      const spawnRatio = spawnBandStart + Math.random() * spawnBandWidth;
      const spawnX = rect.width ? rect.width * spawnRatio * DPR : W * spawnRatio;
      const b = makeBalloon({
        message: msg || '💛',
        color: col,
        fresh: true,
        x: spawnX
      });
      balloons.push(b);
      saveBalloons();
    }
  });

  clearBtn.addEventListener('click', ()=>{
    if(confirm('Clear balloons you\'ve saved on this device?')){
      localStorage.removeItem('everyone-happy.balloons');
      loadBalloons();
    }
  });

  // Helper
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }
})();
