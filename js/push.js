// push.js
import db from './db.js';
import { JWT } from 'google-auth-library';

class Push {
    constructor() {
        this.access_token = null;
        this.endpoint = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_project_id}/`;

        // Bind methods
        this.send = this.send.bind(this);
    }

    async get_access_token() {
        console.log("Getting access token");
        const client = new JWT({
            email: process.env.FIREBASE_client_email,
            key: process.env.FIREBASE_private_key,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        const token = await client.authorize();
        this.access_token = token.access_token;
    }

    async register(req, res) {
        if (!['token', 'secret'].every(key => req.body.hasOwnProperty(key))) {
            res.status(400).send("Please provide token, secret parameters");
            return
        }

        const notification_key = await db.register(req.body.secret, req.body.token);
        if (!notification_key) {
            res.status(500).send("Failed to register for push notifications.");
            return
        }
        res.status(200).send("Successfully registered for push notifications.");
    }


    async send(req, res) {
        if (!['from', 'to', 'body'].every(key => req.body.hasOwnProperty(key))) {
            res.status(400).send("Please provide from, to, and body parameters");
            return
        }

        const { from, to, body } = req.body;

        // Check if access token is expired
        if (!this.access_token) {
            await this.get_access_token();
        }

        // Get notification_key
        const notification_key = await db.get_notification_key(to);
        if (!notification_key) {
            res.status(404).send("User is not registered for push notifications.");
            return
        }

        // Send message
        const response = await fetch(this.endpoint + "messages:send", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.access_token}`
            },
            body: JSON.stringify({
                message: {
                    token: notification_key,
                    notification: {
                        body: body,
                        title: from,
                    }
                }
            })
        })
            .then(response => response.json())

        // Handle response
        console.log(response);
    }
}

export default Push