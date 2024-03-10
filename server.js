const WebSocket = require('ws');
const express = require('express');

const app = express();
const port = 3000;

const connections = new Map();
// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow the HTTP methods specified
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow additional headers
  next();
});

// Create HTTP server
const server = app.listen(port, () => {
  console.log(`HTTP server is running on http://localhost:${port}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    const data = JSON.parse(message)
    if (data.type === 'name') {
      // Save player's name
      connections.set(ws, data.content);
      sendConnectedPlayers();
    } else
    {
      wss.clients.forEach(player => {
      if (player !== ws) {
        player.send(JSON.stringify(data)); // Use send() method to send message
      }
    })}
  })

  ws.on('close', function close() {
    console.log('WebSocket connection closed');
    // Remove player's name from connections
    connections.delete(ws);
    sendConnectedPlayers();
  });
});

// Function to send list of connected players to all clients
function sendConnectedPlayers() {
  const players = Array.from(connections.values());
  const message = JSON.stringify({ type: 'connectedPlayers', data: players });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

