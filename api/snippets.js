const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
    let txtPath = path.join(process.cwd(), 'doc.txt');
    if (!fs.existsSync(txtPath)) txtPath = path.join(__dirname, '..', 'doc.txt');

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

    if (req.method === 'GET') {
        if (fs.existsSync(txtPath)) {
            try {
                return res.status(200).json(parseDocText(fs.readFileSync(txtPath, 'utf8')));
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse doc.txt' });
            }
        }
        return res.status(200).json([]);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
