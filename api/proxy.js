const http = require('http');

export default function handler(req, res) {
  // A URL real do vídeo (ajuste se o link mudou)
  const url = 'http://live.sinalmycn.com/11000/mpegts';

  http.get(url, (response) => {
    // Copia os headers importantes da origem
    res.setHeader('Content-Type', 'video/mp2t'); 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Repassa o vídeo em tempo real
    response.pipe(res);
  }).on('error', (e) => {
    console.error("Erro no Proxy:", e.message);
    res.status(500).send("Erro ao carregar stream");
  });
}
