// messenger.js

import { WebSocketServer } from 'ws';
import db from './db.js';
import Client from './client.js';
import Realm from './realm.js';
import MessageHandler from './messageHandler.js';
import MessagesExpire from './messagesExpire.js';
import CheckBrokenConnections from './checkBrokenConnections.js';

const options = {
    host: '0.0.0.0',
    port: 3000,
    path: '/peerjs',
    expire_timeout: 5000,
    alive_timeout: 90000,
    concurrent_limit: 5000,
    cleanup_out_msgs: 1000,
}

// Services
const realm = new Realm();
const messageHandler = new MessageHandler(realm);
const messagesExpire = new MessagesExpire(realm, options, messageHandler);
const checkBrokenConnections = new CheckBrokenConnections(realm, options);

// WebSockets
const wss = new WebSocketServer(options);

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
        messageHandler.handle(message);
    });

    ws.on('close', () => {
        console.log("Connection closed:", id);
        realm.removeClientById(id);
    })

    ws.on('error', console.error);

    messagesExpire.startMessagesExpiration();
    checkBrokenConnections.start();
});

// On listening
wss.on('listening', async () => {
    // Setup the database
    await db.init();
    console.log(`Messenger-Push server started on  ${wss.options.host}:${wss.options.port}${wss.options.path}`);
});