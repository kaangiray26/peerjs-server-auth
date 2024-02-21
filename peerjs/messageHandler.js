//messageHandler.js

class MessageHandler {
    constructor(realm) {
        this.realm = realm;
    }

    handleHeartbeat(message) {
        const nowTime = new Date().getTime();
        this.realm.getClientById(message.src).setLastPing(nowTime);
    }

    handleTransmission(message) {
        const { type, src, dst } = message;
        const destinationClient = this.realm.getClientById(dst);

        // Check if destinationClient is alive
        if (destinationClient && destinationClient.isAlive()) {
            const socket = destinationClient.getSocket();
            if (!socket) {
                throw new Error("Peer dead");
            }

            const data = JSON.stringify(message);
            socket.send(data);
            return
        }
    }

    handle(message) {
        // Switch on the message type
        switch (message.type) {
            // HEARTBEAT
            case 'HEARTBEAT':
                this.handleHeartbeat(message);
                break;
            // OFFER
            case 'OFFER':
                this.handleTransmission(message);
                break;
            // ANSWER
            case 'ANSWER':
                this.handleTransmission(message);
                break;
            // CANDIDATE
            case 'CANDIDATE':
                this.handleTransmission(message);
                break;
            // LEAVE
            case 'LEAVE':
                this.handleTransmission(message);
                break;
            // EXPIRE
            case 'EXPIRE':
                this.handleTransmission(message);
                break;
            default:
                break;
        }
    }
}

export default MessageHandler;