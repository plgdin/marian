/**
 * CLIPFLOW APP LOGIC
 * Powered by pure Javascript, LocalStorage, Clipboard API, and modern event mappers.
 */
/// --- State Variables ---
let snippets = [];
let currentCategory = 'all';
let viewMode = 'grid'; // 'grid' or 'list'
let totalCopies = parseInt(localStorage.getItem('clipflow_total_copies') || '0', 10);
let currentDrawerSnippet = null;

// --- Dom Elements ---
const dom = {
    snippetsContainer: document.getElementById('snippets-container'),
    emptyState: document.getElementById('empty-state'),
    btnLoadDemo: document.getElementById('btn-load-demo'),
    btnClearAll: document.getElementById('btn-clear-all'),
    btnExport: document.getElementById('btn-export'),
    btnAddModal: document.getElementById('btn-add-modal'),
    
    // Stats
    statTotal: document.getElementById('stat-total'),
    statCopies: document.getElementById('stat-copies'),
    
    // Nav
    categoryList: document.getElementById('category-list'),
    activeCategoryTitle: document.getElementById('active-category-title'),
    activeCount: document.getElementById('active-count'),
    countAll: document.getElementById('count-all'),
    
    // Toolbar & Search
    searchInput: document.getElementById('search-input'),
    viewGrid: document.getElementById('view-grid'),
    viewList: document.getElementById('view-list'),
    
    // Dropzone
    dropzone: document.getElementById('file-dropzone'),
    fileInput: document.getElementById('file-input'),
    
    // Modal Edit / Create
    snippetModal: document.getElementById('snippet-modal'),
    snippetForm: document.getElementById('snippet-form'),
    editId: document.getElementById('edit-id'),
    snippetTitle: document.getElementById('snippet-title'),
    snippetCategory: document.getElementById('snippet-category'),
    snippetLanguage: document.getElementById('snippet-language'),
    snippetContent: document.getElementById('snippet-content'),
    modalTitle: document.getElementById('modal-title'),
    categoriesDatalist: document.getElementById('categories-datalist'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    
    // Modal View Detail (Legacy dialog)
    viewerModal: document.getElementById('viewer-modal'),
    viewerTitle: document.getElementById('viewer-title'),
    viewerTag: document.getElementById('viewer-tag'),
    viewerLanguage: document.getElementById('viewer-language'),
    viewerContent: document.getElementById('viewer-content'),
    btnViewerCopy: document.getElementById('btn-viewer-copy'),
    viewerCloseBtn: document.getElementById('viewer-close-btn'),

    // Sliding Right Detail Panel (Drawer format)
    rightDrawer: document.getElementById('right-drawer'),
    drawerTitle: document.getElementById('drawer-title'),
    drawerCategory: document.getElementById('drawer-category'),
    drawerCharCount: document.getElementById('drawer-char-count'),
    drawerLang: document.getElementById('drawer-lang'),
    drawerCodeLang: document.getElementById('drawer-code-lang'),
    drawerContent: document.getElementById('drawer-content'),
    btnDrawerCopy: document.getElementById('btn-drawer-copy'),
    btnDrawerEdit: document.getElementById('btn-drawer-edit'),
    btnDrawerDelete: document.getElementById('btn-drawer-delete'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    
    // Toasts
    toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    
    // Focus search input on "/" key
    window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== dom.searchInput) {
            e.preventDefault();
            dom.searchInput.focus();
            showToast('Search active', 'info', 1000);
        }
    });
});

// --- State & Storage Actions ---
async function loadState() {
    try {
        const response = await fetch('/api/snippets');
        if (response.ok) {
            snippets = await response.json();
            console.log(`Successfully fetched ${snippets.length} snippets from /api/snippets`);
        }
    } catch (e) {
        console.error('Failed to load snippets:', e);
    }
    
    const savedView = localStorage.getItem('clipflow_view_mode');
    if (savedView) {
        viewMode = savedView;
        updateViewToggleButtons();
    }
    
    renderAll();
}

async function saveState() {
    // Keep total copies statistic locally in browser
    localStorage.setItem('clipflow_total_copies', totalCopies);
}

// --- Text Multi-Parser Engine ---
function parseMultiSnippetText(text) {
    const lines = text.split('\n');
    const imported = [];
    let currentTitle = '';
    let currentContent = [];
    let defaultTime = Date.now();

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
            if (!currentTitle && trimmed === '') {
                continue;
            }
            if (!currentTitle) {
                currentTitle = 'Imported Content';
            }
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

function detectLanguage(content) {
    const c = content.trim();
    if (c.startsWith('import ') || c.startsWith('from ') || c.includes('print(') || c.includes('def ')) return 'python';
    if (c.includes('const ') || c.includes('let ') || c.includes('function ') || c.includes('console.log(')) return 'javascript';
    if (c.startsWith('<') && c.endsWith('>')) return 'html';
    if (c.includes('{') && c.includes('}') && (c.includes('margin:') || c.includes('color:'))) return 'css';
    if (c.startsWith('{') && c.endsWith('}')) return 'json';
    return 'text';
}

// --- Import / Seeder ---
function loadWorkspaceSeed() {
    const parsed = parseMultiSnippetText(WORKSPACE_DOC_TXT);
    if (parsed.length > 0) {
        snippets = [...snippets, ...parsed];
        saveState();
        renderAll();
        showToast(`Loaded ${parsed.length} snippets from doc.txt!`, 'success');
    }
}

// --- Clipboard Copy Engine ---
async function copyToClipboard(text, cardElement, snippetTitle) {
    try {
        await navigator.clipboard.writeText(text);
        onCopySuccess(cardElement, snippetTitle);
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            onCopySuccess(cardElement, snippetTitle);
        } catch (e) {
            console.error('Fallback copy failed:', e);
            showToast('Clipboard access denied. Copy manually from the right drawer code block.', 'danger');
        }
        document.body.removeChild(textarea);
    }
}

function onCopySuccess(cardElement, snippetTitle) {
    totalCopies++;
    saveState();
    updateStats();
    
    if (cardElement) {
        cardElement.classList.add('copying');
        const iconContainer = cardElement.querySelector('.card-action-icon');
        const originalHtml = iconContainer.innerHTML;
        iconContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
            cardElement.classList.remove('copying');
            iconContainer.innerHTML = originalHtml;
        }, 800);
    }
    showToast(`Copied: "${snippetTitle}" to clipboard!`, 'success');
}

// --- UI Notification Toasts ---
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'fa-circle-check';
    if (type === 'info') icon = 'fa-circle-info';
    if (type === 'danger') icon = 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// --- Render Engine ---
function renderAll() {
    renderCategorySidebar();
    renderSnippets();
    updateStats();
    updateDatalist();
}

function updateStats() {
    dom.statTotal.textContent = snippets.length;
    dom.statCopies.textContent = totalCopies;
}

function updateDatalist() {
    const categories = new Set(snippets.map(s => s.category).filter(Boolean));
    dom.categoriesDatalist.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        dom.categoriesDatalist.appendChild(option);
    });
}

function renderCategorySidebar() {
    const categories = {};
    snippets.forEach(s => {
        const cat = s.category || 'General';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    const items = dom.categoryList.querySelectorAll('.category-item');
    items.forEach(item => { if (item.getAttribute('data-category') !== 'all') item.remove(); });
    dom.countAll.textContent = snippets.length;
    Object.keys(categories).sort().forEach(cat => {
        const li = document.createElement('li');
        li.className = `category-item ${currentCategory === cat ? 'active' : ''}`;
        li.setAttribute('data-category', cat);
        let icon = 'fa-code';
        const lowCat = cat.toLowerCase();
        if (lowCat.includes('tokenize')) icon = 'fa-scissors';
        else if (lowCat.includes('stem') || lowCat.includes('lemmatiz')) icon = 'fa-leaf';
        else if (lowCat.includes('stopword')) icon = 'fa-filter';
        else if (lowCat.includes('pos') || lowCat.includes('tag')) icon = 'fa-tags';
        else if (lowCat.includes('chunk')) icon = 'fa-puzzle-piece';
        else if (lowCat.includes('ner') || lowCat.includes('entity')) icon = 'fa-id-badge';
        else if (lowCat.includes('concord')) icon = 'fa-search-location';
        else if (lowCat.includes('vocab') || lowCat.includes('count')) icon = 'fa-calculator';
        else if (lowCat.includes('pars')) icon = 'fa-tree';
        else if (lowCat.includes('bag') || lowCat.includes('bow')) icon = 'fa-shopping-bag';
        else if (lowCat.includes('similar')) icon = 'fa-clone';
        else if (lowCat.includes('tf') || lowCat.includes('idf')) icon = 'fa-chart-bar';
        else if (lowCat.includes('chat')) icon = 'fa-comments';
        else if (lowCat.includes('translat')) icon = 'fa-language';
        else if (lowCat.includes('class')) icon = 'fa-folder';
        li.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${cat}</span> <span class="count-badge">${categories[cat]}</span>`;
        li.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            currentCategory = cat;
            renderSnippets();
        });
        dom.categoryList.appendChild(li);
    });
}

function renderSnippets() {
    const searchVal = dom.searchInput.value.toLowerCase().trim();
    let filtered = snippets;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(s => s.category === currentCategory);
    }
    if (searchVal) {
        filtered = filtered.filter(s => 
            s.title.toLowerCase().includes(searchVal) ||
            (s.category && s.category.toLowerCase().includes(searchVal)) ||
            (s.language && s.language.toLowerCase().includes(searchVal)) ||
            s.content.toLowerCase().includes(searchVal)
        );
    }
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    dom.activeCategoryTitle.textContent = currentCategory === 'all' ? 'All Snippets' : currentCategory;
    dom.activeCount.textContent = `(${filtered.length})`;
    if (filtered.length === 0) {
        dom.emptyState.style.display = 'flex';
        dom.snippetsContainer.querySelectorAll('.snippet-card').forEach(el => el.remove());
        return;
    } else {
        dom.emptyState.style.display = 'none';
    }
    if (viewMode === 'list') {
        dom.snippetsContainer.classList.add('list-view');
    } else {
        dom.snippetsContainer.classList.remove('list-view');
    }
    const oldCards = dom.snippetsContainer.querySelectorAll('.snippet-card');
    oldCards.forEach(c => c.remove());
    filtered.forEach(snippet => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.setAttribute('data-id', snippet.id);
        const charCount = snippet.content.length;
        card.innerHTML = `
            <div class="snippet-card-header">
                <div class="snippet-title-group">
                    <span class="snippet-card-tag">${snippet.category || 'General'}</span>
                    <h3 class="snippet-card-title">${escapeHtml(snippet.title)}</h3>
                </div>
                <div class="card-action-icon" title="Single click to Copy & Open Drawer">
                    <i class="fa-regular fa-clipboard"></i>
                </div>
            </div>
            <div class="snippet-card-preview">${escapeHtml(snippet.content)}</div>
            <div class="snippet-card-footer">
                <div class="snippet-meta-info">
                    <span class="snippet-meta-item" title="Character count"><i class="fa-solid fa-paragraph"></i> ${charCount} chars</span>
                    <span class="snippet-meta-item" title="Language mode"><i class="fa-solid fa-code"></i> ${snippet.language.toUpperCase()}</span>
                </div>
                <div class="snippet-card-controls">
                    <button class="btn-card-control ctrl-view" title="Inspect Code Details"><i class="fa-solid fa-eye"></i> Inspect Details</button>
                </div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.snippet-card-controls') || e.target.closest('.btn-card-control')) return;
            copyToClipboard(snippet.content, card, snippet.title);
            openRightDrawer(snippet);
        });
        card.querySelector('.ctrl-view').addEventListener('click', (e) => { e.stopPropagation(); openRightDrawer(snippet); });
        dom.snippetsContainer.appendChild(card);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- Right Sliding Panel (Drawer) Core Routines ---
function openRightDrawer(snippet) {
    currentDrawerSnippet = snippet;
    dom.drawerTitle.textContent = snippet.title;
    dom.drawerCategory.textContent = snippet.category || 'General';
    const charCount = snippet.content.length;
    dom.drawerCharCount.innerHTML = `<i class="fa-solid fa-paragraph"></i> ${charCount} characters`;
    dom.drawerLang.innerHTML = `<i class="fa-solid fa-code"></i> ${snippet.language.toUpperCase()}`;
    dom.drawerCodeLang.textContent = snippet.language.toUpperCase();
    dom.drawerContent.textContent = snippet.content;
    dom.rightDrawer.classList.add('active');
    document.body.classList.add('drawer-open');
}

function closeRightDrawer() {
    dom.rightDrawer.classList.remove('active');
    document.body.classList.remove('drawer-open');
    currentDrawerSnippet = null;
}

// --- CRUD Actions ---
function deleteSnippet(id) {
    const item = snippets.find(s => s.id === id);
    if (!item) return;
    if (confirm(`Are you sure you want to delete the snippet "${item.title}"?`)) {
        snippets = snippets.filter(s => s.id !== id);
        if (currentDrawerSnippet && currentDrawerSnippet.id === id) closeRightDrawer();
        saveState();
        renderAll();
        showToast(`Deleted snippet "${item.title}"`, 'info');
    }
}

function clearAllSnippets() {
    if (snippets.length === 0) {
        showToast('No snippets to clear.', 'info');
        return;
    }
    if (confirm('CRITICAL ACTION: Are you sure you want to permanently clear ALL snippets in this dashboard? This cannot be undone.')) {
        snippets = [];
        closeRightDrawer();
        saveState();
        renderAll();
        showToast('All snippets deleted successfully.', 'danger');
    }
}

function exportBackup() {
    if (snippets.length === 0) {
        showToast('Add or import snippets before exporting!', 'info');
        return;
    }
    const exportBlocks = snippets.map(s => `//${s.title}\n${s.content}\n`);
    const outputText = exportBlocks.join('\n');
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipflow-backup-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    showToast('Backup file generated and downloading!', 'success');
}

// --- Modals Form Handlers ---
function openEditModal(snippet = null) {
    dom.snippetForm.reset();
    if (snippet) {
        dom.modalTitle.textContent = 'Edit Snippet Details';
        dom.editId.value = snippet.id;
        dom.snippetTitle.value = snippet.title;
        dom.snippetCategory.value = snippet.category || 'General';
        dom.snippetLanguage.value = snippet.language;
        dom.snippetContent.value = snippet.content;
    } else {
        dom.modalTitle.textContent = 'Create New Snippet';
        dom.editId.value = '';
        dom.snippetCategory.value = currentCategory === 'all' ? '' : currentCategory;
    }
    dom.snippetModal.classList.add('active');
    dom.snippetTitle.focus();
}

function closeEditModal() { dom.snippetModal.classList.remove('active'); }

function handleFormSubmit(e) {
    e.preventDefault();
    const id = dom.editId.value;
    const title = dom.snippetTitle.value.trim();
    const category = dom.snippetCategory.value.trim() || 'General';
    const language = dom.snippetLanguage.value;
    const content = dom.snippetContent.value;
    if (id) {
        const index = snippets.findIndex(s => s.id === id);
        if (index !== -1) {
            snippets[index] = { ...snippets[index], title, category, language, content };
            if (currentDrawerSnippet && currentDrawerSnippet.id === id) openRightDrawer(snippets[index]);
            showToast(`Updated "${title}"`, 'success');
        }
    } else {
        const newSnippet = { id: 'snip_' + Date.now(), title, category, language, content, copies: 0, createdAt: Date.now() };
        snippets.push(newSnippet);
        showToast(`Created new snippet: "${title}"`, 'success');
    }
    saveState();
    closeEditModal();
    renderAll();
}

// --- Legacy Modal Viewer (Fallback) ---
let currentViewingContent = '';
function openViewerModal(snippet) {
    dom.viewerTitle.textContent = snippet.title;
    dom.viewerTag.textContent = snippet.category || 'General';
    dom.viewerLanguage.textContent = snippet.language.toUpperCase();
    dom.viewerContent.textContent = snippet.content;
    currentViewingContent = snippet.content;
    dom.viewerModal.classList.add('active');
}

function closeViewerModal() { dom.viewerModal.classList.remove('active'); }

// --- Events Setup ---
function setupEventListeners() {
    if (dom.btnLoadDemo) dom.btnLoadDemo.addEventListener('click', loadWorkspaceSeed);
    if (dom.btnClearAll) dom.btnClearAll.addEventListener('click', clearAllSnippets);
    if (dom.btnExport) dom.btnExport.addEventListener('click', exportBackup);
    if (dom.btnAddModal) dom.btnAddModal.addEventListener('click', () => openEditModal());
    if (dom.btnModalCancel) dom.btnModalCancel.addEventListener('click', closeEditModal);
    if (dom.modalCloseBtn) dom.modalCloseBtn.addEventListener('click', closeEditModal);
    if (dom.snippetForm) dom.snippetForm.addEventListener('submit', handleFormSubmit);
    if (dom.viewerCloseBtn) dom.viewerCloseBtn.addEventListener('click', closeViewerModal);
    if (dom.btnViewerCopy) dom.btnViewerCopy.addEventListener('click', () => copyToClipboard(currentViewingContent, null, dom.viewerTitle.textContent));
    if (dom.drawerCloseBtn) dom.drawerCloseBtn.addEventListener('click', closeRightDrawer);
    if (dom.btnDrawerCopy) {
        dom.btnDrawerCopy.addEventListener('click', () => {
            if (currentDrawerSnippet) {
                copyToClipboard(currentDrawerSnippet.content, null, currentDrawerSnippet.title);
                const origHtml = dom.btnDrawerCopy.innerHTML;
                dom.btnDrawerCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                dom.btnDrawerCopy.style.background = 'var(--success-color)';
                dom.btnDrawerCopy.style.borderColor = 'transparent';
                setTimeout(() => { dom.btnDrawerCopy.innerHTML = origHtml; dom.btnDrawerCopy.style.background = ''; dom.btnDrawerCopy.style.borderColor = ''; }, 1000);
            }
        });
    }
    if (dom.btnDrawerEdit) dom.btnDrawerEdit.addEventListener('click', () => { if (currentDrawerSnippet) openEditModal(currentDrawerSnippet); });
    if (dom.btnDrawerDelete) dom.btnDrawerDelete.addEventListener('click', () => { if (currentDrawerSnippet) deleteSnippet(currentDrawerSnippet.id); });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeEditModal(); closeViewerModal(); closeRightDrawer(); }
    });
    if (dom.snippetModal) dom.snippetModal.addEventListener('click', (e) => { if (e.target === dom.snippetModal) closeEditModal(); });
    if (dom.viewerModal) dom.viewerModal.addEventListener('click', (e) => { if (e.target === dom.viewerModal) closeViewerModal(); });
    if (dom.searchInput) dom.searchInput.addEventListener('input', renderSnippets);
    if (dom.viewGrid) dom.viewGrid.addEventListener('click', () => { viewMode = 'grid'; localStorage.setItem('clipflow_view_mode', 'grid'); updateViewToggleButtons(); renderSnippets(); });
    if (dom.viewList) dom.viewList.addEventListener('click', () => { viewMode = 'list'; localStorage.setItem('clipflow_view_mode', 'list'); updateViewToggleButtons(); renderSnippets(); });
    
    const dropzone = dom.dropzone;
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => { dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }, false); });
        ['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }, false); });
        dropzone.addEventListener('drop', (e) => { handleFilesImport(e.dataTransfer.files); });
        dropzone.addEventListener('click', (e) => { if (e.target.closest('#file-input') || e.target.closest('label')) return; dom.fileInput.click(); });
    }
    if (dom.fileInput) dom.fileInput.addEventListener('change', (e) => { handleFilesImport(e.target.files); });
}

function updateViewToggleButtons() {
    if (viewMode === 'list') { dom.viewList.classList.add('active'); dom.viewGrid.classList.remove('active'); }
    else { dom.viewGrid.classList.add('active'); dom.viewList.classList.remove('active'); }
}

// --- Client-side File Parsers & Classifiers ---
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

function detectLanguage(content) {
    const c = content.trim();
    if (c.startsWith('import ') || c.startsWith('from ') || c.includes('print(') || c.includes('def ')) return 'python';
    if (c.includes('const ') || c.includes('let ') || c.includes('function ') || c.includes('console.log(')) return 'javascript';
    if (c.startsWith('<') && c.endsWith('>')) return 'html';
    if (c.includes('{') && c.includes('}') && (c.includes('margin:') || c.includes('color:'))) return 'css';
    if (c.startsWith('{') && c.endsWith('}')) return 'json';
    return 'text';
}

function parseMultiSnippetText(text) {
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

function handleFilesImport(files) {
    if (!files || files.length === 0) return;
    let totalImported = 0;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const hasMultipleSections = text.split('\n').some(line => {
                const tr = line.trim();
                return tr.startsWith('//') || (tr.startsWith('#') && !tr.startsWith('#!'));
            });
            if (hasMultipleSections) {
                const parsed = parseMultiSnippetText(text);
                if (parsed.length > 0) { snippets = [...snippets, ...parsed]; totalImported += parsed.length; }
            } else {
                const title = file.name.replace(/\.[^/.]+$/, "");
                const extension = file.name.split('.').pop() || 'text';
                
                snippets.push({
                    id: 'snip_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    title: title,
                    category: 'Imports',
                    language: detectLanguage(text) || extension,
                    content: text,
                    copies: 0,
                    createdAt: Date.now()
                });
                totalImported += 1;
            }
            
            saveState();
            renderAll();
            showToast(`Imported ${totalImported} snippets from file(s)!`, 'success');
        };
        reader.readAsText(file);
    });
}
