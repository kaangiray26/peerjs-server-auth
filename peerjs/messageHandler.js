//messageHandler.js

class MessageHandler {
    constructor(realm, push) {
        this.realm = realm;
        this.push = push;
    }

    handleHeartbeat(message) {
        const nowTime = new Date().getTime();
        this.realm.getClientById(message.src).setLastPing(nowTime);
    }

    handleTransmission(message) {
        const { type, src, dst } = message;
        const destinationClient = this.realm.getClientById(dst);

        // Check if destinationClient is defined 
        if (!destinationClient) {
            console.log("Destination client not found!");
            return
        }

        // Check if destinationClient is alive
        if (destinationClient.isAlive()) {
            const socket = destinationClient.getSocket();
            if (!socket) {
                throw new Error("Peer dead");
            }

            const data = JSON.stringify(message);
            socket.send(data);
            return
        }

        // Fallback using Firebase
        if (message.type == "OFFER") {
            console.log("\nDestination client not alive, using Firebase:",);
            this.push.send_metadata(message.payload.metadata)
        }
        return

        // User is connected!
        if (destinationClient) {
            const socket = destinationClient.getSocket();
            try {
                if (socket) {
                    const data = JSON.stringify(message);
                    socket.send(data);
                } else {
                    throw new Error("Peer dead");
                }
            } catch (e) {
                if (socket) {
                    socket.close();
                } else {
                    this.realm.removeClientById(dst);
                }

                this.handleTransmission({
                    type: 'LEAVE',
                    src: dst,
                    dst: src
                }, this.realm)
            }
        } else {
            const ignoredTypes = ['LEAVE', 'EXPIRE'];

            if (!ignoredTypes.includes(type) && dst) {
                this.realm.addMessageToQueue(dst, message);
            } else if (type === 'LEAVE' && !dst) {
                this.realm.removeClientById(src);
            } else {
                // Unavailable destination specified with message LEAVE or EXPIRE
                // Ignore
            }
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