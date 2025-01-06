
const express = require('express');
const cors = require('cors');
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

// API untuk cosplay.json
app.get('/anime/cosplay', (req, res) => {
  res.sendFile(path.join(__dirname, 'anime', 'cosplay.json'));
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



app.get('/api/bocil', (req, res) => {
  // Lokasi file bocil.json
  const filePath = path.join(__dirname, 'nsfw', 'bocil.json');

  // Membaca file bocil.json
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error membaca file bocil.json:', err);
      return res.status(500).json({ error: 'Gagal membaca file bocil.json' });
    }

    try {
      // Parse JSON untuk mendapatkan array video
      const bocilData = JSON.parse(data);
      const videos = bocilData.randomBocil; // Pastikan struktur data sesuai dengan bocil.json
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];

      // Mengirimkan HTML dengan video acak sebagai background
      res.send(`
        <html>
          <head>
            <title>Video Acak Sebagai Background</title>
            <style>
              body {
                margin: 0;
                height: 100vh;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-family: Arial, sans-serif;
                position: relative;
              }
              video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: -1; /* Agar video di belakang konten */
              }
              h1 {
                z-index: 1;
                font-size: 3rem;
              }
            </style>
          </head>
          <body>
            <video autoplay muted loop>
              <source src="${randomVideo}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <h1>Video Acak sebagai Background</h1>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Gagal memproses file bocil.json' });
    }
  });
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
