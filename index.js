
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

// Log Info
const messages = {
  error: {
    status: 404,
    creator: "AbiDev",
    result: "Error, Service Unavailable",
  },
  notRes: {
    status: 404,
    creator: "AbiDev",
    result: "Error, Invalid JSON Result",
  },
  query: {
    status: 400,
    creator: "AbiDev",
    result: "Please input parameter query!",
  },
  amount: {
    status: 400,
    creator: "AbiDev",
    result: "Please input parameter amount!",
  },
  codeqr: {
    status: 400,
    creator: "AbiDev",
    result: "Please input parameter codeqr!",
  },
  url: {
    status: 400,
    creator: "AbiDev",
    result: "Please input parameter URL!",
  },
  notUrl: {
    status: 404,
    creator: "AbiDev",
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

// Middleware untuk CORS
app.use(cors());




// Static files untuk folder anime
app.use('/anime', express.static(path.join(__dirname, 'anime')));

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'feature.html'));
});

app.get('/api/cosplay', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'anime', 'cosplay.json');

    // Cek apakah file cosplay.json ada di path yang benar
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File cosplay.json tidak ditemukan.' });
    }

    const data = await fs.promises.readFile(filePath, 'utf8');
    const cosplayData = JSON.parse(data);

    if (!cosplayData.results || cosplayData.results.length === 0) {
      return res.status(400).json({ error: 'Tidak ada gambar dalam cosplay.json.' });
    }

    // Ambil data acak dari cosplayData
    const randomIndex = Math.floor(Math.random() * cosplayData.results.length);
    const randomCosplay = cosplayData.results[randomIndex];
    
    // Kirim gambar secara langsung menggunakan axios
    const imageUrl = randomCosplay.url;

    // Mendapatkan gambar menggunakan axios dan pipe ke response
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });

    response.data.pipe(res);  // Pipe gambar langsung ke response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Gagal memproses file cosplay.json' });
  }
});

app.get('/anime/akiyama', (req, res) => {
  res.sendFile(path.join(__dirname, 'anime', 'akiyama.json'));
});

app.get('/quotes/galau', (req, res) => {
  res.sendFile(path.join(__dirname, 'quotes', 'galau.json'));
});

app.get('/quotes/motivasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'quotes', 'galau.json'));
});

//=====[ OKECONNECT API ]=====//
app.get('/okeconnect/dana', (req, res) => {
  res.sendFile(path.join(__dirname, 'okeconnect', 'dana.json'));
});

app.get('/okeconnect/godrive', (req, res) => {
  res.sendFile(path.join(__dirname, 'okeconnect', 'godrive.json'));
});

app.get('/okeconnect/ovo', (req, res) => {
  res.sendFile(path.join(__dirname, 'okeconnect', 'ovo.json'));
});



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
    res.json({ status: true, creator: "Rafael", result: data });
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
        res.json({ status: true, creator: "AbiDev", result: qrData });        
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
                // Check if data exists and get the latest transaction
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

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
