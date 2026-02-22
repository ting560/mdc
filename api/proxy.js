const http = require('http');
const https = require('https');

export default function handler(req, res) {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send("URL não fornecida");
    }

    const client = targetUrl.startsWith('https') ? https : http;

    // Headers para parecer com um player legítimo e manter a conexão viva
    const options = {
        headers: {
            'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
            'Referer': targetUrl,
            'Connection': 'keep-alive',
            'Icy-MetaData': '1'
        },
        timeout: 30000 // Timeout de 30s para iniciar a conexão
    };

    const request = client.get(targetUrl, options, (response) => {
        // Se o servidor redirecionar (301/302), seguimos oLocation manualmente se necessário,
        // mas o Node costuma seguir automaticamente para GET.
        
        // Headers para o cliente (navegador) não cache
        res.setHeader('Content-Type', 'video/mp2t');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Connection', 'keep-alive');

        // Encaminha o stream
        response.pipe(res);

        // Se o cliente fechar a aba, matamos a request no servidor para liberar recurso
        res.on('close', () => {
            response.destroy();
        });
    });

    request.on('error', (e) => {
        console.error("Erro no proxy:", e.message);
        if (!res.headersSent) res.status(500).end();
    });

    // Tratamento de timeout inicial
    request.on('timeout', () => {
        request.destroy();
        if (!res.headersSent) res.status(504).send("Timeout na fonte");
    });
    
    // Se o cliente cancelar a request
    req.on('close', () => {
        request.destroy();
    });
}
