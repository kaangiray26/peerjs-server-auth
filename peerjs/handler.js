//handler.js

async function message_handler(ws, data) {
    const message = JSON.parse(data.toString());

    // Switch on the message type
    switch (message.type) {
        case 'HEARTBEAT':
            const nowTime = new Date().getTime();
            ws.client.setLastPing(nowTime);
            break;
        case 'OFFER':
            //
            break;
        case 'ANSWER':
            //
            break;
        case 'CANDIDATE':
            //
            break;
        case 'LEAVE':
            //
            break;
        case 'EXPIRE':
            //
            break;
        default:
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Unknown message type'
            }));
            break;
    }
}

export default {
    message_handler
}