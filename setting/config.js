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
