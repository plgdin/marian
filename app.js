/**
 * NLP Lab Programs — Minimal Snippet List
 * Click a card to copy its code to clipboard.
 */

const listEl = document.getElementById('snippet-list');
const toastEl = document.getElementById('toast-container');

document.addEventListener('DOMContentLoaded', async () => {
    let snippets = [];
    try {
        const res = await fetch('/api/snippets');
        if (res.ok) snippets = await res.json();
    } catch (e) {
        console.error('Failed to load snippets:', e);
    }
    render(snippets);
});

function render(snippets) {
    listEl.innerHTML = '';
    if (snippets.length === 0) {
        listEl.innerHTML = '<p style="color:#555;text-align:center;padding:40px 0;">No snippets found.</p>';
        return;
    }
    snippets.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <div class="snippet-info">
                <span class="snippet-number">${i + 1}.</span>
                <span class="snippet-title">${esc(s.title)}</span>
            </div>
            <span class="snippet-badge">${esc(s.category || 'General')}</span>
            <span class="copy-icon">📋</span>
        `;
        card.addEventListener('click', () => copySnippet(s.content, s.title, card));
        listEl.appendChild(card);
    });
}

async function copySnippet(text, title, card) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }
    card.classList.add('copied');
    card.querySelector('.copy-icon').textContent = '✅';
    // Close the browser tab after a brief moment
    setTimeout(() => {
        window.close();
        window.open('', '_self', '');
        window.close();
        window.location.href = 'about:blank';
    }, 150);
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast toast-success';
    t.textContent = msg;
    toastEl.appendChild(t);
    setTimeout(() => {
        t.classList.add('toast-out');
        t.addEventListener('animationend', () => t.remove());
    }, 2000);
}

function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
