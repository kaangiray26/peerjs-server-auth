// server.js

import app from './js/index.js';
import db from './js/db.js';

// Start server
console.log("\x1b[32m%s\x1b[0m", "..: Starting messenger-push server :..");
app.listen(3000, '0.0.0.0', async () => {
    await db.init();
    console.log("\x1b[32m%s\x1b[0m", `..: Server:    http://0.0.0.0:3000/ :..`);
});