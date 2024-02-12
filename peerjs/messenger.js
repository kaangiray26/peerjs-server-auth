// messenger.js

import { WebSocketServer } from 'ws';
import db from './db.js';
import handler from './handler.js';
import Client from './client.js';
import Realm from './realm.js';

const realm = new Realm();

const wss = new WebSocketServer({
    host: '0.0.0.0',
    port: 3000,
    path: '/peerjs'
});

wss.on('connection', async (ws, req) => {
    // Get the id, token, and key from the URL
    const { searchParams } = new URL(req.url, 'http://localhost:3000');
    const { id, token, key } = Object.fromEntries(searchParams.entries());
    if (!id || !token || !key) {
        ws.close();
        return;
    }

    // Register the peer
    const response = await db.register_peer(id, token);
    if (!response) {
        ws.close();
        return;
    }

    // Create new client
    console.log("New connection:", id);
    const newClient = new Client(id, token);
    newClient.setSocket(ws);
    realm.setClient(newClient, id);

    // Send open message
    ws.send(JSON.stringify({
        type: 'OPEN'
    }));

    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        message.src = id;
        handler.message_handler(message, realm);
    });

    ws.on('close', () => {
        console.log("Connection closed:", id);
        realm.removeClientById(id);
    })

    ws.on('error', console.error);
});

// On listening
wss.on('listening', async () => {
    // Setup the database
    await db.init();
    console.log(`Messenger-Push server started on  ${wss.options.host}:${wss.options.port}${wss.options.path}`);
});