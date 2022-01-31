// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
                res.end();
            }
        } else {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    res.writeHead(500);
                    res.end(`Error getting file stats: ${err.code} ..\n`);
                    res.end();
                } else {
                    const lastModified = stats.mtime.toUTCString();
                    const etag = stats.size.toString(16) + '-' + Date.parse(stats.mtime).toString(16);
                    const range = req.headers.range;

                    if (range) {
                        const positions = range.replace(/bytes=/, "").split("-");
                        const start = parseInt(positions[0], 10);
                        const total = stats.size;
                        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                        const chunksize = (end - start) + 1;

                        res.writeHead(206, {
                            'Content-Range': `bytes ${start}-${end}/${total}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunksize,
                            'Content-Type': contentType,
                            'Last-Modified': lastModified,
                            'ETag': etag,
                            'Cross-Origin-Embedder-Policy': 'require-corp',
                            'Cross-Origin-Opener-Policy': 'same-origin'
                        });
                        const file = fs.createReadStream(filePath, { start, end });
                        file.pipe(res);
                    } else {
                        res.writeHead(200, {
                            'Content-Type': contentType,
                            'Last-Modified': lastModified,
                            'ETag': etag,
                            'Cross-Origin-Embedder-Policy': 'require-corp',
                            'Cross-Origin-Opener-Policy': 'same-origin'
                        });
                        res.end(content, 'utf-8');
                    }
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const alias of iface) {
            if (alias.family === 'IPv4' || alias.family === 'IPv6') {
                addresses.push(`http://${alias.address}:${PORT}/`);
            }
        }
    }

    console.log('Listening on:');
    addresses.forEach(address => console.log('  ' + address));
});