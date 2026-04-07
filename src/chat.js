/**
 * CipherChat — Chat Logic
 *
 * Transport: Uses BroadcastChannel API for real-time cross-tab communication
 * on the same origin. For a production deployment with users on different
 * devices, swap the BroadcastChannel transport for a WebSocket server or
 * a service like Ably/Pusher — see README.md for instructions.
 *
 * All messages are encrypted before being sent to the channel,
 * and decrypted on receipt using the room code as the key.
 */

(() => {
  // ---- State ----
  let username = "";
  let roomCode = "";
  let cryptoKey = null;
  let channel = null;
  let presenceInterval = null;
  const onlineUsers = new Map(); // username -> timestamp

  // ---- DOM References ----
  const screens = {
    landing: document.getElementById("screen-landing"),
    chat: document.getElementById("screen-chat"),
  };

  const els = {
    username: document.getElementById("input-username"),
    room: document.getElementById("input-room"),
    joinBtn: document.getElementById("btn-join"),
    randomRoom: document.getElementById("btn-random-room"),
    landingError: document.getElementById("landing-error"),

    displayRoom: document.getElementById("display-room"),
    displayUsername: document.getElementById("display-username"),
    topbarRoom: document.getElementById("topbar-room"),
    copyRoom: document.getElementById("btn-copy-room"),
    leaveBtn: document.getElementById("btn-leave"),
    usersList: document.getElementById("users-list"),
    connStatus: document.getElementById("connection-status"),

    messages: document.getElementById("messages"),
    msgInput: document.getElementById("input-message"),
    sendBtn: document.getElementById("btn-send"),
  };

  // ---- Utilities ----
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  function showError(msg) {
    els.landingError.textContent = msg;
    els.landingError.classList.remove("hidden");
  }

  function hideError() {
    els.landingError.classList.add("hidden");
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ---- Messages ----
  function appendMessage({ type, from, text, time }) {
    const area = els.messages;

    if (type === "system") {
      const div = document.createElement("div");
      div.className = "system-msg";
      div.textContent = text;
      area.appendChild(div);
    } else {
      const isOwn = from === username;
      const wrapper = document.createElement("div");
      wrapper.className = `message ${isOwn ? "own" : "other"}`;

      const meta = document.createElement("div");
      meta.className = "msg-meta";
      meta.textContent = isOwn ? `You · ${time}` : `${from} · ${time}`;

      const bubble = document.createElement("div");
      bubble.className = "msg-bubble";
      bubble.textContent = text;

      wrapper.appendChild(meta);
      wrapper.appendChild(bubble);
      area.appendChild(wrapper);
    }

    // Scroll to bottom
    area.scrollTop = area.scrollHeight;
  }

  // ---- Presence ----
  function broadcastPresence() {
    if (!channel) return;
    channel.postMessage({ type: "presence", from: username, ts: Date.now() });
  }

  function updateUsersList() {
    const now = Date.now();
    // Remove users not seen in the last 8 seconds
    for (const [user, ts] of onlineUsers.entries()) {
      if (now - ts > 8000) onlineUsers.delete(user);
    }
    els.usersList.innerHTML = "";
    // Always include self first
    const allUsers = [username, ...[...onlineUsers.keys()].filter(u => u !== username)];
    allUsers.forEach(u => {
      const div = document.createElement("div");
      div.className = "user-item";
      div.textContent = u === username ? `${u} (you)` : u;
      els.usersList.appendChild(div);
    });
  }

  // ---- Channel ----
  async function sendMessage(text) {
    if (!text.trim() || !cryptoKey || !channel) return;
    const payload = { from: username, text, time: formatTime(new Date()) };
    const plaintext = JSON.stringify(payload);
    const encrypted = await CipherCrypto.encrypt(plaintext, cryptoKey);
    channel.postMessage({ type: "msg", data: encrypted });
    // Show own message immediately (no round-trip needed)
    appendMessage({ type: "chat", ...payload });
  }

  async function handleIncomingMessage(event) {
    const msg = event.data;

    if (msg.type === "presence") {
      if (msg.from !== username) {
        const isNew = !onlineUsers.has(msg.from);
        onlineUsers.set(msg.from, msg.ts);
        updateUsersList();
        if (isNew) {
          appendMessage({ type: "system", text: `${msg.from} joined the room.` });
        }
      }
      return;
    }

    if (msg.type === "leave") {
      if (msg.from !== username) {
        onlineUsers.delete(msg.from);
        updateUsersList();
        appendMessage({ type: "system", text: `${msg.from} left the room.` });
      }
      return;
    }

    if (msg.type === "msg") {
      const decrypted = await CipherCrypto.decrypt(msg.data, cryptoKey);
      if (!decrypted) return; // Wrong room key, ignore
      const payload = JSON.parse(decrypted);
      if (payload.from === username) return; // Don't show own message twice
      appendMessage({ type: "chat", ...payload });
    }
  }

  // ---- Join / Leave ----
  async function joinRoom() {
    const uname = els.username.value.trim();
    const room = els.room.value.trim();
    hideError();

    if (!uname) return showError("Please enter a username.");
    if (uname.length < 2) return showError("Username must be at least 2 characters.");
    if (!room) return showError("Please enter a room code.");
    if (room.length < 3) return showError("Room code must be at least 3 characters.");

    username = uname;
    roomCode = room;

    // Derive encryption key from room code
    cryptoKey = await CipherCrypto.deriveKey(roomCode);

    // Create BroadcastChannel for this specific room
    channel = new BroadcastChannel(`cipherchat:${roomCode}`);
    channel.onmessage = handleIncomingMessage;

    // Update UI
    els.displayRoom.textContent = roomCode;
    els.displayUsername.textContent = username;
    els.topbarRoom.textContent = `# ${roomCode}`;
    updateUsersList();

    // Set connection status
    els.connStatus.textContent = "Connected (local)";
    els.connStatus.className = "conn-status connected";

    showScreen("chat");

    // Announce presence
    broadcastPresence();
    presenceInterval = setInterval(() => {
      broadcastPresence();
      updateUsersList();
    }, 3000);

    // Welcome message
    appendMessage({
      type: "system",
      text: `You joined room "${roomCode}". Share this code with others to chat. Remember: this demo uses BroadcastChannel — it only works between tabs in the same browser. See README for adding a real server.`
    });

    els.msgInput.focus();
  }

  function leaveRoom() {
    if (channel) {
      channel.postMessage({ type: "leave", from: username });
      channel.close();
      channel = null;
    }
    if (presenceInterval) {
      clearInterval(presenceInterval);
      presenceInterval = null;
    }
    cryptoKey = null;
    onlineUsers.clear();

    // Clear messages for next session
    els.messages.innerHTML = `
      <div class="system-msg welcome-msg">
        <span>Welcome to CipherChat. All messages are encrypted with AES-256-GCM using your room code as the key. Messages are never stored.</span>
      </div>`;

    showScreen("landing");
  }

  // ---- Event Listeners ----
  els.joinBtn.addEventListener("click", joinRoom);

  els.username.addEventListener("keydown", e => {
    if (e.key === "Enter") els.room.focus();
  });
  els.room.addEventListener("keydown", e => {
    if (e.key === "Enter") joinRoom();
  });

  els.randomRoom.addEventListener("click", () => {
    els.room.value = generateRoomCode();
  });

  els.sendBtn.addEventListener("click", () => {
    sendMessage(els.msgInput.value);
    els.msgInput.value = "";
  });

  els.msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(els.msgInput.value);
      els.msgInput.value = "";
    }
  });

  els.leaveBtn.addEventListener("click", leaveRoom);

  els.copyRoom.addEventListener("click", () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      els.copyRoom.textContent = "Copied!";
      setTimeout(() => (els.copyRoom.textContent = "Copy"), 1500);
    });
  });

  // ---- Init ----
  showScreen("landing");
})();
