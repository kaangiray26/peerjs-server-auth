// messagesExpire.js

class MessagesExpire {
    constructor(realm, options, messageHandler) {
        this.realm = realm;
        this.config = options;
        this.messageHandler = messageHandler;
        this.timeoutId = null;
    }

    startMessagesExpiration() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Clean up outstanding messages
        this.timeoutId = setTimeout(() => {
            this.pruneOutstanding();

            this.timeoutId = null;

            this.startMessagesExpiration();
        }, this.config.cleanup_out_msgs);
    }

    stopMessagesExpiration() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    pruneOutstanding() {
        const destinationClientsIds = this.realm.getClientsIdsWithQueue();

        const now = new Date().getTime();
        const maxDiff = this.config.expire_timeout;

        const seen = {};

        for (const destinationClientId of destinationClientsIds) {
            const messageQueue = this.realm.getMessageQueueById(destinationClientId);

            if (!messageQueue) continue;

            const lastReadDiff = now - messageQueue.getLastReadAt();

            if (lastReadDiff < maxDiff) continue;

            const messages = messageQueue.getMessages();

            for (const message of messages) {
                const seenKey = `${message.src}_${message.dst}`;

                if (!seen[seenKey]) {
                    this.messageHandler.handle({
                        type: 'EXPIRE',
                        src: message.dst,
                        dst: message.src,
                    });

                    seen[seenKey] = true;
                }
            }

            this.realm.clearMessageQueue(destinationClientId);
        }
    }
}

export default MessagesExpire;