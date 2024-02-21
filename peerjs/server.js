// messenger.js

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import db from './db.js';
import Client from './client.js';
import Realm from './realm.js';
import MessageHandler from './messageHandler.js';
import options from './config.js';

// Server
const server = createServer((req, res) => {
    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Max-Age', 2592000);

    if (req.method == 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle routes
    // Route: /
    if (req.method == "GET" && req.url == "/") {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            message: "PeerJS-Server-Auth is running!",
            version: process.env.version
        }))
        res.end()
        return
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.write("Not found")
    res.end()
    return
});

// Services
const realm = new Realm();
const messageHandler = new MessageHandler(realm);

// WebSockets
const wss = new WebSocketServer({
    server,
    path: options.path
})

wss.on('connection', async (ws, req) => {
    // Get the id, token, and key from the URL
    const { searchParams } = new URL(req.url, 'http://localhost:3000');
    const { id, token, key } = Object.fromEntries(searchParams.entries());
    if (!id || !token || !key) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'No id, token, or key supplied to websocket server'
        }))
        ws.close();
        return;
    }

    // Register the peer
    const response = await db.register_peer(id, token);
    if (!response) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Invalid token provided'
        }))
        ws.close();
        return;
    }

    // Create new client if it doesn't exist
    console.log("New connection:", id);
    const client = new Client(id, key);

    // Send open message
    ws.send(JSON.stringify({
        type: 'OPEN'
    }));

    // Event handlers
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        message.src = id;
        messageHandler.handle(message);
    });

    ws.on('close', () => {
        console.log("Connection closed:", id);
        client.close();
    })

    ws.on('error', console.error);

    // Attach socket to the client
    client.setSocket(ws);
    realm.setClient(client, id);
});

server.listen(options.port, options.host, async () => {
    // Setup the database
    await db.init();
    console.log(`PeerJS-Server-Auth started on  ${options.host}:${options.port}`);
})