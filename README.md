# Everyone Happy — Balloon Sky (Prototype)

A lightweight interactive demo where people can **release a balloon** with a short wish, kindness, or gratitude into a **shared starry sky**. This prototype runs locally, needs **no build step**, and stores your balloons in **localStorage**.

> Design goal: simple, elegant, mystical; joyful to use in a minute.

## ✨ Features
- Starry sky with softly **glowing, drifting balloons**
- **Release a Balloon** modal with color picker + message (120 chars)
- **Hover a balloon** to see its message
- **Local persistence** via `localStorage`
- Zero dependencies, works by just opening `index.html`

## 🚀 Run
- **Option A:** Double‑click `index.html` to open in your browser.
- **Option B (recommended):** Serve locally to avoid file‑URL restrictions:
  ```bash
  # using Python
  python3 -m http.server 5500
  # then visit http://localhost:5500
  ```

## 🧭 Next Steps (Roadmap)
- **Real‑time shared sky** using Firebase/Supabase (public read, moderated write)
- **Global map view** (balloons appear from user locations, if permitted)
- **Share links** to invite friends into your balloon chain
- **Accessibility**: captions, reduced motion mode, keyboard focus hints
- **Themes**: daylight mode, festival mode, luxury gold mode

## 🗂 Structure
```
/everyone-happy-sky
  index.html
  /css/styles.css
  /js/app.js
  /assets  # (placeholder)
```

## 📝 License
MIT — use freely for joy campaigns. If you publish, a small credit like “Everyone Happy — Balloon Sky” would be lovely.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=henrygambles/everyone-happy-sky-local&type=Date)](https://star-history.com/#henrygambles/everyone-happy-sky-local&Date)
