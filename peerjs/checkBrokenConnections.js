const DEFAULT_CHECK_INTERVAL = 300

class CheckBrokenConnections {
    constructor(realm, options) {
        this.checkInterval = DEFAULT_CHECK_INTERVAL;
        this.timeoutId = null;
        this.realm = realm;
        this.config = options;
    }

    start() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            this.checkConnections();

            this.timeoutId = null;

            this.start();
        }, this.checkInterval);
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    checkConnections() {
        const clientsIds = this.realm.getClientsIds();

        const now = new Date().getTime();
        const { alive_timeout: aliveTimeout } = this.config;

        for (const clientId of clientsIds) {
            const client = this.realm.getClientById(clientId);

            if (!client) continue;

            const timeSinceLastPing = now - client.getlastPing();

            if (timeSinceLastPing < aliveTimeout) continue;

            // TODO: Maybe just set the client as offline ?
            try {
                console.log("Closing connection:", clientId);
                client.getSocket()?.close();
            } finally {
                this.realm.clearMessageQueue(clientId);
                this.realm.removeClientById(clientId);

                client.setSocket(null);

                this.onClose?.(client);
            }
        }
    }
}

export default CheckBrokenConnections;