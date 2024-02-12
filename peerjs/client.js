// client.js

class Client {
    constructor(id, token) {
        this.id = id;
        this.token = token;
        this.lastPing = new Date().getTime();
    }
    getlastPing() {
        return this.lastPing;
    }
    setLastPing(lastPing) {
        this.lastPing = lastPing;
    }
}

export default Client;