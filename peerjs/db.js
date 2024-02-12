// db.js
import pgPromise from 'pg-promise';

const pgp = pgPromise();

const db = pgp({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

async function init() {
    console.log("Initializing database...");
    db.task(async t => {
        // Create tables if they don't exist
        await t.none("CREATE TABLE IF NOT EXISTS peers (secret TEXT PRIMARY KEY, token TEXT)");
        await t.none("CREATE TABLE IF NOT EXISTS notification (secret TEXT PRIMARY KEY, notification_key TEXT)");
    })
}

async function register(secret, token) {
    // Save token and secret
    const response = await db.one("INSERT INTO notification (secret, notification_key) VALUES ($1, $2) ON CONFLICT (secret) DO UPDATE SET notification_key = $2 RETURNING notification_key", [secret, token]);
    if (!response) {
        return null;
    }
    return response;
}

async function register_peer(id, token) {
    // Check if id exists in the database
    const response = await db.oneOrNone("SELECT * FROM peers WHERE secret = $1", [id]);
    if (!response) {
        await db.none("INSERT INTO peers (secret, token) VALUES ($1, $2)", [id, token]);
        return true;
    }

    // Check if token is the same
    if (response.token === token) {
        return true;
    }

    // Not authorized
    return false;
}

async function get_notification_key(secret) {
    const response = await db.oneOrNone("SELECT notification_key FROM notification WHERE secret = $1", [secret]);
    if (!response) {
        return null;
    }
    return response.notification_key;
}

export default {
    init,
    register,
    register_peer,
    get_notification_key,
}