# StreamPlay — Instant StreamTape Video Player

> A fast, private, zero-ad web player for StreamTape links. Paste a URL and watch instantly — no signup, no tracking, no clutter.

[![Famst Agency](https://img.shields.io/badge/Built%20by-Famst%20Agency-0066ff)](https://famstagency.com/)
[![License](https://img.shields.io/badge/License-Do%20Whatever%20You%20Want-success)](LICENSE)

---

## What is StreamPlay?

StreamPlay is a lightweight open-source video player built for StreamTape links. It extracts the direct stream from a StreamTape URL and plays it in a clean, modern, responsive interface with dark/light mode, keyboard controls, picture-in-picture, playback speed, volume controls, and more.

This project was developed by **[Famst Agency](https://famstagency.com/)** as a free tool for the community.

To use StreamPlay, simply clone the repository and run it locally (see instructions below).

---

## Features

- **Instant playback** — Paste a StreamTape URL and start watching immediately.
- **Privacy-focused** — No accounts, no tracking, no ads.
- **Clean UI** — Minimal, modern interface built with Tailwind CSS.
- **Dark & Light mode** — Auto-detects system preference and remembers your choice.
- **Keyboard shortcuts** — Play/pause, seek, volume, fullscreen (space, arrows, `M`, `F`, etc.).
- **Custom controls** — Play/pause, seek ±10s, progress bar, volume, mute, PiP, fullscreen.
- **Playback settings** — Speed control (0.5x to 2x), auto-play toggle.
- **Responsive** — Works on desktop, tablet, and mobile.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| Backend API | Node.js + `axios` |
| Design System | Material 3-inspired colors & components |

---

## Project Structure

```
streamtape2curl-master/
├── api/
│   └── extract.js          # Server function to extract direct StreamTape URL
├── nodejs/
│   └── streamtape.js       # Standalone Node.js reference implementation
├── html ui/                # UI mockups and design references
├── index.html              # Main player UI
├── about.html               # About / Famst Agency page
├── script.js                # Frontend logic
├── style.css                # Custom styles & animations
├── package.json              # Node dependencies
└── README.md                 # You are here
```

---

## How It Works

1. The user pastes a StreamTape video URL into the input field.
2. The frontend calls `/api/extract?url=...`.
3. The server function fetches the StreamTape page, parses the stream token, and builds the direct video URL.
4. The direct URL is returned as JSON and loaded into the HTML5 `<video>` player.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/famstagency/Streamplay.git
cd Streamplay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

For the frontend, you can open `index.html` directly in a browser, or serve it with any static server:

```bash
npx serve .
```

For the API, run your Node.js server (see `api/extract.js` and `nodejs/streamtape.js` for reference implementations) and point the frontend at your local endpoint.

---

## API Reference

### `GET /api/extract?url=<streamtape_url>`

Extracts the direct video stream from a StreamTape URL.

#### Response

```json
{
  "title": "My Video Title",
  "directURL": "https://.../video.mp4"
}
```

#### Error Response

```json
{
  "error": "Could not extract token from page."
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play / Pause |
| `←` Arrow | Seek back 5 seconds |
| `→` Arrow | Seek forward 5 seconds |
| `↑` Arrow | Increase volume |
| `↓` Arrow | Decrease volume |
| `M` | Mute / Unmute |
| `F` | Toggle fullscreen |
| `Esc` | Close settings panel |

---

## Screenshots

You can add screenshots from the `html ui/` folder or your deployed app here:

```markdown
![Home Screen](html ui/home_light_desktop/screenshot.png)
![Player Screen](html ui/video_player_dark_desktop/screenshot.png)
```

---

## About Famst Agency

**StreamPlay is developed and maintained by [Famst Agency](https://famstagency.com/).**

Famst Agency is a digital agency that helps startups, entrepreneurs, small businesses, and established organizations grow through:

- **Website Development** — Business, corporate, portfolio, landing pages, and custom web apps
- **E-Commerce Development** — Online stores, payment gateways, inventory management
- **Custom Software Development** — CRM, POS, ERP, booking systems, and tailor-made business software
- **Artificial Intelligence (AI) Solutions** — Chatbots, WhatsApp AI, workflow automation
- **SEO & Digital Presence** — Technical SEO, local SEO, Google Business Profile optimization
- **Developer Solutions** — API development, cloud apps, system optimization, technical consulting

Visit our official website to learn more: **[https://famstagency.com/](https://famstagency.com/)**

For project inquiries, consultations, or support, visit our **[Contact Us](https://famstagency.com/contact.php)** page.

---

## License

**This project is completely free.**

You are allowed to:

- Clone it
- Use it personally or commercially
- Modify it
- Sell it
- Redistribute it
- Do absolutely anything you want with it

No attribution is required, but we appreciate a shout-out to **[Famst Agency](https://famstagency.com/)** if you find it useful.

---

## Contributing

Contributions are welcome! Feel free to open issues or pull requests if you have improvements, bug fixes, or new features.

---

## Disclaimer

This tool is provided for educational and personal use. Users are responsible for complying with the terms of service of any third-party platforms they use. Famst Agency does not host or store any copyrighted content.

---

<p align="center">
  Made with ❤️ by <a href="https://famstagency.com/" target="_blank"><strong>Famst Agency</strong></a>
</p>
