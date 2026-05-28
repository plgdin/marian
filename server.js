const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const DATA_FILE = path.join(__dirname, 'snippets.json');
const SOURCE_FILE = path.join(__dirname, 'doc.txt');

// Simple content-type mapper for serving static assets
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

// Simple text category detector
function detectCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('tokenize') || t.includes('word') || t.includes('sentence')) return 'Tokenize';
    if (t.includes('stem')) return 'Stemming';
    if (t.includes('lemmatiz')) return 'Lemmatization';
    if (t.includes('stopword') || t.includes('filter')) return 'Stopwords';
    if (t.includes('pos') || t.includes('tag')) return 'POS Tagging';
    if (t.includes('chunk')) return 'Chunking';
    if (t.includes('ner') || t.includes('entity') || t.includes('name')) return 'NER';
    if (t.includes('concord')) return 'Concordance';
    if (t.includes('count') || t.includes('vocab')) return 'Vocabulary';
    if (t.includes('pars')) return 'Parsing';
    if (t.includes('bag') || t.includes('bow')) return 'Bag of Words';
    if (t.includes('similar') || t.includes('match')) return 'Similarity';
    if (t.includes('tf') || t.includes('idf')) return 'TF-IDF';
    if (t.includes('chat') || t.includes('bot') || t.includes('agent')) return 'Chatbot';
    if (t.includes('translat')) return 'Translation';
    if (t.includes('class')) return 'Classification';
    return 'General';
}

// Simple language detector
function detectLanguage(content) {
    const c = content.trim();
    if (c.startsWith('import ') || c.startsWith('from ') || c.includes('print(') || c.includes('def ')) return 'python';
    if (c.includes('const ') || c.includes('let ') || c.includes('function ') || c.includes('console.log(')) return 'javascript';
    if (c.startsWith('<') && c.endsWith('>')) return 'html';
    if (c.includes('{') && c.includes('}') && (c.includes('margin:') || c.includes('color:'))) return 'css';
    if (c.startsWith('{') && c.endsWith('}')) return 'json';
    return 'text';
}

// Custom parser to split doc.txt into structured snippets on the fly
function parseDocText(text) {
    const lines = text.split('\n');
    const imported = [];
    let currentTitle = '';
    let currentContent = [];
    let defaultTime = Date.now() - 100000; // Offset to separate creation dates

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if comment separator (// or #)
        if (trimmed.startsWith('//') || (trimmed.startsWith('#') && !trimmed.startsWith('#!'))) {
            // Save previous
            if (currentTitle || currentContent.length > 0) {
                const contentStr = currentContent.join('\n').trim();
                if (contentStr) {
                    imported.push({
                        id: 'snip_' + defaultTime + '_' + Math.floor(Math.random() * 100000),
                        title: currentTitle || 'Untitled Snippet',
                        category: currentTitle ? detectCategory(currentTitle) : 'General',
                        language: detectLanguage(contentStr),
                        content: contentStr,
                        copies: 0,
                        createdAt: defaultTime++
                    });
                }
            }
            currentTitle = trimmed.replace(/^[\/\#\s]+/, '').trim();
            currentContent = [];
        } else {
            if (!currentTitle && trimmed === '') continue;
            if (!currentTitle) currentTitle = 'Imported Content';
            currentContent.push(line);
        }
    }

    if (currentTitle || currentContent.length > 0) {
        const contentStr = currentContent.join('\n').trim();
        if (contentStr) {
            imported.push({
                id: 'snip_' + defaultTime + '_' + Math.floor(Math.random() * 100000),
                title: currentTitle || 'Untitled Snippet',
                category: currentTitle ? detectCategory(currentTitle) : 'General',
                language: detectLanguage(contentStr),
                content: contentStr,
                copies: 0,
                createdAt: defaultTime
            });
        }
    }
    return imported;
}

// Core database controller (Parses doc.txt directly as single source of truth)
function getSnippets() {
    if (fs.existsSync(SOURCE_FILE)) {
        try {
            const rawText = fs.readFileSync(SOURCE_FILE, 'utf8');
            return parseDocText(rawText);
        } catch (e) {
            console.error('Failed to parse doc.txt:', e);
        }
    }
    return [];
}

// Server request handler routing static assets and REST API endpoints
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

    // REST API endpoints
    if (pathname === '/api/snippets') {
        if (method === 'GET') {
            const data = getSnippets();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            return;
        } else if (method === 'POST') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Snippets database is in secure read-only presentation mode.' }));
            return;
        }
    }

    // Static assets file serving
    let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
    filePath = path.join(__dirname, filePath);

    // Safeguard directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 ClipFlow Dashboard Server running at:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`📝 Persistence file: ${DATA_FILE}`);
    console.log(`==================================================`);
});
