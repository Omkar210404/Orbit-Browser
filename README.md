# 🪐 Orbit Browser

> **An adaptive, persona-driven Electron browser that morphs its theme, 3D tab layouts, start page, widgets, and AI assistant to your interests.**

[![GitHub Pages](https://img.shields.io/badge/Live%20Showcase-GitHub%20Pages-ff007f?style=for-the-badge)](https://omkar210404.github.io/Orbit-Browser/)
[![Electron](https://img.shields.io/badge/Electron-33.0+-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://electronjs.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)

---

## 🌟 Overview

Orbit is not a conventional browser. On launch, Orbit asks what you are into, and the entire browser seamlessly reshapes itself:

1. **Vibrant Persona System**: Palette, typography, glow effects, and title bar accents change with zero reload.
2. **3 Flexible Tab Layouts**: Switch dynamically between a collapsible vertical sidebar, a clean horizontal top bar, and elevated 3D cards.
3. **Real App Favicons & Brand Logos**: Real 64px brand logos for services like YouTube, Discord, GitHub, Reddit, and Spotify appear across tabs, shortcut tiles, and the 3D switcher.
4. **3D Tab Switcher**: Press `Ctrl + Tab` for a spatial carousel with perspective tilt and keyboard navigation.
5. **Context-Aware AI Sidebar**: Integrated Gemini assistant that adapts its persona, system prompt, and suggestion chips to your active focus.
6. **Productivity Start Page**: Time-of-day greetings, auto-tilted shortcuts, Pomodoro focus timer, live clock, and autosaving quick notes.

---

## 🎨 Built-In Personas

| Persona | Layout | Aesthetics & Theme | Start Page Shortcuts & Widgets | AI Role |
| :--- | :--- | :--- | :--- | :--- |
| **💻 Developer** | **Vertical Sidebar** | Dark green terminal, monospace, neon `#00ff88` | GitHub, MDN, Stack Overflow, Vercel · Clock + Notes | Senior Software Engineer |
| **📚 Student** | **Horizontal Top** | Clean, distraction-free daylight, blue `#0066cc` | Wikipedia, Google Scholar, Khan Academy · Clock + 25m Focus Timer + Notes | Academic Study Guide |
| **🎮 Gamer** | **3D Cards** | Cyberpunk dark purple & hot pink `#ff007f` | Twitch, Discord, Steam, IGN · Clock + Notes | Gaming Companion |
| **🎨 Creator** | **3D Cards** | Studio warm amber & burnt orange `#ff9900` | Unsplash, Pinterest, Behance, Dribbble · Clock + Notes | Creative Director |
| **📈 Business** | **Horizontal Top** | Executive navy & cyan `#00bfff` | LinkedIn, Google Calendar, Notion · Clock + Notes | Executive Analyst |
| **🍿 Entertainment** | **Vertical Sidebar** | Cinematic dark red & ruby `#ff2d55` | Netflix, YouTube, Spotify, Reddit · Clock + Notes | Entertainment Guide |
| **✦ Custom / Other** | **Adaptive** | Dynamically generated colors & shortcuts for any interest (e.g. *Coding*, *Photography*, *Crypto*) | Tailored shortcuts and procedural palette | Bespoke Domain Expert |

---

## 🔑 Setting Up Your Google Gemini API Key

Orbit uses the Google Gemini API to power its AI sidebar assistant and generate bespoke custom personas. Keys are encrypted securely on your device using Electron's native **`safeStorage`** API and are never exposed to web pages.

### Step 1: Get a Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"** and copy your key (it starts with `AIzaSy...`).

### Step 2: Add the Key in Orbit
1. Launch Orbit and click the **`✦`** button in the top right to open the AI Sidebar.
2. Click the **`🔑 API Key`** button in the sidebar header.
3. Paste your API key into the input field and click **Save** (or hit `Enter`).
4. You will see a `✓ Key saved securely!` confirmation. All suggestion chips and AI chats are now live!

> **Security Note:** Your key is stored in your operating system's credential vault via Electron `safeStorage`. The renderer process and webviews cannot read the key.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + T` (`Cmd + T`) | Open a new tab |
| `Ctrl + W` (`Cmd + W`) | Close active tab |
| `Ctrl + Tab` | Open interactive 3D Tab Switcher (Carousel) |
| `Ctrl + L` (`Cmd + L`) | Focus address bar and select URL |
| `Ctrl + R` (`Cmd + R`) | Reload current page (or refresh start widgets) |
| `Alt + ←` | Back (smoothly returns to Orbit Start page if at history start) |
| `Alt + →` | Forward |
| `Escape` | Close Onboarding modal, 3D Tab Switcher, or AI Sidebar |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or LTS recommended)
* `git`

### Installation

```bash
# 1. Clone this repository
git clone https://github.com/Omkar210404/Orbit-Browser.git

# 2. Navigate into the project folder
cd Orbit-Browser

# 3. Install dependencies
npm install

# 4. Launch Orbit
npm start
```

---

## 🌐 Live GitHub Pages Demo

View the live project showcase and interactive persona preview at:
**[https://omkar210404.github.io/Orbit-Browser/](https://omkar210404.github.io/Orbit-Browser/)**

To host it from your repository:
1. Go to your repo on GitHub: **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Select branch: `main` and folder: `/docs`.
4. Click **Save**.

---

## 🏗️ Architecture & Tech Stack

* **Core Shell**: Electron 33 with Context Isolation and secure Preload Bridge.
* **UI & Rendering**: Modern Vanilla HTML5 & CSS3 with CSS Custom Properties, Glassmorphism, and hardware-accelerated 3D CSS transforms.
* **Icon Engine**: Google Favicon API high-resolution resolver with graceful SVG/ring fallback.
* **AI Engine**: Google Gemini API via secure IPC proxy in the Electron Main process.
* **Storage**: Persistent persona configurations in `localStorage` and encrypted credentials in Electron `safeStorage`.

---

## 📄 License

This project is licensed under the MIT License.
