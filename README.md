# 🪐 Orbit Browser

Orbit is an adaptive, persona-driven browser built on Electron. Instead of a one-size-fits-all interface, Orbit adapts itself to how you work, play, and create — dynamically adjusting its theme, tab layout, start page widgets, and AI assistant.

---

## ✨ Features

### 1. 🎨 Dynamic Persona System
Orbit comes with 6 curated personas, each providing a unique layout, palette, start-page widgets, and AI behavior:
- **Developer 💻**: Terminal-inspired dark green aesthetics, vertical sidebar tabs, Dev shortcuts, code explanation AI assistant.
- **Student 📚**: Light, clean, distraction-free environment, horizontal top tabs, 25-minute Pomodoro focus timer, study buddy AI assistant.
- **Gamer 🎮**: Neon purple/magenta glow, elevated 3D card tabs, Discord/Twitch quick tiles, gaming companion AI assistant.
- **Creator 🎨**: Warm amber tones, 3D card tabs, design shortcuts, inspiration AI assistant.
- **Business 📈**: Professional navy styling, top tabs, productivity shortcuts, executive summary AI assistant.
- **Entertainment 🍿**: Cinematic dark red theme, vertical sidebar tabs, streaming shortcuts.
- **Custom / "Other" ✦**: Enter any custom interest (e.g. *Photography*, *Music Production*) and generate a personalized persona on the fly.

### 2. 🗂️ 3 Flexible Tab Layouts
- **Vertical Sidebar**: Collapsible icon-only mode with high-resolution brand icons and quick action footer.
- **Top Tab Bar**: Sleek horizontal tabs with smooth transitions.
- **3D Card Tabs**: Elevated 3D cards with real app favicons, active card lift, and ambient accent glow.

### 3. 🌐 Real App Favicons & Logos
- Automatically fetches and displays real high-res brand icons for visited web apps (YouTube, Discord, GitHub, Reddit, Spotify, etc.) across tabs, cards, 3D switcher, and Start Page shortcut tiles.
- Graceful fallbacks for local and offline navigation.

### 4. ⬡ 3D Tab Switcher (Carousel)
- Press `Ctrl + Tab` or click `⬡` to launch an interactive 3D perspective carousel.
- Navigate with Arrow Keys, select with `Enter`, or exit with `Escape`.

### 5. ✦ Integrated Orbit AI Assistant
- Context-aware sidebar assistant with suggestion chips tailored to your active persona.
- Secure key storage with Electron `safeStorage`.

### 6. ⏱️ Start Page & Widgets
- Dynamic greeting and active persona badge.
- Interactive widgets per persona: Real-time clock & date, Pomodoro focus timer, and autosaving quick notes.
- Perspective 3D tilt effects and mouse parallax wallpaper glow.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + T` (`Cmd + T`) | Open a new tab |
| `Ctrl + W` (`Cmd + W`) | Close active tab |
| `Ctrl + Tab` | Open 3D Tab Switcher |
| `Ctrl + L` (`Cmd + L`) | Focus address bar |
| `Ctrl + R` (`Cmd + R`) | Reload active tab |
| `Alt + Left` | Back |
| `Alt + Right` | Forward |
| `Escape` | Close Onboarding or Tab Switcher |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd orbit

# Install dependencies
npm install

# Run Orbit
npm start
```

---

## 🛠️ Tech Stack
- **Framework**: Electron
- **Frontend**: Vanilla HTML5, CSS3 (CSS Variables, 3D Transforms, Glassmorphism), Vanilla JavaScript
- **Security**: Context isolation enabled, strict Content Security Policy (CSP), API keys encrypted with Electron `safeStorage`.
