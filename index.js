
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
app.get('/asahotak', (req, res) => {
  const filePath = path.join(__dirname, 'media', 'asahotak.json');
  console.log('File Path:', filePath); 
  res.sendFile(filePath);
});

app.get('/profile', async (req, res) => {
  const {
    background,
    ppuser,
    sender,
    name,
    level,
    exp,
    requireExp,
    rankName,
    rankId,
  } = req.query;

  // Validasi parameter yang diperlukan
  if (
    !background ||
    !ppuser ||
    !sender ||
    !name ||
    !level ||
    !exp ||
    !requireExp ||
    !rankName ||
    !rankId
  ) {
    return res.status(400).json({
      error: 'Parameter tidak lengkap. Pastikan semua parameter sudah dikirim.',
    });
  }

  try {
    // URL API dengan template literal
    const apiUrl = `https://api-im-rerezz.glitch.me/profile?background=${encodeURIComponent(background)}&ppuser=${encodeURIComponent(ppuser)}&name=${encodeURIComponent(name)}&level=${level}&exp=${exp}&requireExp=${requireExp}&rankName=${encodeURIComponent(rankName)}&rankId=${rankId}`;

    // Request ke API dan mengambil gambar
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    // Mengirimkan gambar sebagai response
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(response.data);
  } catch (error) {
    // Error handling
    res.status(500).json({
      error: 'Gagal mengambil data gambar.',
      details: error.message,
    });
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
