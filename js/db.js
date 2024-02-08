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
    db.task(async t => {
        // Create tables if they don't exist
        await t.none("CREATE TABLE IF NOT EXISTS notification (id SERIAL PRIMARY KEY, secret TEXT, notification_key TEXT);");
    })
}

export default {
    init
}