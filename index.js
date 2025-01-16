
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const axios = require("axios");
const { search } = require('yt-search');
const puppeteer = require("puppeteer");
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const app = express();
const PORT = process.env.PORT || 5000;

app.enable("trust proxy");
app.set("json spaces", 2);
 
const {
  convertCRC16,
  generateTransactionId,
  generateExpirationTime,
  elxyzFile,
  generateQRIS,
  createQRIS,
  checkQRISStatus
} = require('./orkut.js') 

const {
 ChatGPTv2
} = require('./lib/function.js')

const { ytdl, downloadMp3, downloadMp4 } = require('./lib/scraper.js')
const validateYoutubeUrl = (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      error: "Isi parameter Url.",
    });
  }

  if (!youtubeRegex.test(url)) {
    return res.status(400).json({
      status: false,
      error: "URL YouTube tidak valid.",
    });
  }

  next();
};

async function fetchTextOnly(content, user, prompt, webSearchMode) {
    try {
        const payload = {
            content: content,
            user: user,
            prompt: prompt,
            webSearchMode: webSearchMode,
        };

        const response = await axios.post('https://lumin-ai.xyz/', payload);
        console.log(response.data);
        return response.data; 
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function getPinterestImages(text) {
  const url = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
  const params = {
    source_url: `/search/pins/?q=${text}`,
    data: JSON.stringify({
      options: {
        isPrefetch: false,
        query: text,
        scope: 'pins',
        no_fetch_context_on_resource: false
      },
      context: {}
    }),
    _: Date.now() 
  };

  try {
    const { data } = await axios.get(url, { params });
    const imageUrls = data.resource_response.data.results.map(v => v.images.orig.url);
    return imageUrls.splice(0, 6);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Log Info
const messages = {
  error: {
    status: 404,
    creator: "Rezz Devv",
    result: "Error, Service Unavailable",
  },
  notRes: {
    status: 404,
    creator: "Rezz Devv",
    result: "Error, Invalid JSON Result",
  },
  query: {
    status: 400,
    creator: "Rezz Devv",
    result: "Please input parameter query!",
  },
  amount: {
    status: 400,
    creator: "Rezz Devv",
    result: "Please input parameter amount!",
  },
  codeqr: {
    status: 400,
    creator: "Rezz Devv",
    result: "Please input parameter codeqr!",
  },
  url: {
    status: 400,
    creator: "Rezz Devv",
    result: "Please input parameter URL!",
  },
  notUrl: {
    status: 404,
    creator: "Rezz Devv",
    result: "Error, Invalid URL",
  },
};
function genreff() {
  const characters = '0123456789';
  const length = 5;
  let reffidgen = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reffidgen += characters[randomIndex];
  }
  return reffidgen;
}
app.use(cors());



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/style/styles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'style.css'));
});
app.get('/style/script', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'script.js'));
});
app.get('/style/style', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'fitur.css'));
});

app.get('/style/fitur', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'fitur.css'));
});

app.get('/style/sc', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'fitur.js'));
});

app.get('/style/scrip', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'fitur.js'));
});
app.get('/style/code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'code.css'));
});
app.get('/style/codejs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style', 'code.js'));
});
  

app.get('/doc/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});
app.get('/doc/okeconnec', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'okeconnect.html'));
});
app.get('/doc/anime', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anime.html'));
});

app.get('/doc/downloader', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'downloader.html'));
});

app.get('/doc/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/doc/funngame', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fun.html'));
});

app.get('/doc/sourcode', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});



app.get('/api/quotes/motivasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'media', 'galau.json'));
});

app.get('/api/quotes/galau', (req, res) => {
  res.sendFile(path.join(__dirname, 'media', 'galau.json'));
});

app.get('/api/pantun', (req, res) => {
  res.sendFile(path.join(__dirname, 'media', 'pantun.json'));
});
//=====[ API GAME ]=====//
app.get('/game/asahotak', (req, res) => {
  const filePath = path.join(__dirname, 'media', 'asahotak.json');
  console.log('File Path:', filePath); 
  res.sendFile(filePath);
});

async function generateProfileImage({ backgroundURL, avatarURL, name, level, rankName, rankId, exp, requireExp }) {
  const width = 850;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const background = await loadImage(backgroundURL);
  ctx.drawImage(background, 0, 0, width, height);

  // Overlay
  const overlayX = 20;
  const overlayY = 20;
  const overlayWidth = width - 40;
  const overlayHeight = height - 40;
  const overlayRadius = 30;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Gambar avatar
  const avatar = await loadImage(avatarURL);
  const avatarSize = 120;
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 40, height / 2 - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // Avatar border
  ctx.beginPath();
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#FFCC33';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(name, 180, height / 2 - 20);

  // Level dan rank
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`LEVEL ${level}`, width - 180, 80);

  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${rankName} ${rankId}`, width - 180, 120);

  // Progress bar
  const barWidth = 600;
  const barHeight = 30;
  const barX = 180;
  const barY = height / 2 + 20;
  const progress = exp / requireExp;
  const barRadius = 15;

  ctx.fillStyle = '#555555';
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFCC33';
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth * progress, barY, barX + barWidth * progress, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth * progress, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth * progress, barY, barRadius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#FFCC33';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
  ctx.closePath();
  ctx.stroke();

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${exp} / ${requireExp}`, barX + barWidth / 2, barY + barHeight - 5);

  return canvas.toBuffer();
}

// API endpoint
app.get('/generate-profile', async (req, res) => {
  const {
    backgroundURL,
    avatarURL,
    name,
    level,
    rankName,
    rankId,
    exp,
    requireExp,
  } = req.query;

  // Cek parameter yang dibutuhkan
  if (!backgroundURL || !avatarURL || !name || !level || !rankName || !rankId || !exp || !requireExp) {
    return res.status(400).json({ error: 'Parameter tidak lengkap' });
  }

  try {
    const imageBuffer = await generateProfileImage({
      backgroundURL,
      avatarURL,
      name,
      level,
      rankName,
      rankId,
      exp,
      requireExp,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghasilkan gambar' });
  }
});

app.get("/rank", async (req, res) => {
  const {
    background,
    profile,
    name,
    limit,
    currentExp,
    maxExp,
    level,
    balance,
    rankPhoto,
    rank,
  } = req.query;

  if (
    !background ||
    !profile ||
    !name ||
    !limit ||
    !currentExp ||
    !maxExp ||
    !level ||
    !balance ||
    !rankPhoto ||
    !rank
  ) {
    return res.status(400).json({ error: "Parameter tidak lengkap." });
  }

  try {
    const backgroundImage = await axios.get(background, { responseType: "arraybuffer" });
    const profileImage = await axios.get(profile, { responseType: "arraybuffer" });
    const rankImage = await axios.get(rankPhoto, { responseType: "arraybuffer" });

    const backgroundBuffer = Buffer.from(backgroundImage.data);
    const profileBuffer = Buffer.from(profileImage.data);
    const rankBuffer = Buffer.from(rankImage.data);

    const canvasWidth = 850;
    const canvasHeight = 300;

    const config = {
      profile: { size: 120, top: 90, left: 40 },
      progressBar: { width: 450, height: 20, top: 180, left: 170 },
      nameAndID: { top: 10, left: 0 },
      levelAndBalance: { top: 0, left: 0 },
      rank: {
        iconSize: 80,
        textSize: 15,
        top: 50,
        left: 700,
        textOffset: 30, // Ikon rank + jarak 7px untuk teks
        textColor: "white",
      },
      margin: 30, // Menambahkan margin untuk memastikan bingkai tidak terlalu dekat
    };

    // Resize background image
    const resizedBackground = await sharp(backgroundBuffer)
      .resize(canvasWidth, canvasHeight)
      .png()
      .toBuffer();

    // Resize profile image
    const profileCircle = await sharp(profileBuffer)
      .resize(config.profile.size, config.profile.size)
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg">
              <circle cx="${config.profile.size / 2}" cy="${config.profile.size / 2}" r="${config.profile.size / 2}" fill="white"/>
            </svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    // Resize rank image
    const resizedRankIcon = await sharp(rankBuffer)
      .resize(config.rank.iconSize, config.rank.iconSize)
      .png()
      .toBuffer();

    // Resize progress bar image
    const expProgress = (parseInt(currentExp) / parseInt(maxExp)) * config.progressBar.width;
    const progressBarSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${config.progressBar.width}" height="${config.progressBar.height}">
        <rect width="${config.progressBar.width}" height="${config.progressBar.height}" fill="white" rx="10" ry="10"></rect>
        <rect width="${expProgress}" height="${config.progressBar.height}" fill="aqua" rx="10" ry="10"></rect>
        <text x="${config.progressBar.width / 2 - 30}" y="15" font-size="14" fill="black" font-family="Arial">${currentExp}/${maxExp}</text>
      </svg>
    `;
    const progressBarBuffer = Buffer.from(progressBarSVG);

    // Function to render SVG text
    const renderTextSVG = (svgContent) => {
      return sharp(Buffer.from(svgContent)).png().toBuffer();
    };

    // Resize name and ID text
    const nameAndIDText = await renderTextSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
        <text x="170" y="120" font-size="30" fill="white" font-family="sans-serif" font-weight="bold">${name}</text>
        <text x="170" y="160" font-size="20" fill="white" font-family="sans-serif">${limit}</text>
        <text x="530" y="160" font-size="20" fill="white" font-family="sans-serif">Level: ${level}</text>
      </svg>
    `);

    // Resize level and balance text
    const levelAndBalanceText = await renderTextSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="100">
        <text x="680" y="20" font-size="20" fill="yellow" font-family="sans-serif">Saldo: ${balance}</text>
      </svg>
    `);

    // Resize rank image with text
    const rankImageWithText = await sharp({
      create: {
        width: config.rank.iconSize,
        height: config.rank.iconSize + config.rank.textOffset,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: resizedRankIcon, top: 0, left: 0 },
        {
          input: await renderTextSVG(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${config.rank.iconSize}" height="${config.rank.textOffset}">
              <text x="10" y="22" font-size="${config.rank.textSize}" fill="${config.rank.textColor}" font-family="sans-serif" font-weight="bold">${rank}</text>
            </svg>
          `),
          top: config.rank.iconSize + 2, // Jarak antara ikon rank dan teks rank
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Final image composition
    const finalImage = await sharp(resizedBackground)
      .composite([
        {
          input: Buffer.from(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
              <!-- Bingkai biru terang dengan margin -->
              <rect x="${config.margin}" y="${config.margin}" width="${canvasWidth - 2 * config.margin}" height="${canvasHeight - 2 * config.margin}" 
                    rx="10" ry="10" fill="none" stroke="aqua" stroke-width="5" />
              <!-- Area transparan gelap di dalam bingkai -->
              <rect x="${config.margin}" y="${config.margin}" width="${canvasWidth - 2 * config.margin}" height="${canvasHeight - 2 * config.margin}" 
                    rx="5" ry="5" fill="rgba(0, 0, 0, 0.6)" />
            </svg>
          `),
          top: 0,
          left: 0,
        },
        { input: profileCircle, top: config.profile.top, left: config.profile.left },
        { input: nameAndIDText, top: config.nameAndID.top, left: config.nameAndID.left },
        { input: progressBarBuffer, top: config.progressBar.top, left: config.progressBar.left },
        { input: levelAndBalanceText, top: config.progressBar.top + 30, left: config.levelAndBalance.left }, // Membuat jarak antara level dan saldo
        { input: rankImageWithText, top: config.rank.top, left: config.rank.left },
      ])
      .png()
      .toBuffer();

    // Send the final image as response
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(finalImage);

  } catch (error) {
    res.status(500).json({ error: "Gagal memproses gambar", details: error.message });
  }
});


module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { background, name, level, level2, avatar } = req.query;

  if (!background || !name || !level || !level2 || !avatar) {
    return res.status(400).json({ error: 'Parameter "background", "name", "level", "level2", dan "avatar" harus ada' });
  }

  try {
    // Coba fetch gambar background dan avatar
    console.log('Mencoba mengambil gambar background...');
    const backgroundBuffer = await fetch(background).then(res => {
      if (!res.ok) {
        throw new Error('Gagal mengambil gambar background');
      }
      return res.buffer();
    });

    console.log('Mencoba mengambil gambar avatar...');
    const avatarBuffer = await fetch(avatar).then(res => {
      if (!res.ok) {
        throw new Error('Gagal mengambil gambar avatar');
      }
      return res.buffer();
    });

    // Proses gambar dengan sharp
    const image = await sharp(backgroundBuffer)
      .resize(800, 600) // Resize jika perlu
      .composite([{ input: avatarBuffer, top: 50, left: 50 }])
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);  // Menampilkan error di log
    res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
  }
};



app.get('/api/levelupcard', async (req, res) => {
  const { background, name, level, level2, avatar } = req.query;

  if (!background || !name || !level || !level2 || !avatar) {
    return res.status(400).json({ error: 'Parameter "background", "name", "level", "level2", dan "avatar" harus ada' });
  }

  try {
    const backgroundBuffer = await fetch(background).then((res) => res.buffer());
    const avatarBuffer = await fetch(avatar).then((res) => res.buffer());

    const image = await sharp(backgroundBuffer)
      .resize(800, 600)
      .composite([{ input: avatarBuffer, top: 50, left: 50 }])
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan' });
  }
});

//=====[ API ANIME ]=====//
app.get('/api/cosplay', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/cosplay.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;
    if (!cosplayData.results || cosplayData.results.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam cosplay.json.' });
    }
    const randomIndex = Math.floor(Math.random() * cosplayData.results.length);
    const randomCosplay = cosplayData.results[randomIndex];
    const imageUrl = randomCosplay.url;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file cosplay.json' });
  }
});


app.get('/api/akiyama', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/akiyama.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;
    if (!cosplayData.results || cosplayData.results.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam cosplay.json.' });
    }
    const randomIndex = Math.floor(Math.random() * cosplayData.results.length);
    const randomCosplay = cosplayData.results[randomIndex];
    const imageUrl = randomCosplay.url;
    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);  
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file cosplay.json' });
  }
});

app.get('/api/husbu', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/husbu.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;

    if (!cosplayData || cosplayData.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam husbu.json.' });
    }

    const randomIndex = Math.floor(Math.random() * cosplayData.length);
    const randomCosplay = cosplayData[randomIndex];
    const imageUrl = randomCosplay.url;

    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file husbu.json' });
  }
});

app.get('/api/loli', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/loli.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;

    if (!cosplayData || cosplayData.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam husbu.json.' });
    }

    const randomIndex = Math.floor(Math.random() * cosplayData.length);
    const randomCosplay = cosplayData[randomIndex];
    const imageUrl = randomCosplay.url;

    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file husbu.json' });
  }
});

app.get('/api/neko', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/neko.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;

    if (!cosplayData || cosplayData.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam husbu.json.' });
    }

    const randomIndex = Math.floor(Math.random() * cosplayData.length);
    const randomCosplay = cosplayData[randomIndex];
    const imageUrl = randomCosplay.url;

    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file husbu.json' });
  }
});

app.get('/api/shota', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/shota.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;

    if (!cosplayData || cosplayData.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam husbu.json.' });
    }

    const randomIndex = Math.floor(Math.random() * cosplayData.length);
    const randomCosplay = cosplayData[randomIndex];
    const imageUrl = randomCosplay.url;

    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file husbu.json' });
  }
});

app.get('/api/pinterest2', async (req, res) => {
  try {
    const message = req.query.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
   const anjayan = await getPinterestImages(message)
    res.status(200).json({
      status: 200,
      creator: "IM - REREZZ",
      result: anjayan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//=====[ API AI ]=====//
app.get("/api/chatgpt-v2", async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ status: false, creator: "IM Rerezz", error: "Isi parameter Query" });
    }
    try {
        const response = await ChatGPTv2(q, "openai");
        res.status(200).json({
            status: true,
            creator: "I'M Rerezz Official",
            result: response
        });
    } catch (error)        {
        res.status(500).json({ status: false, creator: "IM Rerezz", error: error.message });
    }
});

app.get("/api/llama", async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ status: false, creator: "IM Rerezz", error: "Isi parameter Query" });
    }
    try {
        const response = await ChatGPTv2(q, "llama");
        res.status(200).json({
            status: true,
            creator: "IM Rerezz",
            result: response
        });
    } catch (error) {
        res.status(500).json({ status: false, creator: "IM Rerezz", error: error.message });
    }
});


//=====[ OKECONNECT API ]=====//
app.get('/api/okeconnect/dana', (req, res) => {
  res.sendFile(path.join(__dirname, 'media', 'dana.json'));
});

app.get('/api/okeconnect/kuota-tree', async (req, res) => {
    const produk = req.params.produk; 
    const hargaID = '905ccd028329b0a'; 
    const url = `https://okeconnect.com/harga/json?id=905ccd028329b0a&produk=kuota_tri`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data dari API asli', details: error.message });
    }
});

app.get('/api/okeconnect/ovo', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/ovo.json');
    const quotes = response.data.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Error Mendapatkan Ovo Okeconnect:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
  }
});

//=====[ API VID RANDOM ]=====//
app.get('/api/bocil', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/bocil.json');
    const bocilData = response.data;
    const videos = bocilData.results;
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    axios({
      method: 'get',
      url: randomVideo.url,
      responseType: 'stream',
    })
    .then(videoResponse => {
      res.setHeader('Content-Type', 'video/mp4');
      videoResponse.data.pipe(res); 
    })
    .catch(error => {
      console.error('Error fetching video:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil video' });
    });
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Gagal memproses file bocil.json' });
  }
});

app.get('/api/download/mp4', validateYoutubeUrl, async (req, res) => {
  const { url } = req.query;
  const result = await downloadMp4(url);
  return res.status(result.status ? 200 : 500).json(result);
});

app.get('/api/download/mp3', validateYoutubeUrl, async (req, res) => {
  const { url } = req.query;
  const result = await downloadMp3(url);
  return res.status(result.status ? 200 : 500).json(result);
});



app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json(messages.url);

  try {
  const { tiktokdl } = require("tiktokdl")
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json(messages.notRes);
    res.json({ status: true, creator: "Rezz Devv", result: data });
  } catch (e) {
    res.status(500).json(messages.error);
  }
});


app.get('/api/orkut/createpayment', async (req, res) => {
    const { amount } = req.query;
    if (!amount) {
    return res.json("Isi Parameter Amount.");
    }
    const { codeqr } = req.query;
    if (!codeqr) {
    return res.json("Isi Parameter CodeQr menggunakan qris code kalian.");
    }
    try {
        const qrData = await createQRIS(amount, codeqr);
        res.json({ status: true, creator: "Rezz Devv", result: qrData });        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orkut/cekstatus', async (req, res) => {
    const { merchant, keyorkut } = req.query;
        if (!merchant) {
        return res.json({ error: "Isi Parameter Merchant." });
    }
    if (!keyorkut) {
        return res.json({ error: "Isi Parameter Token menggunakan token kalian." });
    }
    try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${keyorkut}`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        const latestTransaction = result.data && result.data.length > 0 ? result.data[0] : null;
                if (latestTransaction) {
            res.json(latestTransaction);
        } else {
            res.json({ message: "No transactions found." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
