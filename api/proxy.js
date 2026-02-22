const http = require('http');

export default function handler(req, res) {
  const url = 'http://live.sinalmycn.com/11000/mpegts'; // O link que deu erro

  http.get(url, (response) => {
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    response.pipe(res);
  }).on('error', (e) => {
    res.status(500).send("Erro no stream: " + e.message);
  });
}
