// preload.js — secure bridge between renderer and main process
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('orbit', {
  platform: process.platform,

  // Open URLs sent by webviews
  onOpenUrl: (cb) => ipcRenderer.on('open-url', (_e, url) => cb(url)),

  // Update Windows title bar overlay colours
  setTitleBar: (opts) => ipcRenderer.send('set-title-bar', opts),

  // AI: persistent API key (stored encrypted in safeStorage)
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey:  ()    => ipcRenderer.invoke('get-api-key'),

  // AI: proxy message call (keeps API key in main process only)
  askAI: (opts) => ipcRenderer.invoke('ask-ai', opts),

  // AI: generate a custom persona JSON from a free-text interest
  generatePersona: (interest) => ipcRenderer.invoke('generate-persona', interest),
});
