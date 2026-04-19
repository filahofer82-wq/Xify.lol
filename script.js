// ═══ INTRO HERO (big Xify → flies to header) ═══
(() => {
  const body    = document.body;
  const hero    = document.querySelector('.intro-hero');
  const heroSvg = document.querySelector('.intro-hero-svg');
  const realSvg = document.querySelector('.username-svg');
  if (!hero || !heroSvg || !realSvg) {
    body.classList.remove('is-intro');
    body.classList.add('intro-done');
    return;
  }

  const HOLD_AFTER_WRITE = 400;
  // 0.55s initial delay + (3 letters * 0.18s stagger) + 0.6s pop ≈ 1700ms
  const WRITE_TIME       = 1700;
  const FLY_DURATION     = 950;

  // Store the centering offset so flyToHeader can build on top of it.
  let centerDx = 0, centerDy = 0;

  // After fonts load, centre the hero so the TEXT is visually centred —
  // not just the SVG element box (which has empty space on the right because
  // the text starts at x="3" and doesn't fill the full viewBox width).
  // getComputedTextLength() works on SVG <text> regardless of clip-path state.
  function centerHero() {
    const r = heroSvg.getBoundingClientRect();
    if (!r.width) return;

    const textEl = heroSvg.querySelector('text');
    let textOffsetX = 0;
    if (textEl && textEl.getComputedTextLength) {
      const scaleX      = r.width / 170;            // SVG user-unit → px
      const textLen     = textEl.getComputedTextLength(); // user units
      const textCenterX = r.left + (3 + textLen / 2) * scaleX;
      textOffsetX = textCenterX - (r.left + r.width / 2); // text vs box centre
    }

    centerDx = window.innerWidth  / 2 - (r.left + r.width  / 2) - textOffsetX;
    centerDy = window.innerHeight / 2 - (r.top  + r.height / 2);
    hero.style.transform =
      `translate(calc(-50% + ${centerDx}px), calc(-50% + ${centerDy}px))`;
  }

  function flyToHeader() {
    // Both SVGs share the same viewBox (0 0 170 70) and x="3" text, so
    // aligning their element centers aligns the text centres too.
    const sr = heroSvg.getBoundingClientRect();
    const dr = realSvg.getBoundingClientRect();
    if (!sr.width || !dr.width) { finish(); return; }

    const dx    = (dr.left + dr.width  / 2) - (sr.left + sr.width  / 2);
    const dy    = (dr.top  + dr.height / 2) - (sr.top  + sr.height / 2);
    const scale = dr.height / sr.height;

    hero.classList.add('intro-hero--flying');
    requestAnimationFrame(() => {
      hero.style.transform =
        `translate(calc(-50% + ${centerDx + dx}px), calc(-50% + ${centerDy + dy}px)) scale(${scale})`;
    });

    // Trigger staggered reveal exactly when the hero lands.
    // Hero stays in place permanently — no fade-out, no swap.
    setTimeout(() => {
      body.classList.remove('is-intro');
      body.classList.add('intro-done');
    }, FLY_DURATION);
  }

  function finish() {
    hero.remove();
    body.classList.remove('is-intro');
    body.classList.add('intro-done');
  }

  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  fontsReady.then(() => {
    centerHero();
    setTimeout(flyToHeader, WRITE_TIME + HOLD_AFTER_WRITE);
  });
})();

// ═══ ANIMATED TAB TITLE ═══
(() => {
  const text = "Xify";
  let index = 0;
  let forward = true;
  let isActive = true;

  function animateTitle() {
    if (!isActive) return;
    if (forward) {
      index++;
      if (index === text.length) forward = false;
    } else {
      index--;
      if (index === 1) forward = true;
    }
    document.title = text.slice(0, index);
  }

  setInterval(animateTitle, 300);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isActive = false;
      document.title = "nigga come back";
    } else {
      isActive = true;
    }
  });
})();

// ═══ NAME PARTICLES ═══
(() => {
  const canvas = document.querySelector('.name-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width = r.width + 32;
    canvas.height = r.height + 24;
  }

  const dots = [];
  const COUNT = 18;

  function init() {
    resize();
    for (let i = 0; i < COUNT; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  let t = 0;
  function draw() {
    t += 0.02;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of dots) {
      d.x += d.dx;
      d.y += d.dy;
      if (d.x < -4) d.x = canvas.width + 4;
      if (d.x > canvas.width + 4) d.x = -4;
      if (d.y < -4) d.y = canvas.height + 4;
      if (d.y > canvas.height + 4) d.y = -4;

      const flicker = 0.6 + 0.4 * Math.sin(t * 1.5 + d.phase);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 215, 230, ${d.o * flicker})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', resize);
})();

// ═══ FLOATING PARTICLES ═══
(() => {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const dots = [];
  const COUNT = 45;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    for (let i = 0; i < COUNT; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2 - 0.1,
        o: Math.random() * 0.25 + 0.04,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.dx;
      d.y += d.dy;
      if (d.x < -10) d.x = w + 10;
      if (d.x > w + 10) d.x = -10;
      if (d.y < -10) d.y = h + 10;
      if (d.y > h + 10) d.y = -10;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 225, 235, ${d.o})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', resize);
})();

// ═══ GLASS CARD TILT ═══
(() => {
  const cards = document.querySelectorAll('.card-tilt');

  cards.forEach(card => {
    const MAX = 6;
    const EASE = 0.12;
    let target = { rx: 0, ry: 0 };
    let cur = { rx: 0, ry: 0 };
    let running = false;
    let bounds;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function loop() {
      cur.rx = lerp(cur.rx, target.rx, EASE);
      cur.ry = lerp(cur.ry, target.ry, EASE);
      card.style.transform =
        `perspective(600px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      if (Math.abs(cur.rx - target.rx) > 0.01 || Math.abs(cur.ry - target.ry) > 0.01) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) { running = true; requestAnimationFrame(loop); }
    }

    card.addEventListener('mouseenter', () => { bounds = card.getBoundingClientRect(); });
    card.addEventListener('mousemove', e => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const px = (e.clientX - bounds.left) / bounds.width;
      const py = (e.clientY - bounds.top) / bounds.height;
      target.ry = (px - 0.5) * MAX * 2;
      target.rx = (0.5 - py) * MAX * 2;
      start();
    });
    card.addEventListener('mouseleave', () => {
      target.rx = 0; target.ry = 0; bounds = null; start();
    });
  });
})();

// ═══ CONTAINER TILT ═══
(() => {
  const el = document.querySelector('.container');
  if (!el) return;

  const MAX = 4;
  const EASE = 0.06;
  let target = { rx: 0, ry: 0, s: 1 };
  let cur = { rx: 0, ry: 0, s: 1 };
  let running = false;
  let bounds;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    cur.rx = lerp(cur.rx, target.rx, EASE);
    cur.ry = lerp(cur.ry, target.ry, EASE);
    cur.s  = lerp(cur.s,  target.s,  EASE);
    el.style.transform =
      `perspective(1000px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg) scale(${cur.s})`;
    if (Math.abs(cur.rx - target.rx) > 0.005 ||
        Math.abs(cur.ry - target.ry) > 0.005 ||
        Math.abs(cur.s  - target.s)  > 0.0002) {
      requestAnimationFrame(loop);
    } else { running = false; }
  }

  function start() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  el.addEventListener('mouseenter', () => {
    bounds = el.getBoundingClientRect();
    target.s = 1.01;
    start();
  });

  el.addEventListener('mousemove', e => {
    if (!bounds) bounds = el.getBoundingClientRect();
    const px = (e.clientX - bounds.left) / bounds.width;
    const py = (e.clientY - bounds.top) / bounds.height;
    target.ry = (px - 0.5) * MAX * 2;
    target.rx = (0.5 - py) * MAX * 2;
    start();
  });

  el.addEventListener('mouseleave', () => {
    target.rx = 0; target.ry = 0; target.s = 1;
    bounds = null;
    start();
  });

  window.addEventListener('resize', () => { bounds = null; });
})();

// ═══ DISCORD PRESENCE (Lanyard) ═══
// To enable: join discord.gg/lanyard then paste your Discord user ID below.
(() => {
  const DISCORD_USER_ID = '295478094263877644';
  const dot = document.querySelector('.status-dot');
  if (!dot || DISCORD_USER_ID === '295478094263877644') return;

  async function fetchPresence() {
    try {
      const res  = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
      const data = await res.json();
      if (data.success) {
        const online = data.data.discord_status !== 'offline';
        dot.classList.toggle('status-dot--online', online);
      }
    } catch {}
  }

  fetchPresence();
  setInterval(fetchPresence, 30000);
})();

// ═══ DISCORD CLICK-TO-COPY ═══
(() => {
  const discord = document.querySelector('.social-icon[aria-label="Discord"]');
  if (!discord) return;

  const tooltip = discord.querySelector('.tooltip');
  if (!tooltip) return;

  const tag = tooltip.textContent.trim();
  let resetId = null;

  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; }
      catch {}
    }
    // Fallback for non-secure contexts (file://, etc.)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  }

  discord.addEventListener('click', async e => {
    e.preventDefault();

    const ok = await copy(tag);

    // Spawn ripple
    const ripple = document.createElement('span');
    ripple.className = 'copy-ripple';
    discord.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    tooltip.textContent = ok ? 'copied!' : 'press ctrl+c';
    tooltip.classList.add('tooltip--copied');
    discord.classList.add('social-icon--flash');

    clearTimeout(resetId);
    resetId = setTimeout(() => {
      tooltip.textContent = tag;
      tooltip.classList.remove('tooltip--copied');
      discord.classList.remove('social-icon--flash');
    }, 1500);
  });
})();

// ═══ TERMINAL ═══
(() => {
  const toggleBtn = document.getElementById('term-toggle');
  const win       = document.getElementById('term-window');
  const body_     = document.getElementById('term-body');
  const output    = document.getElementById('term-output');
  const input     = document.getElementById('term-input');
  const closeBtn  = document.getElementById('term-close');
  if (!toggleBtn || !win) return;

  let isOpen  = false;
  let history = [];
  let histIdx = -1;
  let booted  = false;

  /* ── helpers ── */
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function addLine(html, cls) {
    const el = document.createElement('div');
    el.className = 'term-line' + (cls ? ' ' + cls : '');
    el.innerHTML = html;
    output.appendChild(el);
  }

  function gap() {
    const el = document.createElement('div');
    el.className = 'term-line--gap';
    output.appendChild(el);
  }

  function scrollBottom() {
    body_.scrollTop = body_.scrollHeight;
  }

  /* ── boot message ── */
  function boot() {
    addLine('<span class="t-hi">Xify</span> <span class="t-dim">terminal v1.0.0</span>');
    addLine('<span class="t-dim">type <span class="t-cmd">help</span> for available commands.</span>');
    gap();
    booted = true;
    scrollBottom();
  }

  /* ── commands ── */
  const COMMANDS = {
    help() {
      addLine('<span class="t-dim">commands:</span>');
      addLine('  <span class="t-cmd">steam</span>    <span class="t-dim">—</span> open steam profile');
      addLine('  <span class="t-cmd">discord</span>  <span class="t-dim">—</span> copy discord username');
      addLine('  <span class="t-cmd">clear</span>    <span class="t-dim">—</span> clear terminal');
      addLine('  <span class="t-cmd">help</span>     <span class="t-dim">—</span> show this message');
    },
    steam() {
      window.open('https://steamcommunity.com/id/bot7k/', '_blank', 'noopener,noreferrer');
      addLine('<span class="t-ok">↗</span> opening steam profile…');
    },
    discord() {
      navigator.clipboard?.writeText('dejmilion').catch(() => {});
      addLine('<span class="t-dim">username:</span> <span class="t-hi">dejmilion</span>');
      addLine('<span class="t-ok">✓</span> <span class="t-dim">copied to clipboard</span>');
    },
    clear() {
      output.innerHTML = '';
    },
  };

  function runCmd(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    history.unshift(cmd);
    histIdx = -1;

    /* echo the typed command */
    addLine('<span class="t-prompt">~/xify $</span>&nbsp;' + esc(cmd), 'term-line--echo');

    if (COMMANDS[cmd]) {
      COMMANDS[cmd]();
    } else {
      addLine('<span class="t-err">command not found:</span> ' + esc(cmd));
      addLine('<span class="t-dim">try <span class="t-cmd">help</span></span>');
    }
    gap();
    scrollBottom();
  }

  /* ── open / close ── */
  function openTerm() {
    isOpen = true;
    win.classList.add('term-window--open');
    toggleBtn.classList.add('term-toggle--active');
    win.setAttribute('aria-hidden', 'false');
    if (!booted) boot();
    setTimeout(() => input.focus(), 40);
  }

  function closeTerm() {
    isOpen = false;
    win.classList.remove('term-window--open');
    toggleBtn.classList.remove('term-toggle--active');
    win.setAttribute('aria-hidden', 'true');
  }

  toggleBtn.addEventListener('click', () => isOpen ? closeTerm() : openTerm());
  closeBtn.addEventListener('click', closeTerm);

  /* ── drag ── */
  const header = win.querySelector('.term-header');
  let dragging = false, dragOffX = 0, dragOffY = 0;

  header.addEventListener('mousedown', e => {
    if (e.target === closeBtn || e.target.closest('.term-dots')) return;
    dragging = true;
    const r = win.getBoundingClientRect();
    dragOffX = e.clientX - r.left;
    dragOffY = e.clientY - r.top;
    win.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    let x = e.clientX - dragOffX;
    let y = e.clientY - dragOffY;
    const r = win.getBoundingClientRect();
    x = Math.max(0, Math.min(x, window.innerWidth  - r.width));
    y = Math.max(0, Math.min(y, window.innerHeight - r.height));
    win.style.left   = x + 'px';
    win.style.top    = y + 'px';
    win.style.right  = 'auto';
    win.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  /* ── resize ── */
  let resizing = false, resizeDir = '', resizeStart = {};

  win.querySelectorAll('.term-resize').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      e.stopPropagation();
      resizing = true;
      resizeDir = handle.dataset.dir;
      const r = win.getBoundingClientRect();
      resizeStart = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, width: r.width, height: r.height };
      win.style.transition = 'none';
      e.preventDefault();
    });
  });

  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;
    const MIN_W = 260, MIN_H = 160;
    let { left, top, width, height } = resizeStart;

    if (resizeDir.includes('e'))  width  = Math.max(MIN_W, width + dx);
    if (resizeDir.includes('s'))  height = Math.max(MIN_H, height + dy);
    if (resizeDir.includes('w')) { width  = Math.max(MIN_W, width - dx); if (width > MIN_W) left += dx; }
    if (resizeDir.includes('n')) { height = Math.max(MIN_H, height - dy); if (height > MIN_H) top += dy; }

    win.style.width  = width  + 'px';
    win.style.height = height + 'px';
    win.style.left   = left   + 'px';
    win.style.top    = top    + 'px';
    win.style.right  = 'auto';
    win.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => { resizing = false; });

  /* Click anywhere in the terminal body to refocus input */
  body_.addEventListener('click', () => input.focus());

  /* ── keyboard ── */
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCmd(val);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      else             { histIdx = -1; input.value = ''; }
    }
  });
})();
