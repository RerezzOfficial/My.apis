
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require("axios");
const { search } = require('yt-search');
const puppeteer = require("puppeteer");
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const app = express();
app.use(express.json());
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

function generateImageWithText(text) {
  return new Promise((resolve, reject) => {
    try {
      registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });

      const canvasWidth = 800;
      const canvasHeight = 800;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let fontSize = 130; // Ukuran font awal
      ctx.font = `${fontSize}px "MyFont"`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const maxWidth = canvas.width - 20; // Margin kiri dan kanan
      let lines = [];
      let line = '';

      // Bagi teks menjadi beberapa baris sesuai dengan lebar canvas
      text.split(' ').forEach(word => {
        const testLine = line + word + ' ';
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth) {
          lines.push(line); // Masukkan baris sebelumnya jika lebar melebihi batas
          line = word + ' '; // Mulai baris baru dengan kata ini
        } else {
          line = testLine; // Tambahkan kata ke baris yang ada
        }
      });

      lines.push(line); // Masukkan baris terakhir

      // Cek apakah semua teks muat pada canvas
      let totalHeight = lines.length * fontSize;
      while (totalHeight > canvasHeight - 30 && fontSize > 10) {
        fontSize--; // Kurangi ukuran font jika teks tidak muat
        ctx.font = `${fontSize}px "MyFont"`;
        lines = [];
        line = '';

        text.split(' ').forEach(word => {
          const testLine = line + word + ' ';
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth) {
            lines.push(line);
            line = word + ' ';
          } else {
            line = testLine;
          }
        });

        lines.push(line);
        totalHeight = lines.length * fontSize;
      }

      // Menggambar teks pada canvas
      let yPosition = 20;  // Posisi vertikal lebih dekat ke atas
      const lineHeight = fontSize * 1.2;  // Jarak antar baris
      lines.forEach(line => {
        ctx.fillText(line, 20, yPosition);
        yPosition += lineHeight;
      });

      const buffer = canvas.toBuffer('image/png');
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}


async function notifGroup(options) {
  const { backgroundURL, avatarURL, title, description } = options;

  const width = 700;
  const height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const background = await loadImage(backgroundURL);
  ctx.drawImage(background, 0, 0, width, height);

  const overlayX = 10;
  const overlayY = 10;
  const overlayWidth = width - 20;
  const overlayHeight = height - 20;
  const overlayRadius = 50;

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

  ctx.strokeStyle = '#FFCC33';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();

  const avatar = await loadImage(avatarURL);
  const avatarSize = 150;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = height / 2 - 140;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#FFCC33';
  ctx.lineWidth = 6;
  ctx.stroke();

  registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });

  ctx.font = 'bold 40px "MyFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, avatarY + avatarSize + 50);

  ctx.font = '22px "MyFont"';  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(description, width / 2, avatarY + avatarSize + 90);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer();
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

app.get('/doc/canvas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'canvas.html'));
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



app.get('/api/brat', async (req, res) => {
  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Parameter "text" wajib disertakan.' });
  }

  try {
    const imageBuffer = await generateImageWithText(text);
    res.setHeader('Content-Type', 'image/png');
    res.end(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat gambar.' });
  }
});

app.get('/api/cpanel', async (req, res) => {
    const { domain, apikey, username, ram, disk, cpu } = req.query;

    // Validasi input
    if (!domain || !apikey || !username || !ram || !disk || !cpu) {
        return res.status(400).json({ error: "Semua parameter (domain, apikey, username, ram, disk, cpu) wajib diisi." });
    }

    const email = `${username}@gmail.com`;
    const password = `${username}${disk}`;
    const egg = "15";
    const loc = "1";

    try {
        // Buat user
        const userResponse = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
            body: JSON.stringify({
                email: email,
                username: username,
                first_name: username,
                last_name: username,
                language: "en",
                password: password,
            }),
        });

        const userData = await userResponse.json();
        if (!userResponse.ok || userData.errors) {
            return res.status(400).json({ error: `User Creation Error: ${userData.errors ? userData.errors[0].detail : 'Unknown error'}` });
        }

        const userId = userData.attributes.id;

        // Ambil data Egg
        const eggResponse = await fetch(`${domain}/api/application/nests/5/eggs/${egg}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${apikey}`,
            },
        });

        const eggData = await eggResponse.json();
        if (!eggResponse.ok || eggData.errors) {
            return res.status(400).json({ error: `Egg Data Error: ${eggData.errors ? eggData.errors[0].detail : 'Unknown error'}` });
        }

        const startupCmd = eggData.attributes.startup;

        // Buat server
        const serverResponse = await fetch(`${domain}/api/application/servers`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
            body: JSON.stringify({
                name: username,
                description: "Server dibuat oleh API RerezzDev.",
                user: userId,
                egg: parseInt(egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
                startup: startupCmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start",
                    JS_FILE: "index.js",
                },
                limits: {
                    memory: ram,
                    swap: 0,
                    disk: disk,
                    io: 500,
                    cpu: cpu,
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 5,
                },
                deploy: {
                    locations: [parseInt(loc)],
                    dedicated_ip: false,
                    port_range: [],
                },
            }),
        });

        const serverData = await serverResponse.json();
        if (!serverResponse.ok || serverData.errors) {
            return res.status(400).json({ error: `Server Creation Error: ${serverData.errors ? serverData.errors[0].detail : 'Unknown error'}` });
        }

        // Respons sukses
        const server = serverData.attributes;
        res.json({
            message: "Server berhasil dibuat!",
            user: {
                id: userId,
                username: username,
                email: email,
            },
            server: {
                id: server.id,
                name: server.name,
                memory: ram,
                disk: disk,
                cpu: cpu,
            },
            credentials: {
                email: email,
                password: password,
                login_url: domain,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan saat membuat server. Harap coba lagi." });
    }
});


//=====[ API CANVAS ]=====//
async function fetchImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return loadImage(response.data);
  }
  
  async function fetchImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return loadImage(response.data);
  }
  
  app.get("/profile", async (req, res) => {
    try {
      const {
        background,
        ppuser,
        name,
        level,
        exp,
        requireExp,
        rankName,
        rankId,
      } = req.query;
  
      if (!background || !ppuser || !name || !level || !exp || !requireExp || !rankName || !rankId) {
        return res.status(400).json({ error: "Parameter tidak lengkap atau salah format." });
      }
  
      // Registering the custom font
      registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });
  
      const backgroundURL = decodeURIComponent(background);
      const avatarURL = decodeURIComponent(ppuser);
  
      try {
        await fetchImage(backgroundURL);
      } catch (error) {
        return res.status(400).json({ error: "URL background tidak valid.", details: error.message });
      }
  
      try {
        await fetchImage(avatarURL);
      } catch (error) {
        return res.status(400).json({ error: "URL avatar tidak valid.", details: error.message });
      }
  
      const avatarSize = 120;
      const width = 850;
      const height = 300;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
  
      ctx.clearRect(0, 0, width, height);
      const bgImage = await fetchImage(backgroundURL);
      ctx.drawImage(bgImage, 0, 0, width, height);
  
      const overlayX = 20;
      const overlayY = 20;
      const overlayWidth = width - 40;
      const overlayHeight = height - 40;
      const overlayRadius = 30;
  
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(overlayX + overlayRadius, overlayY);
      ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
      ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
      ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
      ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
  
      const avatar = await fetchImage(avatarURL);
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 40, height / 2 - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();
  
      // Border Avatar
      ctx.beginPath();
      ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.stroke();
  
      // Setting the font to MyFont for all text
      ctx.font = "bold 36px 'MyFont'"; // All texts are now using 'MyFont'
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(name, 180, height / 2 - 40);
  
      ctx.font = "bold 28px 'MyFont'";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText(`LEVEL ${level}`, width - 60, 60);
  
      ctx.font = "bold 22px 'MyFont'";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${rankName}`, 180, height / 2);
  
      ctx.font = "bold 22px 'MyFont'";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText(`${rankId}`, width - 60, 100);
  
      const barWidth = 600;
      const barHeight = 30;
      const barX = 180;
      const barY = height / 2 + 20;
      const progress = exp / requireExp;
      const barRadius = 15;
  
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(barX + barRadius, barY);
      ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
      ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
      ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
      ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
      ctx.closePath();
      ctx.fill();
  
      ctx.fillStyle = "#00FFFF";
      ctx.beginPath();
      ctx.moveTo(barX + barRadius, barY);
      ctx.arcTo(barX + barWidth * progress, barY, barX + barWidth * progress, barY + barHeight, barRadius);
      ctx.arcTo(barX + barWidth * progress, barY + barHeight, barX, barY + barHeight, barRadius);
      ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
      ctx.arcTo(barX, barY, barX + barWidth * progress, barY, barRadius);
      ctx.closePath();
      ctx.fill();
  
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(barX + barRadius, barY);
      ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
      ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
      ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
      ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
      ctx.closePath();
      ctx.stroke();
  
      ctx.font = 'bold 20px "MyFont"';
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText(`${exp} / ${requireExp}`, barX + barWidth / 2, barY + barHeight - 5);
  
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(canvas.toBuffer());
    } catch (error) {
      res.status(500).json({ error: "Gagal memproses gambar", details: error.message });
    }
  });
  

app.get('/api/ppdoc', async (req, res) => {
  const { background, foto, exp, requireExp, level, name } = req.query;
  if (!background || !foto || !exp || !requireExp || !level || !name) {
    return res.status(400).json({ error: "Semua parameter harus diisi." });
  }
  try {
    const apiUrl = `https://api-im-rerezz.glitch.me/ppdoc?background=${encodeURIComponent(background)}&foto=${encodeURIComponent(foto)}&exp=${exp}&requireExp=${requireExp}&level=${level}&name=${encodeURIComponent(name)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Gagal mengambil data gambar.',
      details: error.message,
    });
  }
});


app.get('/api/levelup', async (req, res) => {
  const { background, foto, fromLevel, toLevel, name } = req.query;
  if (!background || !foto || !fromLevel || !toLevel || !name) {
    return res.status(400).json({ error: "Semua parameter harus diisi." });
  }
  try {
    const apiUrl = `https://api-im-rerezz.glitch.me/levelup?background=${encodeURIComponent(background)}&foto=${encodeURIComponent(foto)}&fromLevel=${fromLevel}&toLevel=${toLevel}&name=${encodeURIComponent(name)}`;
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Gagal mengambil data gambar.',
      details: error.message,
    });
  }
});

app.get('/api/welcome', async (req, res) => {
  const { background, avatar, name, subject } = req.query;

  if (!background || !avatar || !name || !subject) {
    return res.status(400).json({ error: 'Parameter "background", "avatar", "name", dan "subject" harus disertakan.' });
  }

  try {
    const imageBuffer = await notifGroup({
      backgroundURL: background,
      avatarURL: avatar,
      title: name,
      description: subject
    });

    res.setHeader('Content-Type', 'image/png');
    res.end(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat gambar.' });
  }
});





//=====[ API GAME ]=====//
app.get('/asahotak', (req, res) => {
  const filePath = path.join(__dirname, 'media', 'asahotak.json');
  console.log('File Path:', filePath); 
  res.sendFile(filePath);
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

app.get('/api/lumina', async (req, res) => {
    const { text } = req.query;

    if (!text) {
        return res.status(400).json({ error: 'Text query parameter is required' });
    }

    try {
        const response = await axios.post('https://luminai.my.id/', {
            content: text,
            cName: "S-AI",
            cID: "S-AIbAQ0HcC"
        });

        // Kirimkan respons dari LuminAI ke klien
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong', details: error.message });
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
