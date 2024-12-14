const axios = require('axios')
const cheerio = require('cheerio')
const FormData = require('form-data')

async function terabox(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post('https://teradl-api.dapuntaratya.com/generate_file', {
        mode: 1,
        url: url,
      });

      const array = [];
      for (let file of response.data.list) {
        try {
          const downloadResponse = await axios.post('https://teradl-api.dapuntaratya.com/generate_link', {
            js_token: response.data.js_token,
            cookie: response.data.cookie,
            sign: response.data.sign,
            timestamp: response.data.timestamp,
            shareid: response.data.shareid,
            uk: response.data.uk,
            fs_id: file.fs_id,
          });

          if (downloadResponse.data.download_link) {
            array.push({
              fileName: file.name,
              type: file.type,
              thumb: file.image,
              url: downloadResponse.data.download_link.url_1,
            });
          }
        } catch (error) {
          console.error(`Failed to generate download link for ${file.name}:`, error.message);
        }
      }

      resolve(array);
    } catch (error) {
      console.error('Error fetching data from Terabox API:', error.message);
      reject(error.response?.data || { error: 'Unknown error occurred' });
    }
  });
}

const ytdl = {
  supportedQualities: {
    audio: { 1: '32', 2: '64', 3: '128', 4: '192' },
    video: { 1: '144', 2: '240', 3: '360', 4: '480', 5: '720', 6: '1080', 7: '1440', 8: '2160' },
  },

  requestHeaders: {
    accept: '*/*',
    referer: 'https://ytshorts.savetube.me/',
    origin: 'https://ytshorts.savetube.me/',
    'user-agent': 'Downloader/2.0',
    'content-type': 'application/json',
  },

  getRandomCDN() {
    return 50 + Math.floor(Math.random() * 12);
  },

  validateQuality(type, index) {
    if (!this.supportedQualities[type]?.[index]) {
      throw new Error(
        `Invalid quality for ${type}. Available options: ${Object.values(this.supportedQualities[type]).join(', ')}`
      );
    }
  },

  async sendPostRequest(url, cdn, payload = {}) {
    const headers = {
      ...this.requestHeaders,
      authority: `cdn${cdn}.savetube.su`,
    };

    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Request failed:', error.message);
      throw new Error('Failed to fetch data from the server.');
    }
  },

  generateDownloadLink(cdnUrl, type, quality, videoKey) {
    return `https://${cdnUrl}/download`;
  },

  async downloadMedia(videoUrl, type, qualityIndex) {
    const quality = this.supportedQualities[type]?.[qualityIndex];
    if (!quality) throw new Error('Invalid quality index.');

    const cdnNumber = this.getRandomCDN();
    const cdnUrl = `cdn${cdnNumber}.savetube.su`;

    const videoDetails = await this.sendPostRequest(`https://${cdnUrl}/info`, cdnNumber, { url: videoUrl });

    const downloadPayload = {
      downloadType: type,
      quality,
      key: videoDetails.data.key,
    };

    const downloadResponse = await this.sendPostRequest(
      this.generateDownloadLink(cdnUrl, type, quality, videoDetails.data.key),
      cdnNumber,
      downloadPayload
    );

    return {
      link: downloadResponse.data.downloadUrl,
      duration: videoDetails.data.duration,
      durationLabel: videoDetails.data.durationLabel,
      fromCache: videoDetails.data.fromCache,
      id: videoDetails.data.id,
      key: videoDetails.data.key,
      thumbnail: videoDetails.data.thumbnail,
      thumbnail_formats: videoDetails.data.thumbnail_formats,
      title: videoDetails.data.title,
      titleSlug: videoDetails.data.titleSlug,
      videoUrl: videoDetails.data.url,
      quality,
      type,
    };
  },

  async downloadVideoAndAudio(videoUrl, videoQualityIndex, audioQualityIndex) {
    const videoData = await this.downloadMedia(videoUrl, 'video', videoQualityIndex);
    const audioData = await this.downloadMedia(videoUrl, 'audio', audioQualityIndex);

    return {
      video: videoData,
      audio: audioData,
    };
  },
};

module.exports = { terabox, ytdl }
