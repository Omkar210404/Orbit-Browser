// personas.js — all persona definitions for Orbit
// Each persona: id, name, emoji, desc, theme (CSS vars), tabLayout,
// shortcuts, widgets, aiPersona (systemPrompt + chips)

const PERSONAS = [
  {
    id: 'developer',
    name: 'Developer',
    emoji: '💻',
    desc: 'Dark terminal vibes, keyboard-first.',
    theme: {
      bg: '#09110a',
      panel: '#101e12',
      line: '#1f3d24',
      text: '#e6ffe8',
      mute: '#74af7a',
      acc: '#00ff88',
      font: '"JetBrains Mono", "Cascadia Code", monospace',
      glow1: '#00ff8833',
      glow2: '#00aa5522',
      titleBar: '#101e12',
      titleSym: '#00ff88',
    },
    tabLayout: 'sidebar',
    shortcuts: [
      { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
      { name: 'MDN', icon: '📖', url: 'https://developer.mozilla.org' },
      { name: 'Stack Overflow', icon: '🔥', url: 'https://stackoverflow.com' },
      { name: 'npm', icon: '📦', url: 'https://npmjs.com' },
      { name: 'CodePen', icon: '✏️', url: 'https://codepen.io' },
      { name: 'Vercel', icon: '▲', url: 'https://vercel.com' },
    ],
    widgets: ['clock', 'notes'],
    aiPersona: {
      systemPrompt: 'You are a senior software engineer assistant. Help with code, debugging, architecture, and developer tools. Be concise and technical. Format code with markdown.',
      chips: ['Explain this code', 'Debug this error', 'Best practices for…'],
    },
  },
  {
    id: 'student',
    name: 'Student',
    emoji: '📚',
    desc: 'Calm, focused, distraction-free.',
    theme: {
      bg: '#f8f5ee',
      panel: '#eae3d2',
      line: '#d2c6ac',
      text: '#1f1c16',
      mute: '#6e6450',
      acc: '#3b69d9',
      font: '"Georgia", "Palatino", serif',
      glow1: '#3b69d928',
      glow2: '#7ca0f820',
      titleBar: '#eae3d2',
      titleSym: '#1f1c16',
    },
    tabLayout: 'top',
    shortcuts: [
      { name: 'Khan Academy', icon: '🎓', url: 'https://khanacademy.org' },
      { name: 'Wikipedia', icon: '📕', url: 'https://wikipedia.org' },
      { name: 'Google Scholar', icon: '🔬', url: 'https://scholar.google.com' },
      { name: 'Notion', icon: '📝', url: 'https://notion.so' },
      { name: 'Wolfram Alpha', icon: '🧮', url: 'https://wolframalpha.com' },
      { name: 'Duolingo', icon: '🦜', url: 'https://duolingo.com' },
    ],
    widgets: ['clock', 'focus', 'notes'],
    aiPersona: {
      systemPrompt: 'You are a patient study tutor. Help understand concepts, make study notes, create flashcards, explain step-by-step, and quiz the user. Be encouraging and clear.',
      chips: ['Summarise this topic', 'Quiz me on this', 'Make study notes'],
    },
  },
  {
    id: 'gamer',
    name: 'Gamer',
    emoji: '🎮',
    desc: 'Neon glow, high energy, RGB everything.',
    theme: {
      bg: '#0d0519',
      panel: '#1a0c30',
      line: '#4c1e80',
      text: '#fbf5ff',
      mute: '#a878d6',
      acc: '#d926ff',
      font: '"Rajdhani", "Orbitron", system-ui, sans-serif',
      glow1: '#d926ff38',
      glow2: '#ff006625',
      titleBar: '#1a0c30',
      titleSym: '#d926ff',
    },
    tabLayout: 'cards',
    shortcuts: [
      { name: 'Steam', icon: '🎮', url: 'https://store.steampowered.com' },
      { name: 'Twitch', icon: '📺', url: 'https://twitch.tv' },
      { name: 'Discord', icon: '💬', url: 'https://discord.com' },
      { name: 'Reddit', icon: '🤖', url: 'https://reddit.com/r/gaming' },
      { name: 'IGN', icon: '🕹️', url: 'https://ign.com' },
      { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
    ],
    widgets: ['clock'],
    aiPersona: {
      systemPrompt: 'You are a gaming companion AI. Help with game guides, strategies, lore, recommendations, and gaming news. Be enthusiastic and use gaming terminology.',
      chips: ['Game recommendation', 'Help with this boss', 'What should I play?'],
    },
  },
  {
    id: 'creator',
    name: 'Creator',
    emoji: '🎨',
    desc: 'Warm tones, inspiration everywhere.',
    theme: {
      bg: '#170b04',
      panel: '#281408',
      line: '#562c12',
      text: '#fff4e6',
      mute: '#c48c5e',
      acc: '#ff7e29',
      font: '"Nunito", "Quicksand", system-ui, sans-serif',
      glow1: '#ff7e2938',
      glow2: '#ff3b0022',
      titleBar: '#281408',
      titleSym: '#ff7e29',
    },
    tabLayout: 'cards',
    shortcuts: [
      { name: 'Figma', icon: '✏️', url: 'https://figma.com' },
      { name: 'Behance', icon: '🎭', url: 'https://behance.net' },
      { name: 'Dribbble', icon: '🏀', url: 'https://dribbble.com' },
      { name: 'Pinterest', icon: '📌', url: 'https://pinterest.com' },
      { name: 'Canva', icon: '🖼️', url: 'https://canva.com' },
      { name: 'Instagram', icon: '📸', url: 'https://instagram.com' },
    ],
    widgets: ['clock', 'notes'],
    aiPersona: {
      systemPrompt: 'You are a creative collaborator. Help with design ideas, creative writing, brainstorming, colour palettes, project concepts, and artistic feedback. Be imaginative and inspiring.',
      chips: ['Brainstorm ideas', 'Colour palette for…', 'Give me feedback on…'],
    },
  },
  {
    id: 'business',
    name: 'Business',
    emoji: '💼',
    desc: 'Professional, clean, navy precision.',
    theme: {
      bg: '#070e1c',
      panel: '#0e1b36',
      line: '#1f3868',
      text: '#edf4ff',
      mute: '#7d9ec9',
      acc: '#388bfd',
      font: '"Inter", "Segoe UI", system-ui, sans-serif',
      glow1: '#388bfd30',
      glow2: '#0055ff18',
      titleBar: '#0e1b36',
      titleSym: '#388bfd',
    },
    tabLayout: 'top',
    shortcuts: [
      { name: 'Gmail', icon: '✉️', url: 'https://mail.google.com' },
      { name: 'Calendar', icon: '📅', url: 'https://calendar.google.com' },
      { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com' },
      { name: 'Slack', icon: '💬', url: 'https://slack.com' },
      { name: 'Drive', icon: '🗂️', url: 'https://drive.google.com' },
      { name: 'Notion', icon: '📋', url: 'https://notion.so' },
    ],
    widgets: ['clock', 'focus'],
    aiPersona: {
      systemPrompt: 'You are a professional business assistant. Help with emails, meeting summaries, reports, strategic thinking, and productivity. Be concise, professional, and action-oriented.',
      chips: ['Draft this email', 'Summarise key points', 'Create action items'],
    },
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    emoji: '🎬',
    desc: 'Bold red and black cinema energy.',
    theme: {
      bg: '#120305',
      panel: '#22080c',
      line: '#4e131b',
      text: '#fff0f2',
      mute: '#c66775',
      acc: '#ff2849',
      font: '"Montserrat", system-ui, sans-serif',
      glow1: '#ff284938',
      glow2: '#ff770020',
      titleBar: '#22080c',
      titleSym: '#ff2849',
    },
    tabLayout: 'sidebar',
    shortcuts: [
      { name: 'Netflix', icon: '🎬', url: 'https://netflix.com' },
      { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
      { name: 'Spotify', icon: '🎵', url: 'https://spotify.com' },
      { name: 'Disney+', icon: '✨', url: 'https://disneyplus.com' },
      { name: 'Reddit', icon: '🤖', url: 'https://reddit.com' },
      { name: 'IMDb', icon: '🌟', url: 'https://imdb.com' },
    ],
    widgets: ['clock'],
    aiPersona: {
      systemPrompt: 'You are an entertainment guide. Help find movies, music, shows, and content. Give recommendations, reviews, and trivia. Be fun, enthusiastic, and knowledgeable.',
      chips: ['Recommend a movie', 'What to watch tonight?', 'Music like this…'],
    },
  },
];

// Merge up to 3 personas: take the first's theme/layout, merge shortcuts+widgets
function mergePersonas(ids) {
  const allList = (typeof window !== 'undefined' && window.PERSONAS) ? window.PERSONAS : PERSONAS;
  const selected = ids.map(id => allList.find(p => p.id === id)).filter(Boolean);
  if (!selected.length) return null;
  const primary = selected[0];
  // Merge shortcuts (deduplicate by url)
  const seenUrls = new Set();
  const shortcuts = [];
  for (const p of selected) {
    for (const s of (p.shortcuts || [])) {
      if (!seenUrls.has(s.url)) { seenUrls.add(s.url); shortcuts.push(s); }
    }
  }
  // Merge widgets (deduplicate)
  const widgets = [...new Set(selected.flatMap(p => p.widgets || []))];
  return { ...primary, shortcuts, widgets };
}

if (typeof window !== 'undefined') {
  window.PERSONAS = PERSONAS;
  window.mergePersonas = mergePersonas;
}
if (typeof module !== 'undefined') module.exports = { PERSONAS, mergePersonas };
