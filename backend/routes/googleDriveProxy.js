const express = require('express');
const axios = require('axios');
const router = express.Router();
const cheerio = require('cheerio');

// Helper function to get confirmation token from Google Drive download page
async function getConfirmationToken(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const confirmToken = $('a#uc-download-link').attr('href');
    if (confirmToken) {
      const tokenMatch = confirmToken.match(/confirm=([0-9A-Za-z_]+)&/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }
  } catch (error) {
    console.error('Error getting confirmation token:', error.message);
  }
  return null;
}

// Proxy endpoint to fetch Google Drive image by file ID
router.get('/google-drive-image', async (req, res) => {
  const fileId = req.query.id;
  if (!fileId) {
    return res.status(400).send('Missing file ID');
  }

  try {
    // First try direct download URL
    let url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      validateStatus: (status) => status < 400,
    });

    // If response is HTML, it may be a confirmation page for large files
    if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
      // Get confirmation token
      const token = await getConfirmationToken(fileId);
      if (token) {
        url = `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`;
        response = await axios({
          method: 'get',
          url,
          responseType: 'stream',
          validateStatus: (status) => status < 400,
        });
      }
    }

    // Set CORS headers to allow frontend to load image
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type']);

    // Pipe the image stream to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching Google Drive image:', error.message);
    res.status(500).send('Failed to fetch image');
  }
});

module.exports = router;
