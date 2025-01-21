
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require("axios");
const { search, yts } = require('yt-search');
const puppeteer = require("puppeteer");
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const mediafire = require('./lib/mediafire')
const path = require('path');
const app = express();
app.use(express.json());

app.enable("trust proxy");
app.set("json spaces", 2);
app.use(bodyParser.json()); 
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
 const PORT = process.env.PORT || 5000;
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

async function MediaFireh(url) {
  try {
    const data = await fetch(
      `https://www-mediafire-com.translate.goog/${url.replace("https://www.mediafire.com/", "")}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.178 Safari/537.36",
        },
      },
    ).then((res) => res.text());
    const $ = cheerio.load(data);
    const downloadUrl = ($("#downloadButton").attr("href") || "").trim();
    const alternativeUrl = (
      $("#download_link > a.retry").attr("href") || ""
    ).trim();
    const $intro = $("div.dl-info > div.intro");
    const filename = $intro.find("div.filename").text().trim();
    const filetype = $intro.find("div.filetype > span").eq(0).text().trim();
    const ext =
      /\(\.(.*?)\)/
        .exec($intro.find("div.filetype > span").eq(1).text())?.[1]
        ?.trim() || "bin";
    const uploaded = $("div.dl-info > ul.details > li")
      .eq(1)
      .find("span")
      .text()
      .trim();
    const filesize = $("div.dl-info > ul.details > li")
      .eq(0)
      .find("span")
      .text()
      .trim();
    return {
      link: downloadUrl || alternativeUrl,
      alternativeUrl: alternativeUrl,
      name: filename,
      filetype: filetype,
      mime: ext,
      uploaded: uploaded,
      size: filesize,
    };
  } catch (error) {
    console.error(error);
  }
}

async function downloadInstagram(url) {
  try {
    const { data } = await axios.post(
      'https://yt1s.io/api/ajaxSearch',
      new URLSearchParams({ p: 'home', q: url, w: '', lang: 'en' }),
      {
        headers: {
          'User-Agent': 'Postify/1.0.0',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      }
    );

    if (data.status !== 'ok') {
      throw new Error('Gagal mengambil data dari API.');
    }

    const $ = cheerio.load(data.data);
    const downloads = $('a.abutton.is-success.is-fullwidth.btn-premium')
      .map((_, el) => ({
        title: $(el).attr('title'),
        url: $(el).attr('href'),
      }))
      .get();

    if (downloads.length === 0) {
      throw new Error('Tidak ada tautan unduhan yang tersedia.');
    }

    return { success: true, downloads };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message || 'Terjadi kesalahan.' };
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

      let fontSize = 130; 
      ctx.font = `${fontSize}px "MyFont"`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const maxWidth = canvas.width - 20; 
      let lines = [];
      let line = '';

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

      let totalHeight = lines.length * fontSize;
      while (totalHeight > canvasHeight - 30 && fontSize > 10) {
        fontSize--; 
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

      let yPosition = 20; 
      const lineHeight = fontSize * 1.2; 
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

app.get('/doc/cpanel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cpanel.html'));
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

    if (!domain || !apikey || !username || !ram || !disk || !cpu) {
        return res.status(400).json({ error: "Semua parameter (domain, apikey, username, ram, disk, cpu) wajib diisi." });
    }

    const email = `${username}@gmail.com`;
    const password = `${username}${disk}`;
    const egg = "15";
    const loc = "1";

    try {
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


///=====[ API SEARCH ]=====///
app.get('/search', async (req, res) => {
  const query = req.query.q;

  // Pastikan query tersedia
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    // Mengambil hasil pencarian dari Google
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Menggunakan cheerio untuk mem-parsing HTML
    const $ = cheerio.load(response.data);
    const results = [];

    // Menambahkan log untuk debugging
    console.log('HTML Loaded:', response.data.substring(0, 500)); // Menampilkan sebagian dari HTML untuk pemeriksaan awal

    // Memastikan elemen pencarian Google sudah sesuai
    $('#rso .tF2Cxc').each((index, element) => {
      const title = $(element).find('h3').text();
      const link = $(element).find('a').attr('href');
      const snippet = $(element).find('.VwiC3b').text();

      // Pastikan data ditemukan sebelum menambahkannya ke array hasil
      if (title && link) {
        results.push({
          title: title.trim(),
          link: link.trim(),
          snippet: snippet.trim() || 'No snippet available',
        });
      }
    });

    // Jika tidak ada hasil
    if (results.length === 0) {
      console.log('No results found. Check the selectors or Google HTML structure.');
    }

    // Mengembalikan hasil pencarian
    res.json({ query, results });

  } catch (error) {
    console.error('Error scraping Google:', error.message);
    res.status(500).json({ error: 'Error scraping Google search: ' + error.message });
  }
});


//=====[ API CANVAS ]=====//
async function fetchImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return loadImage(response.data);
}

app.get("/api/profile", async (req, res) => {
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

        ctx.beginPath();
        ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = "bold 36px 'MyFont'";
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


app.get("/api/levelup", async (req, res) => {
    try {
      const { background, foto, fromLevel, toLevel, name } = req.query;
  
      if (!background || !foto || !fromLevel || !toLevel || !name) {
        return res.status(400).json({ error: "Semua parameter harus diisi." });
      }
  
      registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });
  
      const width = 600;
      const height = 150;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
  
      ctx.clearRect(0, 0, width, height);
  
      const backgroundImg = await fetchImage(background);
      ctx.drawImage(backgroundImg, 0, 0, width, height);
  
      const overlayX = 10;
      const overlayY = 10;
      const overlayWidth = width - 20;
      const overlayHeight = height - 20;
      const overlayRadius = 40;
  
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
  
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
  
      const avatarSize = 100;
      const avatarX = overlayX + overlayRadius + 10;
      const avatarImg = await fetchImage(foto);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, height / 2 - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();
  
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
  
      ctx.font = 'bold 28px "MyFont"';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(name, avatarX + avatarSize + 20, height / 2 + 10);
  
      const circleSize = 55;
      const circleX1 = width - circleSize * 4 + 10;
      const circleX2 = width - circleSize * 2 - 8;
      const arrowX = circleX1 + circleSize + 10;
  
      ctx.beginPath();
      ctx.arc(circleX1 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 204, 51, 0.3)';
      ctx.fill();
  
      ctx.beginPath();
      ctx.arc(circleX1 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
  
      ctx.font = 'bold 24px "MyFont"';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(fromLevel, circleX1 + circleSize / 2, height / 2 + 8);
  
      ctx.beginPath();
      ctx.moveTo(arrowX, height / 2 - 8);
      ctx.lineTo(arrowX + 20, height / 2);
      ctx.lineTo(arrowX, height / 2 + 8);
      ctx.closePath();
      ctx.fillStyle = '#00FFFF';
      ctx.fill();
  
      ctx.beginPath();
      ctx.arc(circleX2 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 204, 51, 0.3)';
      ctx.fill();
  
      ctx.beginPath();
      ctx.arc(circleX2 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
  
      ctx.font = 'bold 24px "MyFont"';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(toLevel, circleX2 + circleSize / 2, height / 2 + 8);
  
      res.setHeader("Content-Type", "image/png");
      res.send(canvas.toBuffer());
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat memproses permintaan." });
    }
  });
  

  app.get("/api/welcome", async (req, res) => {
    try {
      const { background, foto, nama, subject } = req.query;
  
      if (!background || !foto || !nama || !subject) {
        return res.status(400).json({ error: "Semua parameter harus diisi." });
      }
  
      registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });
  
      const width = 700;
      const height = 350;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
  
      ctx.clearRect(0, 0, width, height);
  
      const backgroundImg = await fetchImage(background);
      ctx.drawImage(backgroundImg, 0, 0, width, height);
  
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
  
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();
  
      const avatar = await fetchImage(foto);
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
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 6;
      ctx.stroke();
  
      ctx.font = 'bold 40px "MyFont"';
      ctx.fillStyle = '#00FFFF';
      ctx.textAlign = 'center';
      ctx.fillText(nama, width / 2, avatarY + avatarSize + 50);
  
      ctx.font = '22px "MyFont"';
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(subject, width / 2, avatarY + avatarSize + 90);
  
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.moveTo(overlayX + overlayRadius, overlayY);
      ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
      ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
      ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
      ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
      ctx.closePath();
      ctx.fill();
  
      res.setHeader("Content-Type", "image/png");
      res.send(canvas.toBuffer());
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Terjadi kesalahan saat memproses permintaan." });
    }
  });


 app.get('/api/welcome2', async (req, res) => {
    try {
      registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });
  
      const { background, fotogv, fotouer, name, subject } = req.query;

      if (!background || !fotogv || !fotouer || !name || !subject) {
        return res.status(400).json({ error: "Semua parameter harus diisi." });
      }
  
      // Ukuran kanvas
      const width = 700;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
  
      // Latar belakang
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
  
      const headerWidth = width * 0.85;
      const headerHeight = height * 0.7;
      const headerX = (width - headerWidth) / 2;
      const headerY = (height - headerHeight) / 2;
  
      // Gambar header dengan background image
      const backgroundImg = await loadImage(background);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(headerX + 20, headerY);
      ctx.arcTo(headerX + headerWidth, headerY, headerX + headerWidth, headerY + headerHeight, 20);
      ctx.arcTo(headerX + headerWidth, headerY + headerHeight, headerX, headerY + headerHeight, 20);
      ctx.arcTo(headerX, headerY + headerHeight, headerX, headerY, 20);
      ctx.arcTo(headerX, headerY, headerX + headerWidth, headerY, 20);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(backgroundImg, headerX, headerY, headerWidth, headerHeight);
      ctx.restore();
  
      // Border header
      ctx.strokeStyle = 'aqua';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Profil utama
      const profileSize = 120;
      const profileX = width / 2 - profileSize / 2;
      const profileY = headerY + 20;
  
      const profileImg = await loadImage(fotogv);
      ctx.save();
      ctx.beginPath();
      ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, profileX, profileY, profileSize, profileSize);
      ctx.restore();
  
      // Border profil utama
      ctx.beginPath();
      ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = 'aqua';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Profil sekunder
      const secondarySize = 70;
      const secondaryX = profileX + profileSize - secondarySize / 2 - 10;
      const secondaryY = profileY + profileSize - secondarySize / 2 - 10;
  
      const secondaryImg = await loadImage(fotouer);
      ctx.save();
      ctx.beginPath();
      ctx.arc(secondaryX + secondarySize / 2, secondaryY + secondarySize / 2, secondarySize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(secondaryImg, secondaryX, secondaryY, secondarySize, secondarySize);
      ctx.restore();
  
      // Border profil sekunder
      ctx.beginPath();
      ctx.arc(secondaryX + secondarySize / 2, secondaryY + secondarySize / 2, secondarySize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = 'aqua';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Nama menggunakan font kustom
      ctx.font = 'bold 28px "MyFont"';  // Memperbesar ukuran font
      ctx.fillStyle = 'aqua';
      ctx.textAlign = 'center';
      ctx.fillText(name, width / 2, profileY + profileSize + 60);  // Menurunkan posisi teks sedikit
  
      // Subject menggunakan font kustom
      ctx.font = '24px "MyFont"';  // Memperbesar ukuran font
      ctx.fillStyle = 'aqua';
      ctx.fillText(subject, width / 2, profileY + profileSize + 110);  // Menurunkan posisi teks sedikit
  
      // Kirim hasil sebagai gambar PNG
      res.setHeader('Content-Type', 'image/png');
      res.send(canvas.toBuffer());
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
    }
  });


app.get('/api/rank', async (req, res) => {
  try {
    // Daftarkan font kustom
    registerFont(path.join(__dirname, 'fonts', 'fonts.ttf'), { family: 'MyFont' });

    const { background, foto, nama, level, coin, exp, iduser, fotorank, rank } = req.query;

    if (!background || !foto || !nama || !level || !coin || !exp || !iduser || !fotorank || !rank) {
      return res.status(400).json({ error: "Semua parameter harus diisi." });
    }

    // Ukuran kanvas
    const width = 700;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Latar belakang
    const backgroundImg = await fetchImage(background);
    ctx.drawImage(backgroundImg, 0, 0, width, height);

    // Profil Utama (Foto Pengguna)
    const profileSize = 80;
    const profileX = 20;
    const profileY = (height / 2) - (profileSize / 2);
    const profileImg = await fetchImage(foto);
    ctx.save();
    ctx.beginPath();
    ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profileImg, profileX, profileY, profileSize, profileSize);
    ctx.restore();

    // Nama Pengguna
    ctx.font = 'bold 24px "MyFont"';
    ctx.fillStyle = 'white';
    ctx.fillText(nama, profileX + profileSize + 20, profileY + profileSize / 2);

    // Level
    ctx.font = 'bold 18px "MyFont"';
    ctx.fillText(`LEVEL: ${level}`, profileX + profileSize + 20, profileY + profileSize / 2 + 30);

    // ID Pengguna
    ctx.font = '18px "MyFont"';
    ctx.fillText(`ID: ${iduser}`, profileX + profileSize + 20, profileY + profileSize / 2 + 55);

    // Exp Bar dengan Border Radius (Height 25px)
    const expBarWidth = width - 60;
    const expBarHeight = 25; // Ubah tinggi menjadi 25px
    const expFillWidth = (exp / 1000) * expBarWidth; // Anggap exp maksimal 1000
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(30, height * 0.7 + 10); // Poin awal
    ctx.lineTo(30 + expBarWidth, height * 0.7 + 10);
    ctx.arcTo(30 + expBarWidth, height * 0.7, 30 + expBarWidth, height * 0.7 + expBarHeight, 10); // Melengkungkan sudut kanan atas dan bawah
    ctx.lineTo(30, height * 0.7 + expBarHeight);
    ctx.arcTo(30, height * 0.7 + expBarHeight, 30, height * 0.7, 10); // Melengkungkan sudut kiri bawah dan atas
    ctx.fill();

    ctx.fillStyle = 'aqua';
    ctx.beginPath();
    ctx.moveTo(30, height * 0.7 + 10); // Poin awal
    ctx.lineTo(30 + expFillWidth, height * 0.7 + 10);
    ctx.arcTo(30 + expFillWidth, height * 0.7, 30 + expFillWidth, height * 0.7 + expBarHeight, 10); // Melengkungkan sudut kanan atas dan bawah
    ctx.lineTo(30, height * 0.7 + expBarHeight);
    ctx.arcTo(30, height * 0.7 + expBarHeight, 30 + expFillWidth, height * 0.7 + expBarHeight, 10); // Melengkungkan sudut kiri bawah dan atas
    ctx.fill();

    // Rank Badge
    const rankSize = 80;
    const rankX = width - rankSize - 120;  // Geser sedikit ke kiri
    const rankY = (height / 2) - (rankSize / 2);
    const rankImg = await fetchImage(fotorank);
    ctx.drawImage(rankImg, rankX, rankY, rankSize, rankSize);

    // Nama Rank di bawah foto rank
    ctx.font = 'bold 18px "MyFont"';
    ctx.fillStyle = 'white';
    ctx.fillText(rank, rankX + rankSize / 2 - ctx.measureText(rank).width / 2, rankY + rankSize + 20); // Nama rank di bawah foto rank

    // Coin and Exp Icons
    ctx.font = '16px "MyFont"';
    ctx.fillText(`Coins: ${coin}`, 30, height * 0.8);
    ctx.fillText(`EXP: ${exp}`, 30, height * 0.85);

    // Kirim hasil sebagai gambar PNG
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer());

  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});
//=====[ API GAME ]=====//
app.get('/api/asahotak', (req, res) => {
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

//=====[ FOTO RANDOM ]=====///
app.get('/api/china', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/media/china.json';
    const response = await axios.get(fileUrl);
    const cosplayData = response.data;

    if (!cosplayData || cosplayData.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam china.json.' });
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
    res.status(500).json({ error: 'Gagal memproses file china.json' });
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

//=====[ API DOWNLOAD ]=====/
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

app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL YouTube diperlukan!' });
    }

    try {
        // Menggunakan ytmp3.cc (sebagai alternatif)
        const apiUrl = `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        // Cari URL MP3 dalam respons HTML
        const mp3UrlMatch = response.data.match(/href="(https:\/\/[^"]+\.mp3)"/);
        if (mp3UrlMatch && mp3UrlMatch[1]) {
            const mp3Url = mp3UrlMatch[1];
            return res.json({ success: true, downloadUrl: mp3Url });
        } else {
            return res.status(500).json({ error: 'Gagal mendapatkan URL MP3!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan Anda!' });
    }
});

app.get('/api/mediafire', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await mediafire(url);
    res.status(200).json({
      status: 200,
      creator: "IM REREZZ",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
