(function() {
  const graph = document.getElementById('gh-graph');
  const totalEl = document.getElementById('gh-total');
  const monthLabelsEl = document.getElementById('gh-month-labels');
  const USERNAME = 'NguyenThomas986';

  function level(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 6) return 2;
    if (count <= 12) return 3;
    return 4;
  }

  function buildGraph(days) {
    // days: array of { date: Date, count: number }
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const CELL_W = 14;

    const total = days.reduce((s, d) => s + d.count, 0);
    totalEl.textContent = total.toLocaleString();

    // Pad to Sunday
    const firstDay = days[0].date.getDay();
    const paddedDays = Array(firstDay).fill(null).concat(days);
    const weeks = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    // Month labels
    monthLabelsEl.innerHTML = '';
    let lastMonth = -1;
    weeks.forEach(week => {
      const realDays = week.filter(Boolean);
      const m = realDays.length ? realDays[0].date.getMonth() : lastMonth;
      const lbl = document.createElement('span');
      lbl.className = 'gh-month-label';
      lbl.style.width = CELL_W + 'px';
      if (m !== lastMonth && realDays.length) {
        lbl.textContent = MONTHS[m];
        lastMonth = m;
      }
      monthLabelsEl.appendChild(lbl);
    });

    // Grid
    graph.innerHTML = '';
    weeks.forEach(week => {
      const col = document.createElement('div');
      col.className = 'gh-week';
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'gh-cell';
        if (day) {
          cell.setAttribute('data-level', level(day.count));
          const dateStr = day.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
          cell.title = day.count === 0
            ? `No contributions on ${dateStr}`
            : `${day.count} contribution${day.count > 1 ? 's' : ''} on ${dateStr}`;
        } else {
          cell.style.visibility = 'hidden';
        }
        col.appendChild(cell);
      });
      graph.appendChild(col);
    });
  }

  // Try to fetch real data from GitHub contributions API proxy
  async function fetchReal() {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=2026`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      // jogruber API returns { contributions: [ { date: "YYYY-MM-DD", count: N, level: 0-4 }, ... ] }
      const days = json.contributions.map(c => ({
        date: new Date(c.date + 'T12:00:00'),
        count: c.count
      }));
      buildGraph(days);
    } catch(e) {
      // Fallback: generate placeholder data
      fallback();
    }
  }

  function fallback() {
    function pseudoRand(seed) {
      let s = seed;
      return function() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    }
    const rand = pseudoRand(986);
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isWeekday = d.getDay() >= 1 && d.getDay() <= 5;
      const r = rand();
      let count = 0;
      if (r < (isWeekday ? 0.55 : 0.25)) {
        const intensity = rand();
        if (intensity < 0.5) count = 1 + Math.floor(rand() * 3);
        else if (intensity < 0.8) count = 4 + Math.floor(rand() * 4);
        else count = 8 + Math.floor(rand() * 6);
      }
      days.push({ date: d, count });
    }
    buildGraph(days);
  }

  fetchReal();
})();





/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-btn');
  const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function setIcon(theme) { if (btn) btn.innerHTML = theme === 'dark' ? sunIcon : moonIcon; }
  setIcon(root.getAttribute('data-theme') || 'dark');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setIcon(next);
    });
  }
})();


/* ============================================================
   CUSTOM CURSOR  (dot + trailing ring, expands over links)
   ============================================================ */
(function() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('has-custom-cursor');
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    if (reduce) { ring.style.left = mx + 'px'; ring.style.top = my + 'px'; }
  });

  if (!reduce) {
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
  }

  const interactive = 'a, button, input, .dock-item, .search-result, .tag, .contact-row, .project-link';
  addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) { ring.classList.add('is-hovering'); dot.classList.add('is-hovering'); }
  });
  addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) { ring.classList.remove('is-hovering'); dot.classList.remove('is-hovering'); }
  });
})();


/* ============================================================
   SECTION SEARCH  (nav button or Cmd/Ctrl+K)
   ============================================================ */
(function() {
  const sections = [
    { name: 'Home',           hint: 'top',           id: 'home' },
    { name: 'About',          hint: 'section 01',    id: 'about' },
    { name: 'GitHub activity',hint: 'contributions', id: 'gh-strip' },
    { name: 'Projects',       hint: 'section 02',    id: 'projects' },
    { name: 'Contact',        hint: 'section 03',    id: 'contact' },
    { name: 'Resume',         hint: 'opens pdf',     href: 'Resume.pdf' }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML =
    '<div class="search-box" role="dialog" aria-modal="true" aria-label="Jump to a section">' +
      '<input class="search-input" type="text" placeholder="Jump to a section\u2026" aria-label="Search sections">' +
      '<ul class="search-results"></ul>' +
    '</div>';
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.search-input');
  const list = overlay.querySelector('.search-results');
  let active = 0;

  function filtered() {
    const q = input.value.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(s => (s.name + ' ' + s.hint).toLowerCase().includes(q));
  }
  function render(items) {
    list.innerHTML = '';
    if (!items.length) { list.innerHTML = '<li class="search-empty">No sections match that.</li>'; return; }
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'search-result' + (i === active ? ' active' : '');
      li.innerHTML = '<span>' + it.name + '</span><span class="sr-hint">' + it.hint + '</span>';
      li.addEventListener('click', () => go(it));
      list.appendChild(li);
    });
  }
  function go(it) {
    close();
    if (it.href) { window.open(it.href, '_blank'); return; }
    const el = document.getElementById(it.id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  function open() { overlay.classList.add('open'); input.value = ''; active = 0; render(sections); input.focus(); }
  function close() { overlay.classList.remove('open'); }

  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) searchBtn.addEventListener('click', open);

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); return; }
    if (!overlay.classList.contains('open')) return;
    const items = filtered();
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); render(items); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); active = Math.max(active - 1, 0); render(items); }
    else if (e.key === 'Enter')     { if (items[active]) go(items[active]); }
  });
  input.addEventListener('input', () => { active = 0; render(filtered()); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
})();


/* ============================================================
   GLITCH TYPEWRITER  (hero title, then paragraph)
   ============================================================ */
(function() {
  const els = [
    document.getElementById('hero-title-typewriter'),
    document.getElementById('hero-typewriter')
  ].filter(Boolean);
  if (!els.length) return;

  // Capture the source text before clearing anything
  const lines = els.map(el => ({ el, text: el.textContent.replace(/\s+/g, ' ').trim() }));

  // Reduced motion: show the finished text, no animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lines.forEach(l => { l.el.textContent = l.text; });
    return;
  }

  const GLITCH = '!<>-_\\/[]{}=+*^?#$%&@~';
  const SCRAMBLE_LEN = 3;    // unsettled chars trailing the cursor
  const MIN_DELAY = 34;      // fastest keystroke (ms)
  const MAX_DELAY = 92;      // slowest keystroke (ms)
  const START_PAUSE = 400;   // beat before the title starts
  const LINE_PAUSE = 500;    // beat between title and paragraph

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function randGlitch(n) {
    let out = '';
    for (let i = 0; i < n; i++) out += GLITCH[Math.floor(Math.random() * GLITCH.length)];
    return out;
  }

  // Clear both lines up front so the paragraph doesn't sit there while the title types
  lines.forEach(l => { l.el.textContent = ''; l.el.setAttribute('aria-label', l.text); });

  function typeLine(line, isLast, done) {
    const textSpan = document.createElement('span');
    const caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    caret.setAttribute('aria-hidden', 'true');
    line.el.appendChild(textSpan);
    line.el.appendChild(caret);

    let i = 0;
    (function step() {
      const settled = line.text.slice(0, i);
      const remaining = line.text.length - i;
      const scrambleLen = Math.min(SCRAMBLE_LEN, remaining);
      const scramble = scrambleLen ? randGlitch(scrambleLen) : '';

      textSpan.innerHTML = esc(settled) +
        (scramble ? '<span class="glitch-char">' + esc(scramble) + '</span>' : '');

      if (i >= line.text.length) {
        if (!isLast) caret.remove();   // caret moves on to the next line
        done();
        return;
      }
      i++;
      setTimeout(step, MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));
    })();
  }

  let idx = 0;
  function next() {
    if (idx >= lines.length) return;
    const line = lines[idx];
    const isLast = idx === lines.length - 1;
    idx++;
    typeLine(line, isLast, () => { if (!isLast) setTimeout(next, LINE_PAUSE); });
  }
  setTimeout(next, START_PAUSE);
})();

/* ============================================================
   INTERACTIVE GRID  (spotlight follows the cursor / finger)
   ============================================================ */
(function() {
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero-grid-glow');
  if (!hero || !glow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let x = 0, y = 0, queued = false;

  function paint() {
    queued = false;
    glow.style.setProperty('--gx', x + 'px');
    glow.style.setProperty('--gy', y + 'px');
  }

  function updateFromEvent(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    hero.classList.add('grid-live');
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }

  // Mouse (fine pointer devices)
  hero.addEventListener('mousemove', (e) => {
    updateFromEvent(e.clientX, e.clientY);
  });
  hero.addEventListener('mouseleave', () => hero.classList.remove('grid-live'));

  // Touch (phones/tablets)
  hero.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    updateFromEvent(t.clientX, t.clientY);
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    updateFromEvent(t.clientX, t.clientY);
  }, { passive: true });

  hero.addEventListener('touchend', () => hero.classList.remove('grid-live'));
})();
