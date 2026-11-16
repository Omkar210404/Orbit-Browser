// renderer.js — Orbit browser core
// Handles: personas, onboarding, tabs (sidebar/top/cards), start page,
//          widgets, 3D effects, AI sidebar, tab switcher

'use strict';
const $ = s => document.querySelector(s);

/* ═══════════════════════════════════════════════════
   PERSONA / THEME ENGINE
═══════════════════════════════════════════════════ */
let activePersonaIds = [];   // array of persona ids (1–3)
let activePersona = null;    // merged result from mergePersonas()

function applyTheme(persona) {
  if (!persona) return;
  const t = persona.theme;
  const r = document.documentElement.style;
  r.setProperty('--bg',    t.bg);
  r.setProperty('--panel', t.panel);
  r.setProperty('--line',  t.line);
  r.setProperty('--text',  t.text);
  r.setProperty('--mute',  t.mute);
  r.setProperty('--acc',   t.acc);
  r.setProperty('--font',  t.font);
  r.setProperty('--glow1', t.glow1);
  r.setProperty('--glow2', t.glow2);

  // Derive rgba versions of accent and panel for high performance and compatibility
  const ar = hexToRgb(t.acc);
  if (ar) {
    r.setProperty('--acc16', `rgba(${ar},0.16)`);
    r.setProperty('--acc12', `rgba(${ar},0.12)`);
    r.setProperty('--acc25', `rgba(${ar},0.25)`);
    r.setProperty('--acc40', `rgba(${ar},0.40)`);
  }
  const pr = hexToRgb(t.panel);
  if (pr) r.setProperty('--panel85', `rgba(${pr},0.88)`);

  // Update Windows title bar overlay via IPC
  if (window.orbit.setTitleBar) {
    window.orbit.setTitleBar({ color: t.titleBar, symbolColor: t.titleSym });
  }

  // Apply layout and rebuild UI cleanly
  document.body.dataset.layout = persona.tabLayout;
  renderTabs();
  buildTiles();
  buildWidgets();
  updateAIPersona(persona);
}

// Convert #rrggbb → "r,g,b" string for rgba()
function hexToRgb(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : null;
}

function savePersonas(ids) {
  localStorage.setItem('orbitPersonas', JSON.stringify(ids));
}
function loadPersonas() {
  try { return JSON.parse(localStorage.getItem('orbitPersonas') || 'null'); }
  catch { return null; }
}

function activatePersonas(ids) {
  activePersonaIds = ids;
  activePersona = mergePersonas(ids);
  savePersonas(ids);
  applyTheme(activePersona);
}

/* ═══════════════════════════════════════════════════
   ONBOARDING & CATEGORY SELECTOR
═══════════════════════════════════════════════════ */
const ob = {
  el: $('#onboarding'),
  selected: [],         // persona ids selected
  customPersona: null,  // extra AI-generated persona
};

function buildOnboarding() {
  const container = $('#ob-cards');
  container.innerHTML = '';
  PERSONAS.forEach(p => {
    const card = document.createElement('div');
    const isSel = ob.selected.includes(p.id);
    card.className = 'ob-card' + (isSel ? ' selected' : '');
    card.dataset.id = p.id;
    card.style.setProperty('--card-acc', p.theme.acc);
    card.style.setProperty('--card-bg',  p.theme.bg);
    card.style.setProperty('--card-panel', p.theme.panel);
    card.innerHTML = `
      <div class="ob-card-bg"></div>
      <div class="ob-card-body">
        <span class="ob-emoji">${p.emoji}</span>
        <strong>${p.name}</strong>
        <p>${p.desc}</p>
      </div>
      <div class="ob-check">✓</div>`;
    card.addEventListener('click', () => toggleOBCard(p.id, card));
    addTilt(card);
    container.appendChild(card);
  });
}

function toggleOBCard(id, card) {
  const idx = ob.selected.indexOf(id);
  if (idx > -1) {
    ob.selected.splice(idx, 1);
    card.classList.remove('selected');
  } else {
    if (ob.selected.length >= 3) {
      $('#ob-sel-hint').textContent = 'Max 3 selected!';
      setTimeout(() => { $('#ob-sel-hint').textContent = ''; }, 1500);
      return;
    }
    ob.selected.push(id);
    card.classList.add('selected');
  }
  updateOBPreview();
}

function updateOBPreview() {
  const btn = $('#ob-launch');
  btn.disabled = ob.selected.length === 0;
  btn.textContent = activePersonaIds.length ? '✓ Apply Changes' : '🚀 Launch Orbit';

  const count = ob.selected.length;
  $('#ob-sel-hint').textContent = count
    ? `${count} selected — first choice sets theme & layout`
    : 'Choose at least 1 persona';

  // Live theme preview
  const first = PERSONAS.find(p => p.id === ob.selected[0]);
  if (first) {
    const t = first.theme;
    $('#ob-bg').style.background =
      `radial-gradient(ellipse at 30% 70%, ${t.glow1} 0%, transparent 60%),
       radial-gradient(ellipse at 70% 30%, ${t.glow2} 0%, transparent 60%),
       ${t.bg}`;
  } else {
    $('#ob-bg').style.background = '';
  }
}

function showOnboarding() {
  ob.selected = activePersonaIds && activePersonaIds.length ? [...activePersonaIds] : [];
  buildOnboarding();
  updateOBPreview();
  const obClose = $('#ob-close');
  if (obClose) {
    obClose.style.display = activePersonaIds.length ? 'flex' : 'none';
  }
  ob.el.classList.remove('hidden');
  document.body.classList.add('ob-open');
}

function hideOnboarding() {
  ob.el.classList.add('hidden');
  document.body.classList.remove('ob-open');
}

$('#ob-close')?.addEventListener('click', hideOnboarding);

$('#ob-launch').addEventListener('click', () => {
  if (!ob.selected.length) return;
  const ids = ob.customPersona
    ? [ob.customPersona.id, ...ob.selected].slice(0, 3)
    : [...ob.selected];
  activatePersonas(ids);
  hideOnboarding();
  if (!tabs.length) newTab();
});

// All entry points for reopening onboarding
$('#bar-interestsBtn')?.addEventListener('click', showOnboarding);
$('#interestsBtn')?.addEventListener('click', showOnboarding);
$('#top-interestsBtn')?.addEventListener('click', showOnboarding);

/* "Other" custom persona via AI */
$('#ob-other-btn').addEventListener('click', async () => {
  const interest = $('#ob-other').value.trim();
  if (!interest) return;
  $('#ob-other-btn').textContent = '…';
  $('#ob-other-btn').disabled = true;
  try {
    const persona = await generateCustomPersona(interest);
    ob.customPersona = persona;
    const card = document.createElement('div');
    card.className = 'ob-card custom-persona selected';
    card.dataset.id = persona.id;
    card.style.setProperty('--card-acc', persona.theme.acc);
    card.style.setProperty('--card-bg',  persona.theme.bg);
    card.style.setProperty('--card-panel', persona.theme.panel);
    card.innerHTML = `
      <div class="ob-card-bg"></div>
      <div class="ob-card-body">
        <span class="ob-emoji">${persona.emoji}</span>
        <strong>${persona.name}</strong>
        <p>${persona.desc}</p>
      </div>
      <div class="ob-check">✓</div>`;
    card.addEventListener('click', () => toggleOBCard(persona.id, card));
    addTilt(card);
    $('#ob-cards').appendChild(card);
    if (!ob.selected.includes(persona.id)) {
      if (ob.selected.length >= 3) ob.selected.pop();
      ob.selected.unshift(persona.id);
      updateOBPreview();
    }
  } catch (e) {
    console.warn('Custom persona failed', e);
  }
  $('#ob-other-btn').textContent = '✦ Add';
  $('#ob-other-btn').disabled = false;
});

async function generateCustomPersona(interest) {
  if (!window.orbit.generatePersona) throw new Error('No IPC bridge');
  const raw = await window.orbit.generatePersona(interest);
  return validatePersona(raw, interest);
}

function validatePersona(raw, interest) {
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const HTTPS = /^https:\/\//;
  const LAYOUTS = ['sidebar', 'top', 'cards'];

  if (typeof raw !== 'object' || !raw) throw new Error('Not an object');
  raw.id = 'custom-' + interest.toLowerCase().replace(/\W+/g, '-').slice(0, 20);
  if (typeof raw.name !== 'string') throw new Error('Bad name');
  if (!HEX.test(raw.theme?.bg))    throw new Error('Bad bg');
  if (!HEX.test(raw.theme?.panel)) throw new Error('Bad panel');
  if (!HEX.test(raw.theme?.line))  throw new Error('Bad line');
  if (!HEX.test(raw.theme?.text))  throw new Error('Bad text');
  if (!HEX.test(raw.theme?.mute))  throw new Error('Bad mute');
  if (!HEX.test(raw.theme?.acc))   throw new Error('Bad acc');
  if (!LAYOUTS.includes(raw.tabLayout)) raw.tabLayout = 'cards';
  raw.theme.glow1 = raw.theme.glow1 || raw.theme.acc + '33';
  raw.theme.glow2 = raw.theme.glow2 || raw.theme.acc + '22';
  raw.theme.titleBar = raw.theme.titleBar || raw.theme.panel;
  raw.theme.titleSym = raw.theme.titleSym || raw.theme.acc;
  raw.theme.font = raw.theme.font || 'system-ui, sans-serif';
  raw.shortcuts = (raw.shortcuts || [])
    .filter(s => s && HTTPS.test(s.url) && typeof s.name === 'string')
    .slice(0, 6);
  raw.widgets = (raw.widgets || ['clock']).filter(w => ['clock','focus','notes'].includes(w));
  raw.emoji = (raw.emoji || '🌟').replace(/<[^>]+>/g, '').slice(0, 4);
  raw.desc  = String(raw.desc || interest).replace(/<[^>]+>/g, '').slice(0, 60);
  if (typeof raw.aiPersona?.systemPrompt !== 'string') {
    raw.aiPersona = { systemPrompt: `You are a ${interest} assistant.`, chips: [] };
  }
  raw.aiPersona.systemPrompt = raw.aiPersona.systemPrompt.replace(/<[^>]+>/g, '').slice(0, 400);
  raw.aiPersona.chips = (raw.aiPersona.chips || []).slice(0, 3).map(c => String(c).slice(0, 40));
  return raw;
}

/* ═══════════════════════════════════════════════════
   TAB & NAVIGATION SYSTEM
═══════════════════════════════════════════════════ */
let tabs = [], active = null, nextId = 1;
const SEARCH = 'https://www.google.com/search?q=';

if (window.orbit.platform === 'darwin') document.body.classList.add('mac');

// High-resolution real brand logo resolver (Google Favicon API)
function getDomainFavicon(url) {
  if (!url || url === 'about:blank') return '';
  try {
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    const host = new URL(target).hostname;
    if (!host) return '';
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return '';
  }
}

function getHostname(url) {
  if (!url || url === 'about:blank') return 'orbit://start';
  try {
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    return new URL(target).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTabIconHtml(tab) {
  if (tab.blank) {
    return `<span class="tab-orbit-icon"><span class="orbit-mini-ring"></span></span>`;
  }
  const realIcon = tab.icon || getDomainFavicon(tab.wv ? (tab.wv.getAttribute('src') || '') : '');
  if (realIcon) {
    return `<img class="tab-real-icon" src="${escapeHtml(realIcon)}" alt="" onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{className:'tab-orbit-icon',innerHTML:'<span class=\\'orbit-mini-ring\\'></span>'}));">`;
  }
  return `<span class="tab-orbit-icon"><span class="orbit-mini-ring"></span></span>`;
}

function toUrl(t) {
  t = t.trim(); if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t) && !t.includes(' ')) return 'https://' + t;
  return SEARCH + encodeURIComponent(t);
}

function newTab(url) {
  const id = nextId++;
  const wv = document.createElement('webview');
  const initialIcon = url ? getDomainFavicon(url) : '';
  const tab = { id, wv, title: url ? getHostname(url) : 'New Tab', icon: initialIcon, blank: !url, forwardUrl: null };
  wv.setAttribute('allowpopups', '');
  wv.addEventListener('page-title-updated', e => { tab.title = e.title; renderTabs(); });
  wv.addEventListener('page-favicon-updated', e => {
    if (e.favicons && e.favicons[0]) {
      tab.icon = e.favicons[0];
      renderTabs();
    }
  });

  const nav = () => {
    tab.blank = false;
    tab.forwardUrl = null;
    const curUrl = wv.getURL();
    if (!tab.icon) tab.icon = getDomainFavicon(curUrl);
    if (active === tab) {
      $('#addr').value = curUrl;
      updateAddrBadge(curUrl);
      $('#start').classList.add('hide');
      updateNavButtons();
    }
    renderTabs();
  };
  wv.addEventListener('did-navigate', nav);
  wv.addEventListener('did-navigate-in-page', nav);
  wv.addEventListener('did-stop-loading', () => { if (active === tab) updateNavButtons(); });

  $('#views').appendChild(wv);
  tabs.push(tab);
  select(tab);
  if (url) {
    wv.src = url;
    tab.blank = false;
    tab.icon = getDomainFavicon(url);
  }
}

function go(t) {
  const u = toUrl(t); if (!u) return;
  if (!active) {
    newTab(u);
  } else {
    active.wv.src = u;
    active.blank = false;
    active.forwardUrl = null;
    active.icon = getDomainFavicon(u);
    active.title = getHostname(u);
    select(active);
  }
}

function updateAddrBadge(url) {
  const badge = $('#addr-badge');
  if (!badge) return;
  if (!url || active?.blank) {
    badge.textContent = '✦';
    badge.title = 'Orbit Start Page';
  } else if (/^https:/i.test(url)) {
    badge.textContent = '🔒';
    badge.title = 'Secure Connection (HTTPS)';
  } else {
    badge.textContent = 'ℹ';
    badge.title = 'Website';
  }
}

function select(tab) {
  active = tab;
  tabs.forEach(t => t.wv.classList.toggle('on', t === tab));
  $('#start').classList.toggle('hide', !tab.blank);
  let curUrl = '';
  if (!tab.blank) {
    try { curUrl = tab.wv.getURL(); } catch(e){}
    if (!curUrl) curUrl = tab.wv.getAttribute('src') || '';
  }
  $('#addr').value = curUrl;
  updateAddrBadge(curUrl);
  renderTabs();
  updateNavButtons();
}

function closeTab(tab) {
  tab.wv.remove();
  tabs = tabs.filter(t => t !== tab);
  if (!tabs.length) newTab();
  else if (active === tab) select(tabs[tabs.length - 1]);
  else renderTabs();
}

/* ── Back & Forward with return-to-start-page fallback ── */
function handleBack() {
  if (!active) return;
  try {
    if (active.wv && typeof active.wv.canGoBack === 'function' && active.wv.canGoBack()) {
      active.wv.goBack();
      setTimeout(updateNavButtons, 100);
      return;
    }
  } catch(e) {}

  // If at earliest page in webview history, return to the Orbit Start Page!
  if (!active.blank) {
    let u = '';
    try { u = active.wv.getURL(); } catch(e){}
    if (!u) u = active.wv.getAttribute('src') || '';
    active.forwardUrl = u;
    active.blank = true;
    active.title = 'New Tab';
    active.icon = '';
    try { active.wv.stop(); } catch(e){}
    active.wv.src = 'about:blank';
    select(active);
  }
}

function handleForward() {
  if (!active) return;
  if (active.blank && active.forwardUrl) {
    const u = active.forwardUrl;
    active.forwardUrl = null;
    go(u);
    return;
  }
  try {
    if (active.wv && typeof active.wv.canGoForward === 'function' && active.wv.canGoForward()) {
      active.wv.goForward();
      setTimeout(updateNavButtons, 100);
    }
  } catch(e) {}
}

function updateNavButtons() {
  const backBtn = $('#back');
  const fwdBtn = $('#fwd');
  if (!backBtn || !fwdBtn) return;
  let canBack = false, canFwd = false;
  if (active) {
    if (!active.blank) {
      canBack = true;
      try { canFwd = active.wv && typeof active.wv.canGoForward === 'function' && active.wv.canGoForward(); } catch(e){}
    } else {
      canBack = false;
      canFwd = Boolean(active.forwardUrl);
    }
  }
  backBtn.style.opacity = canBack ? '1' : '0.35';
  backBtn.style.cursor = canBack ? 'pointer' : 'default';
  fwdBtn.style.opacity = canFwd ? '1' : '0.35';
  fwdBtn.style.cursor = canFwd ? 'pointer' : 'default';
}

/* ── Render tabs depending on layout mode ── */
function renderTabs() {
  const layout = document.body.dataset.layout || 'sidebar';
  if (layout === 'sidebar') renderSidebarTabs();
  else if (layout === 'top') renderTopTabs();
  else renderCardTabs();
}

/* 1. Sidebar tabs */
function renderSidebarTabs() {
  const c = $('#side-tabs'); c.innerHTML = '';
  tabs.forEach(t => {
    const d = document.createElement('div');
    d.className = 'tab' + (t === active ? ' on' : '');
    d.innerHTML = `
      <div class="tab-icon-box">${renderTabIconHtml(t)}</div>
      <span class="t">${escapeHtml(t.title)}</span>
      <button class="x" title="Close">✕</button>`;
    d.onclick = () => select(t);
    d.querySelector('.x').onclick = e => { e.stopPropagation(); closeTab(t); };
    c.appendChild(d);
  });
}

/* 2. Top horizontal tabs */
function renderTopTabs() {
  const c = $('#top-tabs'); c.innerHTML = '';
  tabs.forEach(t => {
    const d = document.createElement('div');
    d.className = 'top-tab' + (t === active ? ' on' : '');
    d.innerHTML = `
      <div class="tab-icon-box">${renderTabIconHtml(t)}</div>
      <span class="t">${escapeHtml(t.title)}</span>
      <button class="x" title="Close">✕</button>`;
    d.onclick = () => select(t);
    d.querySelector('.x').onclick = e => { e.stopPropagation(); closeTab(t); };
    c.appendChild(d);
  });
}

/* 3. Cards tabs (elevated 3D cards at top with real logo & domain) */
function renderCardTabs() {
  const c = $('#cards-tabbar'); c.innerHTML = '';
  tabs.forEach(t => {
    const d = document.createElement('div');
    d.className = 'card-tab' + (t === active ? ' on' : '');
    const hostname = t.blank ? 'orbit://start' : getHostname(t.wv ? (t.wv.getAttribute('src') || (t.wv.getURL ? t.wv.getURL() : '') || '') : '');
    d.innerHTML = `
      <div class="card-tab-face">
        <div class="card-tab-icon-box">${renderTabIconHtml(t)}</div>
        <div class="card-tab-info">
          <span class="card-tab-title">${escapeHtml(t.title)}</span>
          <span class="card-tab-domain">${escapeHtml(hostname)}</span>
        </div>
        <button class="x" title="Close Tab">✕</button>
      </div>`;
    d.onclick = () => select(t);
    d.querySelector('.x').onclick = e => { e.stopPropagation(); closeTab(t); };
    addTilt(d);
    c.appendChild(d);
  });

  // Action buttons inside cards tabbar
  const addBtn = document.createElement('button');
  addBtn.className = 'cards-action-btn';
  addBtn.title = 'New Tab (Ctrl+T)';
  addBtn.textContent = '+';
  addBtn.onclick = () => newTab();
  c.appendChild(addBtn);

  const intBtn = document.createElement('button');
  intBtn.className = 'cards-action-btn';
  intBtn.title = 'Change persona & theme (🎨)';
  intBtn.textContent = '🎨';
  intBtn.onclick = () => showOnboarding();
  c.appendChild(intBtn);

  const tsBtn = document.createElement('button');
  tsBtn.className = 'cards-action-btn';
  tsBtn.title = '3D Tab Switcher (Ctrl+Tab)';
  tsBtn.textContent = '⬡';
  tsBtn.onclick = () => openTabSwitcher();
  c.appendChild(tsBtn);
}

/* ═══════════════════════════════════════════════════
   START PAGE
═══════════════════════════════════════════════════ */
function buildGreeting() {
  const h = new Date().getHours();
  const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const names = activePersona
    ? activePersonaIds.map(id => {
        const p = PERSONAS.find(x => x.id === id) || (activePersona?.id === id ? activePersona : null);
        return p ? p.name : '';
      }).filter(Boolean).join(' + ')
    : '';

  $('#greet').innerHTML = `Good <b>${tod}!</b>`;

  const tag = $('#start-persona-tag');
  if (tag) {
    tag.innerHTML = `🎨 Persona: <b>${names || 'Custom'}</b> · <span style="text-decoration:underline">Change</span>`;
    tag.onclick = showOnboarding;
  }
}

function buildTiles() {
  const c = $('#tiles'); c.innerHTML = '';
  if (!activePersona) return;
  activePersona.shortcuts.slice(0, 8).forEach(s => {
    const d = document.createElement('div');
    d.className = 'tile';
    const realIcon = getDomainFavicon(s.url);
    d.innerHTML = `
      <div class="tile-icon-box">
        <img class="tile-real-icon" src="${escapeHtml(realIcon)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <span class="tile-fallback-emoji" style="display:none">${s.icon}</span>
      </div>
      <span class="tile-name">${escapeHtml(s.name)}</span>`;
    d.onclick = () => go(s.url);
    addTilt(d);
    c.appendChild(d);
  });
}

function buildWidgets() {
  const c = $('#widgets'); c.innerHTML = '';
  if (!activePersona) return;
  if (activePersona.widgets.includes('clock')) c.appendChild(buildClock());
  if (activePersona.widgets.includes('focus')) c.appendChild(buildFocusTimer());
  if (activePersona.widgets.includes('notes')) c.appendChild(buildNotes());
  buildGreeting();
}

/* Clock widget */
function buildClock() {
  const wrap = document.createElement('div');
  wrap.className = 'widget clock-widget';
  wrap.innerHTML = '<div class="clock-time">00:00</div><div class="clock-date"></div>';
  function tick() {
    const now = new Date();
    wrap.querySelector('.clock-time').textContent =
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrap.querySelector('.clock-date').textContent =
      now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }
  tick(); setInterval(tick, 1000);
  return wrap;
}

/* 25-min focus timer */
function buildFocusTimer() {
  const wrap = document.createElement('div');
  wrap.className = 'widget focus-widget';
  let total = 25 * 60, remaining = total, running = false, interval = null;
  function fmt(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }
  function render() {
    wrap.querySelector('.focus-time').textContent = fmt(remaining);
    const pct = ((total - remaining) / total) * 100;
    wrap.querySelector('.focus-arc').style.setProperty('--pct', pct + '%');
  }
  wrap.innerHTML = `
    <div class="focus-arc" style="--pct:0%">
      <div class="focus-time">${fmt(remaining)}</div>
    </div>
    <div class="focus-btns">
      <button class="focus-start">▶ Focus</button>
      <button class="focus-reset">↺</button>
    </div>`;
  wrap.querySelector('.focus-start').onclick = () => {
    if (running) {
      clearInterval(interval); running = false;
      wrap.querySelector('.focus-start').textContent = '▶ Focus';
    } else {
      if (remaining <= 0) remaining = total;
      running = true;
      wrap.querySelector('.focus-start').textContent = '⏸ Pause';
      interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval); running = false;
          wrap.querySelector('.focus-start').textContent = '▶ Focus';
          remaining = 0;
        }
        render();
      }, 1000);
    }
  };
  wrap.querySelector('.focus-reset').onclick = () => {
    clearInterval(interval); running = false; remaining = total;
    wrap.querySelector('.focus-start').textContent = '▶ Focus';
    render();
  };
  render();
  return wrap;
}

/* Quick notes */
function buildNotes() {
  const wrap = document.createElement('div');
  wrap.className = 'widget notes-widget';
  wrap.innerHTML = `<div class="widget-label">Quick Notes</div>
    <textarea class="notes-area" placeholder="Jot down notes…"></textarea>`;
  const ta = wrap.querySelector('textarea');
  ta.value = localStorage.getItem('orbitNotes') || '';
  ta.addEventListener('input', () => localStorage.setItem('orbitNotes', ta.value));
  return wrap;
}

/* ═══════════════════════════════════════════════════
   3-D TILT & PARALLAX
═══════════════════════════════════════════════════ */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function addTilt(el) {
  if (reducedMotion) return;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.03)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
}

if (!reducedMotion) {
  document.addEventListener('mousemove', e => {
    const mx = e.clientX / window.innerWidth  - 0.5;
    const my = e.clientY / window.innerHeight - 0.5;
    const g1 = $('#glow1'), g2 = $('#glow2');
    if (g1) g1.style.transform = `translate(${mx*36}px, ${my*36}px)`;
    if (g2) g2.style.transform = `translate(${mx*-28}px, ${my*-28}px)`;
  });
}

/* ═══════════════════════════════════════════════════
   3-D TAB SWITCHER
═══════════════════════════════════════════════════ */
let tsIndex = 0;
const tsOverlay = $('#tab-switcher');
const tsStage   = $('#ts-stage');

function openTabSwitcher() {
  if (tabs.length < 1) return;
  tsIndex = tabs.indexOf(active);
  if (tsIndex < 0) tsIndex = 0;
  renderTabSwitcher();
  tsOverlay.classList.remove('hidden');
  tsOverlay.focus();
}
function closeTabSwitcher() { tsOverlay.classList.add('hidden'); }

function renderTabSwitcher() {
  tsStage.innerHTML = '';
  tabs.forEach((t, i) => {
    const diff = i - tsIndex;
    const card = document.createElement('div');
    card.className = 'ts-card' + (i === tsIndex ? ' center' : '');
    card.style.cssText = reducedMotion
      ? `transform: translateX(${diff * 170}px); opacity: ${i === tsIndex ? 1 : 0.5};`
      : `transform: perspective(900px) translateX(${diff * 200}px) translateZ(${i === tsIndex ? 0 : -130}px) rotateY(${diff * -28}deg);
         opacity: ${Math.abs(diff) > 2 ? 0 : 1 - Math.abs(diff) * 0.3};`;
    card.innerHTML = `<div class="ts-icon-box">${renderTabIconHtml(t)}</div>
      <div class="ts-title">${escapeHtml(t.title)}</div>`;
    card.onclick = () => {
      if (i === tsIndex) {
        select(tabs[tsIndex]);
        closeTabSwitcher();
      } else {
        tsIndex = i;
        renderTabSwitcher();
      }
    };
    tsStage.appendChild(card);
  });
}

$('#ts-open-btn')?.addEventListener('click', openTabSwitcher);
$('#top-ts-btn')?.addEventListener('click', openTabSwitcher);
$('#bar-ts-btn')?.addEventListener('click', openTabSwitcher);

tsOverlay.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { tsIndex = Math.min(tsIndex + 1, tabs.length - 1); renderTabSwitcher(); }
  if (e.key === 'ArrowLeft')  { tsIndex = Math.max(tsIndex - 1, 0); renderTabSwitcher(); }
  if (e.key === 'Enter') { select(tabs[tsIndex]); closeTabSwitcher(); }
  if (e.key === 'Escape') closeTabSwitcher();
});
tsOverlay.setAttribute('tabindex', '-1');

/* ═══════════════════════════════════════════════════
   AI SIDEBAR
═══════════════════════════════════════════════════ */
let aiPersonaPrompt = '';

function updateAIPersona(persona) {
  if (!persona?.aiPersona) return;
  aiPersonaPrompt = persona.aiPersona.systemPrompt;
  const chipsEl = $('#ai-chips');
  chipsEl.innerHTML = '';
  (persona.aiPersona.chips || []).forEach(chip => {
    const b = document.createElement('button');
    b.className = 'ai-chip';
    b.textContent = chip;
    b.onclick = () => sendAIMessage(chip);
    chipsEl.appendChild(b);
  });
}

function toggleAI() {
  $('#ai-panel').classList.toggle('hidden');
  if (!$('#ai-panel').classList.contains('hidden')) {
    $('#ai-input').focus();
  }
}

$('#aiBtn').onclick = toggleAI;
$('#top-aiBtn')?.addEventListener('click', toggleAI);
$('#ai-close').onclick = () => $('#ai-panel').classList.add('hidden');

$('#ai-form').onsubmit = e => {
  e.preventDefault();
  const msg = $('#ai-input').value.trim(); if (!msg) return;
  $('#ai-input').value = '';
  sendAIMessage(msg);
};

function appendAIMsg(role, text) {
  const msgs = $('#ai-msgs');
  const d = document.createElement('div');
  d.className = 'ai-msg ' + role;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendAIMessage(msg) {
  appendAIMsg('user', msg);
  if (!window.orbit.askAI) {
    appendAIMsg('assistant', '(AI proxy not available)');
    return;
  }
  appendAIMsg('assistant', '…');
  try {
    const reply = await window.orbit.askAI({ systemPrompt: aiPersonaPrompt, message: msg });
    const last = $('#ai-msgs').lastElementChild;
    if (last) last.textContent = reply;
  } catch (e) {
    const last = $('#ai-msgs').lastElementChild;
    if (last) last.textContent = 'Note: ' + e.message;
  }
}

/* ═══════════════════════════════════════════════════
   TOOLBAR & SHORTCUTS WIRING
═══════════════════════════════════════════════════ */
$('#newTab').onclick = () => newTab();
$('#top-newTab')?.addEventListener('click', () => newTab());
$('#addr').addEventListener('keydown', e => { if (e.key === 'Enter') go(e.target.value); });
$('#searchForm').onsubmit = e => { e.preventDefault(); go($('#q').value); $('#q').value = ''; };

$('#back').onclick = handleBack;
$('#fwd').onclick = handleForward;
$('#reload').onclick = () => {
  if (active && !active.blank) {
    try { active.wv.reload(); } catch(e){}
  } else {
    buildGreeting();
    buildTiles();
    buildWidgets();
  }
};

$('#collapseBtn')?.addEventListener('click', () => {
  $('#side').classList.toggle('collapsed');
  $('#collapseBtn').textContent = $('#side').classList.contains('collapsed') ? '▶' : '◀';
});

window.addEventListener('keydown', e => {
  // Alt+Left -> Back, Alt+Right -> Forward
  if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); handleBack(); return; }
  if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); handleForward(); return; }

  // Escape closes modals
  if (e.key === 'Escape') {
    if (!ob.el.classList.contains('hidden') && activePersonaIds.length) {
      hideOnboarding();
      return;
    }
    if (!tsOverlay.classList.contains('hidden')) {
      closeTabSwitcher();
      return;
    }
  }

  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;
  if (e.key === 't') { e.preventDefault(); newTab(); }
  if (e.key === 'w') { e.preventDefault(); active && closeTab(active); }
  if (e.key === 'l') { e.preventDefault(); $('#addr').focus(); $('#addr').select(); }
  if (e.key === 'r') { e.preventDefault(); $('#reload').click(); }
  if (e.key === 'Tab') { e.preventDefault(); openTabSwitcher(); }
});

window.orbit.onOpenUrl(u => newTab(u));

/* ═══════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════ */
(function boot() {
  const saved = loadPersonas();
  if (saved && saved.length) {
    activatePersonas(saved);
    newTab();
  } else {
    document.body.dataset.layout = 'sidebar';
    showOnboarding();
  }
})();
