// server.js

import app from "./peerjs/messenger.js";

app.listen(3000, '::', () => {
    console.log('Server started on ::3000');
})