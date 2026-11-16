// main.js — Orbit Electron main process
// Handles: window, IPC for title-bar colour, AI calls (key in safeStorage)

'use strict';
const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs   = require('fs');
const https = require('https');

let win;

/* ── helpers ── */
function getKeyFile() {
  try {
    const dataDir = app.getPath('userData');
    return path.join(dataDir, 'aikey.enc');
  } catch {
    return path.join(__dirname, 'aikey.enc');
  }
}

function saveApiKey(key) {
  if (!safeStorage.isEncryptionAvailable()) return;
  fs.writeFileSync(getKeyFile(), safeStorage.encryptString(key));
}
function loadApiKey() {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const buf = fs.readFileSync(getKeyFile());
    return safeStorage.decryptString(buf);
  } catch { return null; }
}

/* ── window ── */
function createWindow() {
  const mac = process.platform === 'darwin';
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 760, minHeight: 500,
    backgroundColor: '#06141f',
    titleBarStyle: 'hidden',
    ...(mac
      ? { trafficLightPosition: { x: 14, y: 14 } }
      : { titleBarOverlay: { color: '#0b1f2c', symbolColor: '#35e0c0', height: 44 } }),
    webPreferences: {
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
}

/* ── update title bar colours from renderer ── */
ipcMain.on('set-title-bar', (_e, { color, symbolColor }) => {
  if (win && process.platform !== 'darwin') {
    try { win.setTitleBarOverlay({ color, symbolColor, height: 44 }); }
    catch { /* older Electron versions may not support it */ }
  }
});

/* ── AI: store/retrieve API key ── */
ipcMain.handle('save-api-key', (_e, key) => { saveApiKey(key); return true; });
ipcMain.handle('get-api-key',  () => loadApiKey());

/* ── AI: proxy call to Gemini (keeps key off web pages) ── */
ipcMain.handle('ask-ai', async (_e, { systemPrompt, message }) => {
  const key = loadApiKey();
  if (!key) throw new Error('No API key stored.');

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt || 'You are a helpful browser assistant.' }] },
    contents: [{ role: 'user', parts: [{ text: message }] }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message || 'API error'));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '(no response)';
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
});

/* ── AI: generate custom persona from free-text interest ── */
ipcMain.handle('generate-persona', async (_e, interest) => {
  const key = loadApiKey();
  if (!key) throw new Error('No API key stored.');

  const schema = `{"name":"string","emoji":"single emoji","desc":"string <=60 chars",
"theme":{"bg":"#rrggbb","panel":"#rrggbb","line":"#rrggbb","text":"#rrggbb","mute":"#rrggbb","acc":"#rrggbb"},
"tabLayout":"sidebar|top|cards",
"shortcuts":[{"name":"string","icon":"emoji","url":"https://..."}],
"widgets":["clock","focus","notes"],
"aiPersona":{"systemPrompt":"string <=400 chars","chips":["string","string","string"]}}`;

  const prompt = `You are a browser persona designer. The user is into: "${interest}".
Return ONLY valid JSON matching this schema (no markdown, no extra keys):
${schema}
Make colours vivid and distinctive. All URLs must start with https://.`;

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 800 },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          let text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Strip markdown code fences if present
          text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
          resolve(JSON.parse(text));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
});

/* ── new-window → new Orbit tab ── */
app.on('web-contents-created', (_e, c) => {
  if (c.getType() === 'webview') {
    c.setWindowOpenHandler(({ url }) => {
      win.webContents.send('open-url', url);
      return { action: 'deny' };
    });
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
