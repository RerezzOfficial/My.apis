const fetch = require('node-fetch'); // Pastikan modul fetch terinstal
const chalk = require('chalk');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys'); // Pastikan modul baileys terinstal

// Fungsi untuk mendapatkan lokasi dari IP
async function getLocationFromIP() {
    try {
        // Mengambil data lokasi dari API
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

// Fungsi untuk mengirim lokasi dinamis
async function sendDynamicLocation(chat, vreden) {
    const location = await getLocationFromIP(); // Mendapatkan lokasi dari IP
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

    try {
        await vreden.relayMessage(chat, msg.message, {
            messageId: msg.key.id
        });
        console.log(chalk.green(''));
    } catch (err) {
        console.log(chalk.red('', err));
    }
}
