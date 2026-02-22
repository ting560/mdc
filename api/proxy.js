const http = require('http');
const https = require('https');

export default function handler(req, res) {
  // Pega a URL que vem do clique no canal
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("URL não fornecida");
  }

  // Escolhe o protocolo certo (http ou https) da fonte
  const client = targetUrl.startsWith('https') ? https : http;

  const request = client.get(targetUrl, (response) => {
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    
    response.pipe(res);
  });

  request.on('error', (e) => {
    res.status(500).end();
  });

  req.on('close', () => {
    request.destroy();
  });
}
