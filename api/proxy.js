const http = require('http');

export default function handler(req, res) {
  const url = 'http://live.sinalmycn.com/11000/mpegts';

  const request = http.get(url, (response) => {
    // Headers vitais para o navegador aceitar o stream como vídeo
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');

    // Repassa os dados assim que chegam
    response.pipe(res);
  });

  request.on('error', (e) => {
    res.status(500).end();
  });

  // Se o usuário fechar a página, interrompe a busca no servidor original
  req.on('close', () => {
    request.destroy();
  });
}
