
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require("axios");
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


app.use('/anime', express.static(path.join(__dirname, 'anime')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/style/styles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});
app.get('/style/script', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
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


app.get('/style/style', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai.css'));
});
app.get('/style/scrip', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai.js'));
});


app.get('/get/pairingcode', async (req, res) => {
  try {
    const url = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/database/ipuser.json';
    const response = await axios.get(url);
    const allowedIps = response.data.allowed_ips;
    if (!allowedIps || allowedIps.length === 0) {
      return res.status(400).json({ error: 'Tidak ada IP yang diizinkan.' });
    }
    res.json({ allowed_ips: allowedIps });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data IP.' });
  }
});


app.get('/getip', (req, res) => {
  res.sendFile(path.join(__dirname, 'database', 'ipuser.json'));
});

app.get('/quotes/motivasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'quotes', 'galau.json'));
});

//=====[ API GAME ]=====//
app.get('/game/asahotak', (req, res) => {
  res.sendFile(path.join(__dirname, 'game', 'asahotak.json'));
});
//=====[ API ANIME ]=====//
app.get('/api/cosplay', async (req, res) => {
  try {
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/anime/cosplay.json';
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
    const fileUrl = 'https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/anime/akiyama.json';
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

//=====[ API QUOTES ]=====//
app.get('/api/quotes/galau', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/quotes/galau.json');
    const quotes = response.data.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Error fetching galau quotes:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil quotes galau.' });
  }
});
app.get('/quotes/motivasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'quotes', 'galau.json'));
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
app.get('/okeconnect/dana', (req, res) => {
  res.sendFile(path.join(__dirname, 'okeconnect', 'dana.json'));
});

app.get('/okeconnect/trx', async (req, res) => {
    const { memberID, pin, password, product, dest, refID, sign } = req.query;

    // Pastikan semua parameter ada
    if (!memberID || !pin || !password || !product || !dest || !refID || !sign) {
        return res.status(400).json({ error: 'Semua parameter harus disertakan' });
    }

    const url = `https://h2h.okeconnect.com/trx?memberID=${encodeURIComponent(memberID)}&pin=${encodeURIComponent(pin)}&password=${encodeURIComponent(password)}&product=${encodeURIComponent(product)}&dest=${encodeURIComponent(dest)}&refID=${encodeURIComponent(refID)}&sign=${encodeURIComponent(sign)}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data dari API', details: error.message });
    }
});



app.get('/okeconnect/harga', async (req, res) => {
    const produk = req.params.produk; 
    const hargaID = '905ccd028329b0a'; 
    const url = `https://www.okeconnect.com/harga/json?id=905ccd028329b0a`; 
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data dari API asli', details: error.message });
    }
});

app.get('/okeconnect/kuota-tree', async (req, res) => {
    const produk = req.params.produk; // Mengambil produk dari parameter URL
    const hargaID = '905ccd028329b0a'; // ID harga yang tetap
    const url = `https://okeconnect.com/harga/json?id=905ccd028329b0a&produk=kuota_tri`; // Menggunakan produk dinamis

    try {
        // Mengambil data dari API asli menggunakan axios
        const response = await axios.get(url);

        // Mengirimkan data dari API asli ke client
        res.json(response.data);
    } catch (error) {
        // Jika terjadi error, mengirimkan status 500 dengan pesan error
        res.status(500).json({ error: 'Gagal mengambil data dari API asli', details: error.message });
    }
});

app.get('/okeconnect/ovo', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/okeconnect/ovo.json');
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
    const response = await axios.get('https://raw.githubusercontent.com/RerezzOfficial/My.apis/main/nsfw/bocil.json');
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
