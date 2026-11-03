const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  // Preview must never connect to the production database, seed it, or execute the Script app.
  if (pathname === '/config.js') { res.setHeader('Content-Type', 'text/javascript'); res.end('window.GOLDEN_CONFIG = {};'); return; }
  if (pathname === '/app.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(''); return; }
  if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp4': 'video/mp4' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(4174, '127.0.0.1');
