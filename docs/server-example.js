/**
 * CipherChat — Optional WebSocket Relay Server
 *
 * This server NEVER sees plaintext messages.
 * It only relays encrypted blobs between clients in the same room.
 *
 * Requirements: Node.js 16+
 * Install: npm install ws
 * Run:     node docs/server-example.js
 *
 * Then update src/chat.js to use WebSocket instead of BroadcastChannel.
 */

const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Map of roomCode -> Set of WebSocket clients
const rooms = new Map();

wss.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Client joins a room
    if (msg.type === "join") {
      currentRoom = msg.room;
      if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Set());
      rooms.get(currentRoom).add(ws);
      return;
    }

    // Relay any message to all other clients in the same room
    if (currentRoom && rooms.has(currentRoom)) {
      for (const client of rooms.get(currentRoom)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      }
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

console.log(`CipherChat relay server running on ws://localhost:${PORT}`);
console.log("This server never sees plaintext — it only relays encrypted blobs.");
