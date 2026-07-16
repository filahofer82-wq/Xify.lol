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

    // <tspan> elements don't support CSS transforms, so replace them with
    // individual <text> elements measured at their original positions.
    const origText = heroSvg.querySelector('text');
    if (origText) {
      const tspans = Array.from(origText.querySelectorAll('.intro-hero-letter'));
      const extents = tspans.map((_, i) => {
        try { return origText.getExtentOfChar(i); } catch(e) { return null; }
      });
      origText.remove();
      tspans.forEach((tspan, i) => {
        const ext = extents[i];
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', ext ? ext.x : String(3 + i * 30));
        t.setAttribute('y', '55');
        t.classList.add('intro-hero-text', 'intro-hero-letter');
        t.style.setProperty('--i', tspan.style.getPropertyValue('--i') || String(i));
        t.textContent = tspan.textContent;
        heroSvg.appendChild(t);
      });
    }

    // Wait for the visitor to click "enter" before playing the intro,
    // so the writing animation starts fresh when they arrive.
    const begin = () => setTimeout(flyToHeader, WRITE_TIME + HOLD_AFTER_WRITE);
    if (body.classList.contains('pre-enter')) {
      document.addEventListener('xify:enter', begin, { once: true });
    } else {
      begin();
    }
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

// ═══ YOUTUBE CARD SWAP ═══
// Hovering the YouTube icon swaps the Spotify card for an embedded video;
// leaving it brings the Spotify card back. The card itself also keeps the
// video open (with a small delay) so you can move into it and interact.
(() => {
  const link      = document.getElementById('yt-social');
  const container = document.querySelector('.container');
  const cards     = document.querySelector('.cards');
  const spotify   = document.querySelector('.spotify-card');
  const card      = document.getElementById('yt-card');
  const frame     = document.getElementById('yt-frame');
  if (!link || !container || !cards || !spotify || !card || !frame) return;

  const SRC = frame.dataset.src;
  let hideTimer = null;

  // Measure the real heights of both cards so the swap never overlaps
  // the icons or clips the video, whatever their content.
  function measure() {
    const spH = spotify.offsetHeight;
    const ytH = card.offsetHeight;
    if (spH) container.style.setProperty('--sp-h', spH + 'px');
    if (ytH) container.style.setProperty('--yt-h', ytH + 'px');
  }

  measure();
  (document.fonts?.ready ?? Promise.resolve()).then(() =>
    requestAnimationFrame(measure)
  );
  window.addEventListener('load', () => requestAnimationFrame(measure));
  window.addEventListener('resize', measure);

  function show() {
    clearTimeout(hideTimer);
    if (frame.getAttribute('src') !== SRC) frame.setAttribute('src', SRC);
    container.classList.add('show-yt');
    // Pause background music so the two don't play over each other.
    document.getElementById('bg-music')?.pause();
  }

  function hide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      container.classList.remove('show-yt');
      frame.setAttribute('src', '');   // stop playback when hidden
      // Resume background music if it had been started and the visitor
      // didn't manually pause it.
      const music = document.getElementById('bg-music');
      if (music && music.dataset.enabled === 'true' && music.dataset.userPaused !== 'true') {
        music.play().catch(() => {});
      }
    }, 300);
  }

  link.addEventListener('mouseenter', show);
  link.addEventListener('mouseleave', hide);
  card.addEventListener('mouseenter', show);
  card.addEventListener('mouseleave', hide);
})();

// ═══ CLICK-TO-ENTER ═══
// The visitor's click is a real user gesture, so the browser lets the
// music start with sound. It also reveals the page and fires the intro.
(() => {
  const screen = document.getElementById('enter-screen');
  const body   = document.body;
  if (!screen) return;

  // Hold `from` volume for holdMs, then fade to `to` over fadeMs.
  function rampVolume(audio, from, to, holdMs, fadeMs) {
    audio.volume = from;
    const startFade = performance.now() + holdMs;
    function step(now) {
      if (now < startFade) { requestAnimationFrame(step); return; }
      const t = Math.min(1, (now - startFade) / fadeMs);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;

    // Start background music with sound: play at 0.15 for ~4s, then
    // fade down to a quiet 0.07.
    const music = document.getElementById('bg-music');
    if (music) {
      music.volume = 0.5;
      music.play().then(() => {
        music.dataset.enabled = 'true';
        rampVolume(music, 0.5, 0.05, 1500, 1000);
      }).catch(() => {});
    }

    // Reveal the page and trigger the Xify intro animation after a
    // short 0.5s pause following the click.
    setTimeout(() => {
      body.classList.remove('pre-enter');
      document.dispatchEvent(new Event('xify:enter'));
    }, 500);
  }

  // Clicking anywhere on the overlay (including the button) enters.
  screen.addEventListener('click', enter);
})();

// ═══ SPOTIFY CARD PLAY / PAUSE (controls the background song) ═══
(() => {
  const btn   = document.getElementById('sp-toggle');
  const music = document.getElementById('bg-music');
  if (!btn || !music) return;

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  function render() {
    const playing = !music.paused;
    btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  btn.addEventListener('click', () => {
    if (music.paused) {
      music.dataset.userPaused = '';
      music.play().catch(() => {});
    } else {
      music.dataset.userPaused = 'true';
      music.pause();
    }
    render();
  });

  // Keep the icon in sync if the song is paused/resumed elsewhere.
  music.addEventListener('play',  render);
  music.addEventListener('pause', render);
  render();
})();
