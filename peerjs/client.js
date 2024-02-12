// client.js

class Client {
    constructor(id, token) {
        this.id = id;
        this.token = token;
        this.socket = null;
        this.lastPing = new Date().getTime();
    }

    getId() {
        return this.id;
    }

    getToken() {
        return this.token;
    }

    getSocket() {
        return this.socket;
    }

    setSocket(socket) {
        this.socket = socket;
    }

    getlastPing() {
        return this.lastPing;
    }

    setLastPing(lastPing) {
        this.lastPing = lastPing;
    }
}

export default Client;