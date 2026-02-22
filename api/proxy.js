const http = require('http');

export default function handler(req, res) {
  // O link HTTP que o navegador estava bloqueando
  const url = 'http://live.sinalmycn.com/11000/mpegts';

  http.get(url, (response) => {
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    response.pipe(res);
  }).on('error', (e) => {
    res.status(500).send("Erro ao carregar stream: " + e.message);
  });
}
