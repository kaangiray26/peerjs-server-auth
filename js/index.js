// index.js

import express from 'express';
import { ExpressPeerServer } from 'peer';
import cors from 'cors';
import Push from './push.js';

// Express
const app = express();

// PeerJS
const peerServer = ExpressPeerServer(app, {
    path: '/',
    corsOptions: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

peerServer.on('connection', (client) => {
    console.log('Client connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
    console.log('Client disconnected:', client.getId());
});

// Init Push on server start
const push = new Push();

// Middleware
app.use(cors({ origin: true, credentials: true, }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/peerjs', peerServer);

// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Messenger-Push Server is running!" });
})

app.post("/send", push.send)
app.post("/register", push.register)

// Export
export default app;