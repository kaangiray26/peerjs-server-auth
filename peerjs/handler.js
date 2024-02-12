//handler.js

function handleHeartbeat(message, realm) {
    const nowTime = new Date().getTime();
    realm.getClientById(message.src).setLastPing(nowTime);
}

function handleTransmission(message, realm) {
    const { type, src, dst } = message;
    const destinationClient = realm.getClientById(dst);

    if (destinationClient) {
        const socket = destinationClient.getSocket();
        const data = JSON.stringify(message);
        socket.send(data);
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