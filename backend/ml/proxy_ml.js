import http from 'http';

// This script ensures that your existing backend code (which looks for ports 8001-8005)
// continues to work even though we consolidated all ML services into port 8000.
// This prevents you from having to change any of your existing Node.js source code.

const ports = {
    8001: '/hospitals',
    8002: '/flights',
    8003: '/visa',
    8004: '/mental',
    8005: '/yoga'
};

Object.entries(ports).forEach(([port, prefix]) => {
    http.createServer((req, res) => {
        // Log proxying in production for debugging if needed
        // console.log(`Proxying port ${port} -> 8000${prefix}${req.url}`);

        const proxyReq = http.request({
            host: 'localhost',
            port: 8000,
            path: prefix + req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        req.pipe(proxyReq);

        proxyReq.on('error', (e) => {
            console.error(`Proxy Error on port ${port}:`, e.message);
            res.statusCode = 502;
            res.end(`ML Service Proxy Error: ${e.message}`);
        });
    }).listen(port, '127.0.0.1', () => {
        console.log(`📡 Port ${port} compatibility proxy active -> 8000${prefix}`);
    });
});
