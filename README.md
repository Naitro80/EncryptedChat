# 🔐 CipherChat

> A lightweight, end-to-end encrypted chat application that runs entirely in the browser. No accounts, no servers, no logs — just you and your room code.

![CipherChat Screenshot](docs/screenshot.png)

## ✨ Features

- **AES-256-GCM encryption** — Messages are encrypted using the Web Crypto API before being sent. The room code is the encryption key.
- **PBKDF2 key derivation** — The room code is hardened into a 256-bit key using 100,000 PBKDF2 iterations.
- **No accounts needed** — Just pick a username and a room code.
- **No external dependencies** — Pure HTML, CSS, and JavaScript. No npm, no build step, no frameworks.
- **Open source & self-hostable** — Host it anywhere: GitHub Pages, Netlify, Vercel, or your own server.

---

## 🚀 Quick Start (Open Locally)

1. Download or clone this repo.
2. Open `index.html` in your browser.
3. Enter a username and a room code.
4. Share the room code with someone else — open another tab and join with the same code.

> **Note:** The default transport uses the browser's [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel), which only works between **tabs in the same browser on the same device**. To chat with people on other devices, see [Adding a Real Server](#adding-a-real-server) below.

---

## 🌍 Host on GitHub Pages (Free, Online, Public)

GitHub Pages will host this for free and give you a public URL like `https://yourusername.github.io/cipherchat/`.

1. Push this repo to GitHub (see [Upload to GitHub](#upload-to-github) below).
2. Go to your repository on GitHub.
3. Click **Settings** → scroll down to **Pages**.
4. Under **Branch**, select `main` and folder `/root`.
5. Click **Save**.
6. After a minute, your chat will be live at `https://yourusername.github.io/cipherchat/`.

---

## 📡 Adding a Real Server

The current transport (`BroadcastChannel`) is local-only. To make it work across devices, replace it with one of these options:

### Option A — Ably (Free tier, easiest)

1. Sign up at [ably.com](https://ably.com) — free tier includes 3M messages/month.
2. Get your API key from the Ably dashboard.
3. In `src/chat.js`, replace the `BroadcastChannel` section with the Ably SDK:

```js
// In your HTML, add:
// <script src="https://cdn.ably.com/lib/ably.min-1.js"></script>

const ably = new Ably.Realtime("YOUR_ABLY_API_KEY");
const ablyChannel = ably.channels.get(`cipherchat:${roomCode}`);

// Send:
ablyChannel.publish("msg", { type: "msg", data: encrypted });

// Receive:
ablyChannel.subscribe(msg => handleIncomingMessage({ data: msg.data }));
```

### Option B — Supabase Realtime (Free tier)

1. Sign up at [supabase.com](https://supabase.com).
2. Use their Realtime Broadcast feature to relay encrypted messages.
3. See [Supabase Realtime docs](https://supabase.com/docs/guides/realtime).

### Option C — Self-hosted WebSocket Server (Node.js)

A minimal Node.js relay server is included in `docs/server-example.js`. It never sees your messages in plaintext — it only relays the encrypted blobs.

---

## 🔒 Security Notes

- **The room code IS the encryption key.** Keep it secret. Share it over a secure channel (not the chat you're setting up).
- **Messages are not stored anywhere** by default. Once a tab is closed, those messages are gone.
- **The relay server (if added) never sees plaintext.** All encryption/decryption happens in the browser.
- **This is not a production security tool.** It is a learning project and demo. Do not use it to transmit sensitive information like passwords or financial data.

---

## 📁 Project Structure

```
cipherchat/
├── index.html          — Main app shell
├── src/
│   ├── style.css       — All styles
│   ├── crypto.js       — AES-256-GCM encryption module (Web Crypto API)
│   └── chat.js         — Chat logic, transport, UI
├── docs/
│   └── server-example.js — Optional Node.js WebSocket relay server
├── LICENSE             — MIT License
└── README.md           — This file
```

---

## 🤝 Contributing

Pull requests are welcome! Some ideas:
- Add WebSocket / Ably / Supabase transport
- Add file sharing (encrypt files too)
- Mobile app wrapper (Capacitor or PWA)
- Message expiry / ephemeral rooms
- Typing indicators

---

## 📄 License

MIT — do whatever you want with it. See [LICENSE](LICENSE).
