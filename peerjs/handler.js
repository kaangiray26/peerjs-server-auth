//handler.js

function handleHeartbeat(message, realm) {
    const nowTime = new Date().getTime();
    realm.getClientById(message.src).setLastPing(nowTime);
}

function handleTransmission(message, realm) {
    const { type, src, dst } = message;
    const destinationClient = realm.getClientById(dst);

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
                realm.removeClientById(dst);
            }

            handleTransmission({
                type: 'LEAVE',
                src: dst,
                dst: src
            }, realm)
        }
    } else {
        const ignoredTypes = ['LEAVE', 'EXPIRE'];

        if (!ignoredTypes.includes(type) && dst) {
            realm.addMessageToQueue(dst, message);
        } else if (type === 'LEAVE' && !dst) {
            realm.removeClientById(src);
        } else {
            // Unavailable destination specified with message LEAVE or EXPIRE
            // Ignore
        }
    }
}

async function message_handler(message, realm) {
    console.log("Message:", message.type);
    // Switch on the message type

    switch (message.type) {
        // HEARTBEAT
        case 'HEARTBEAT':
            handleHeartbeat(message, realm);
            break;
        // OFFER
        case 'OFFER':
            handleTransmission(message, realm);
            break;
        // ANSWER
        case 'ANSWER':
            handleTransmission(message, realm);
            break;
        // CANDIDATE
        case 'CANDIDATE':
            handleTransmission(message, realm);
            break;
        // LEAVE
        case 'LEAVE':
            handleTransmission(message, realm);
            break;
        // EXPIRE
        case 'EXPIRE':
            handleTransmission(message, realm);
            break;
        default:
            break;
    }
}

export default {
    message_handler
}