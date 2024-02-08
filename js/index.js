// index.js

import express from 'express';
import cors from 'cors';
import Push from './push.js';

// Express
const app = express();

// Init Push on server start
const push = new Push();

// Middleware
app.use(cors({ origin: true, credentials: true, }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.status(200).send("Messenger-Push Server is running");
})

app.post("/send", push.send)
app.post("/register", push.register)

// Export
export default app;