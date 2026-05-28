const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
    const method = req.method;
    const dbPath = path.join(process.cwd(), 'snippets.json');
    
    // Check multiple path resolution strategies to guarantee Vercel packages and loads doc.txt
    let txtPath = path.join(process.cwd(), 'doc.txt');
    if (!fs.existsSync(txtPath)) {
        txtPath = path.join(__dirname, '..', 'doc.txt');
    }

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

    // Dynamic parser to seed from doc.txt on the cloud instantly
    function parseDocText(text) {
        const lines = text.split('\n');
        const imported = [];
        let currentTitle = '';
        let currentContent = [];
        let defaultTime = Date.now() - 100000;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith('//') || (trimmed.startsWith('#') && !trimmed.startsWith('#!'))) {
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

    if (method === 'GET') {
        // Read and parse doc.txt dynamically as the absolute single source of truth
        if (fs.existsSync(txtPath)) {
            try {
                const rawText = fs.readFileSync(txtPath, 'utf8');
                const parsed = parseDocText(rawText);
                return res.status(200).json(parsed);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse doc.txt file' });
            }
        }
        return res.status(200).json([]);
    } else if (method === 'POST') {
        return res.status(200).json({
            success: true,
            message: 'Database is in secure read-only presentation mode.'
        });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
