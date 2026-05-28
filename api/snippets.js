import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const method = req.method;
    const dbPath = path.join(process.cwd(), 'snippets.json');
    const txtPath = path.join(process.cwd(), 'doc.txt');

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
        // Try reading snippets.json first
        if (fs.existsSync(dbPath)) {
            try {
                const raw = fs.readFileSync(dbPath, 'utf8');
                return res.status(200).json(JSON.parse(raw));
            } catch (e) {
                // fallback
            }
        }

        // Try reading doc.txt dynamically
        if (fs.existsSync(txtPath)) {
            try {
                const rawText = fs.readFileSync(txtPath, 'utf8');
                const parsed = parseDocText(rawText);
                return res.status(200).json(parsed);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse seed file' });
            }
        }

        return res.status(200).json([]);
    } else if (method === 'POST') {
        // Vercel serverless has a read-only disk environment.
        // We acknowledge the POST data, return a success status, while client-side
        // localStorage stores the data in active memory so the UX remains fully functional.
        const snippets = req.body;
        return res.status(200).json({
            success: true,
            message: 'Data received in serverless cloud. LocalStorage will persist local modifications in browser.',
            count: Array.isArray(snippets) ? snippets.length : 0
        });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
