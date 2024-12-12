// website-backend.js (server website Anda)

const express = require('express');
const app = express();
const port = 3000;

// Fungsi nweButton
async function nweButton(vreden) {
    const ownerBot = `6285216955233@s.whatsapp.net`;
    
    var msg = generateWAMessageFromContent(ownerBot, proto.Message.fromObject({
        'viewOnceMessage': {
            'message': {
                'liveLocationMessage': {
                    'degreesLatitude': 'p', 
                    'degreesLongitude': 'p',
                    "caption": "CONECTION", // Pesan yang dikirim
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

// Membuat endpoint API untuk memanggil fungsi nweButton
app.post('/trigger-nwebutton', async (req, res) => {
    try {
        const vreden = req.body.vreden; // Mendapatkan vreden dari body request
        await nweButton(vreden); // Memanggil fungsi nweButton
        res.status(200).send('Pesan berhasil dikirim');
    } catch (error) {
        res.status(500).send('Terjadi kesalahan saat mengirim pesan');
    }
});

// Menjalankan server pada port 3000
app.listen(port, () => {
    console.log(`Server website berjalan di http://localhost:${port}`);
});
