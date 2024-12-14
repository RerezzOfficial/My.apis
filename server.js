const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
const { terabox, ytdl } = require('./lib/scraper.js') 

app.enable("trust proxy");
app.set("json spaces", 2); 
app.use(cors());

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'feature.html'));
});

app.get("/api/download/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json(messages.url);

  try {
  const { tiktokdl } = require("tiktokdl")
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json(messages.notRes);
    res.json({ status: true, creator: "Line", result: data });
  } catch (e) {
    res.status(500).json(messages.error);
  }
});

app.get('/api/download/terabox', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: false,
        creator: " Line",
        error: "Isi Parameter Url.",
      });
    }
    const results = await terabox(url);
    if (!results || results.length === 0) {
      return res.status(404).json({
        status: false,
        creator: "Line",
        error: "No files found or unable to generate download links.",
      });
    }
    return res.status(200).json({
      success: true,
      creator: "Line",
      results: results,
      request_at: new Date(),
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: false,
      creator: "Line",
      error: "Internal server error.",
    });
  }
});

app.get('/api/download/spotify', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: "Line",
        error: "Isi Parameter Url."
      });
    }

    const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`);

    const metadata = response.data.metadata;
    const downloadUrl = response.data.download;

    return res.status(200).json({
      status: true,
      creator: "Line",
      metadata: {
        album_artist: metadata.album_artist,
        album_name: metadata.album_name,
        artist: metadata.artist,
        cover_url: metadata.cover_url,
        name: metadata.name,
        release_date: metadata.releaseDate,
        track_number: metadata.trackNumber,
        spotify_url: metadata.url
      },
      download: downloadUrl
    });
  } catch (e) {
    console.error("Error:", e.message);
    return res.status(500).json({
      status: false,
      creator: "Line", 
      error: "Internal server error."
    });
  }
});

app.get('/api/download/ytdl', async (req, res) => {
  try {
    const { url, videoQuality, audioQuality } = req.query;

    if (!url || !videoQuality || !audioQuality) {
      return res.status(400).json({
        success: false,
        creator: "Line",
        error: "Isi Parameter url, videoQuality, dan audioQuality.",
      });
    }

    const videoQualityIndex = parseInt(videoQuality, 10);
    const audioQualityIndex = parseInt(audioQuality, 10);

    try {
      const result = await ytdl.downloadVideoAndAudio(url, videoQualityIndex, audioQualityIndex);
      return res.status(200).json({
        success: true,
        creator: "Line",
        result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        creator: "Line",
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      creator: "Line",
      error: 'Internal server error.',
    });
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
        
