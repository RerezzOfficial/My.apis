const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
const { terabox, ytdl } = require('./lib/scraper.js');

// Middleware
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Middleware untuk file statis

// Endpoint untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint tambahan
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feature.html'));
});

// API TikTok Downloader
app.get("/api/download/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Parameter URL tidak ditemukan." });

  try {
    const { tiktokdl } = require("tiktokdl");
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json({ error: "Data tidak ditemukan." });

    res.json({ status: true, creator: "Line", result: data });
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// API Terabox Downloader
app.get('/api/download/terabox', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Parameter URL tidak ditemukan." });
    }

    const results = await terabox(url);
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Tidak ada file yang ditemukan." });
    }

    res.status(200).json({
      success: true,
      creator: "Line",
      results,
      request_at: new Date(),
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// API Spotify Downloader
app.get('/api/download/spotify', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Parameter URL tidak ditemukan." });

    const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`);
    const metadata = response.data.metadata;
    const downloadUrl = response.data.download;

    res.status(200).json({
      success: true,
      creator: "Line",
      metadata,
      download: downloadUrl,
    });
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// API YouTube Downloader
app.get('/api/download/ytdl', async (req, res) => {
  try {
    const { url, videoQuality, audioQuality } = req.query;
    if (!url || !videoQuality || !audioQuality) {
      return res.status(400).json({ error: "Parameter tidak lengkap." });
    }

    const videoQualityIndex = parseInt(videoQuality, 10);
    const audioQualityIndex = parseInt(audioQuality, 10);

    const result = await ytdl.downloadVideoAndAudio(url, videoQualityIndex, audioQualityIndex);
    res.status(200).json({ success: true, creator: "Line", result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Penanganan error untuk route yang tidak ditemukan
app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan.");
});

// Penanganan error server
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Terjadi kesalahan pada server.");
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});

module.exports = app;
