const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const SOURCE_FILE = path.join(__dirname, 'doc.txt');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

function detectCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('pre-process') || t.includes('preprocessing')) return 'Preprocessing';
    if (t.includes('pos') || t.includes('tag')) return 'POS Tagging';
    if (t.includes('ner') || t.includes('entity')) return 'NER';
    if (t.includes('concord')) return 'Concordance';
    if (t.includes('bag') || t.includes('bow')) return 'Bag of Words';
    if (t.includes('tf') || t.includes('idf')) return 'TF-IDF';
    if (t.includes('chat') || t.includes('bot')) return 'Chatbot';
    if (t.includes('class')) return 'Classification';
    return 'General';
}

function parseDocText(text) {
    const lines = text.split('\n');
    const snippets = [];
    let title = '', content = [], ts = Date.now();

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//')) {
            if (title || content.length) {
                const c = content.join('\n').trim();
                if (c) snippets.push({ id: 'snip_' + ts++, title, category: detectCategory(title), language: 'python', content: c, copies: 0, createdAt: ts });
            }
            title = trimmed.replace(/^\/\/\s*/, '').trim();
            content = [];
        } else {
            content.push(line);
        }
    }
    if (title || content.length) {
        const c = content.join('\n').trim();
        if (c) snippets.push({ id: 'snip_' + ts++, title, category: detectCategory(title), language: 'python', content: c, copies: 0, createdAt: ts });
    }
    return snippets;
}

function getSnippets() {
    if (fs.existsSync(SOURCE_FILE)) {
        try { return parseDocText(fs.readFileSync(SOURCE_FILE, 'utf8')); } catch (e) { console.error(e); }
    }
    return [];
}

const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;

    if (pathname === '/api/snippets') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getSnippets()));
        return;
    }

    let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
    filePath = path.join(__dirname, filePath);
    if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
