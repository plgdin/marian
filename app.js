/**
 * CLIPFLOW APP LOGIC
 * Powered by pure Javascript, LocalStorage, Clipboard API, and modern event mappers.
 */

// --- Workspace Seed Data (Pre-parsed doc.txt contents) ---
const WORKSPACE_DOC_TXT = `//Tokenize 
import nltk
nltk.download('punkt')
print(nltk.word_tokenize("This is an, example sentence for nltk"))


//Stemming
from nltk.stem import *
s=PorterStemmer()
l=WordNetLemmatizer()
w1="running";w2="corpora"
print("original word:",w1)
print("stemmed word:",s.stem(w1))
print("original word:",w2)
print("lemmatized word:",l.lemmatize(w2))

//lemmatization
from nltk.stem import WordNetLemmatizer
w="running"
print("original word:",w)
print("lemmatized word:",WordNetLemmatizer().lemmatize(w,pos='v'))

//Stopwords
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
s="This is a sample sentence, showing off the stop words filtration."
f=' '.join([i for i in s.split() if i.lower() not in stopwords.words('english')])
print("original sentence:",s)
print("filtered sentence:",f)

//pos
import nltk
s="The boy is playing football"
print(nltk.pos_tag(nltk.word_tokenize(s)))


//chunking
import nltk
s="The little boy is playing football"
p=nltk.pos_tag(nltk.word_tokenize(s))
print(nltk.RegexpParser("NP:{<DT>?<JJ>*<NN>}").parse(p))

//NER
import nltk
s="Barack Obama was born in Hawaii"
print(nltk.ne_chunk(nltk.pos_tag(nltk.word_tokenize(s))))


//concordance
import nltk
nltk.download('punkt')
t=nltk.word_tokenize("fat cat sat on a big red mat with a hat")
def c(w):
 for i,x in enumerate(t):
  if x==w:print(f"index:{i}, Context:{' '.join(t[max(0,i-5):i+6])}")
c("cat")
c("with")




//counting vocabulary

//how many words in given text
import nltk
nltk.download('punkt')
print("Number of words (tokens) is text is",len(nltk.word_tokenize("This is a sample text to count the number of words. It contains multiple sentences and punctuations")))

//how many different words/types in given text
import nltk
nltk.download('punkt')
t="This is a sample text with some repeated words to demonstrate counting unique words in the sample text"
print("No of unique words is:",len(set(nltk.word_tokenize(t))))

//how many times does the word "the" occurs
import nltk
nltk.download('punkt')
t="This is the text we will use to count how many times the word the appears. The more the merrier!"
print("the word 'the' appears",nltk.word_tokenize(t).count("the"),"times in the text")

//percentage of target word
import nltk
nltk.download('punkt')
t="This is the text we shall use to count how many times the word appears in the text"
w=nltk.word_tokenize(t)
c=w.count("the")
print("Target words- the appears",c,"times in the text")
print("This is",(c/len(w))*100,"% of all the words in the text")



//Pre-processing
from nltk.tokenize import *
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string

t="Hello, how are you? I'm doing well, thank you!"
w=word_tokenize(t)

print("Words:",w)
print("Sentences:",sent_tokenize(t))
print("Lower Casing:",t.lower())
print("No punctuation:",t.translate(str.maketrans('','','.,?!')))
print("Stop word removed:",[i for i in w if i.lower() not in stopwords.words('english')])
print("Lemmatized word:",WordNetLemmatizer().lemmatize("running",pos='v'))

//contsituency parsing
from nltk import *
g=CFG.fromstring("""
S -> NP VP
PP -> P NP
NP -> Det N | Det N PP | 'i'
VP -> V NP | V NP PP | VP PP
Det -> 'an' | 'my'
N -> 'elephant' | 'pajamas'
V -> 'shot'
P -> 'in'
""")
s=word_tokenize("I shot an elephant in my pajamas".lower())
for i in ChartParser(g).parse(s):print(i)

//problemistic parsing
from nltk import *
g=PCFG.fromstring("""
S -> NP VP [1.0]
PP -> P NP [1.0]
NP -> Det N [0.5] | Det N PP [0.25] | 'i' [0.25]
VP -> V NP [0.5] | VP PP [0.5]
Det -> 'an' [0.5] | 'my' [0.5]
N -> 'elephant' [0.5] | 'pajamas' [0.5]
V -> 'shot' [1.0]
P -> 'in' [1.0]
""")
for i in ViterbiParser(g).parse("i shot an elephant in my pajamas".split()):print(i)


//bag of words
from sklearn.feature_extraction.text import CountVectorizer
c=["This is the first document","This document is the second document","And this is the third one","Is this the first document?"]
x=CountVectorizer().fit_transform(c)
print("Bag of Words(bow)matirx:")
print(x.toarray())
print("\\n Feature:")
print(CountVectorizer().fit(c).get_feature_names_out())



//similarity of sentence

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

s="I want to learn Python Programming.".lower()
f=open("sentence.txt").readlines()
x=CountVectorizer().fit_transform([s]+f)
print("Most similar sentence:",f[cosine_similarity(x)[0][1:].argmax()].strip())




//NER
import nltk
from nltk import *

t="Apple is planning to build a new office in San Francisco and hire 100 employees"
for i in ne_chunk(pos_tag(word_tokenize(t))):
    if isinstance(i,nltk.tree.Tree):
        print("Entity:"," ".join([w for w,p in i]),"| Label:",i.label())




//TF IDF

import math
from collections import Counter

d=["python is program","machine is fun fun","python is machine"]
N=len(d)
tf={}
for i in d:
 w=i.split();c=Counter(w)
 for j in c:tf[j]=tf.get(j,0)+c[j]/len(w)

idf={}
for w in set(" ".join(d).split()):
 idf[w]=math.log(N/sum(w in i.split() for i in d))

print("TF-IDF values of each word in the document:")
for w in tf:
 print(f"{w}: {tf[w]/N*idf[w]:.4f}")





//postagging

import numpy as np
class H:
 def train(s,c):
  s.st={};s.ob={}
  for x in c:
   for w,t in x:
    if t not in s.st:s.st[t]=len(s.st)
    if w not in s.ob:s.ob[w]=len(s.ob)
  n,m=len(s.st),len(s.ob)
  s.tr=np.zeros((n,n));s.em=np.zeros((n,m));st=np.zeros(n)
  for x in c:
   p=None
   for w,t in x:
    i,j=s.st[t],s.ob[w]
    if p==None:st[i]+=1
    else:s.tr[s.st[p]][i]+=1
    s.em[i][j]+=1;p=t
  s.sp=st/st.sum()
  s.tr/=np.where(s.tr.sum(1,keepdims=1)==0,1,s.tr.sum(1,keepdims=1))
  s.em/=np.where(s.em.sum(1,keepdims=1)==0,1,s.em.sum(1,keepdims=1))
 def predict(s,a):
  T,N=len(a),len(s.st)
  d=np.zeros((T,N));p=np.zeros((T,N),int);l=list(s.st)
  w=s.ob.get(a[0])
  for j in range(N):d[0,j]=s.sp[j] if w==None else s.sp[j]*s.em[j,w]
  for t in range(1,T):
   w=s.ob.get(a[t])
   for j in range(N):
    x=d[t-1]*s.tr[:,j]
    p[t,j]=np.argmax(x)
    d[t,j]=np.max(x) if w==None else np.max(x)*s.em[j,w]
  b=[np.argmax(d[T-1])]
  for t in range(T-2,-1,-1):b=[p[t+1,b[0]]]+b
  return list(zip(a,[l[i] for i in b]))
c=[[("The","DET"),("cat","NOUN"),("runs","VERB")],[("A","DET"),("dog","NOUN"),("barks","VERB")]]
h=H();h.train(c)
print(h.predict(["The","dog","runs"]))




//chatbot

import random
r={
"hi":["Hello!","Hi There!","Hey!"],
"how are you?":["I'm good thank you!","Feeling great,thanks for asking!","I'm doing fine."],
"what's your name?":["I'm a chatbot.","You can call me chatbot","My name is chatbot."],
"bye":["Goodbye!","ByeBye!","See you later!"],
"default":["Sorry, I didnt understand that.","Could you please rephrase that?","I'm not sure what you mean."]
}

print("Chatbot: Hi, I'm a chatbot. How can i help you?")
while 1:
 u=input("You: ").lower().strip()
 if u=="exit":
  print("Chatbot: Goodbye!")
  break
 print("Chatbot:",random.choice(r.get(u,r["default"])))



//language translator  

from transformers import MarianMTModel,MarianTokenizer

m='Helsinki-NLP/opus-mt-en-fr'
t=MarianTokenizer.from_pretrained(m)
model=MarianMTModel.from_pretrained(m)

x=t("Hello,how are you?",return_tensors="pt")
y=model.generate(**x)

print("Translated Text:",t.decode(y[0],skip_special_tokens=True))



//text classification

from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import *

c=['alt.atheism','soc.religion.christian','comp.graphics','sci.med']
d=fetch_20newsgroups(subset='all',categories=c,shuffle=1,random_state=42)

x1,x2,y1,y2=train_test_split(d.data,d.target,test_size=0.2,random_state=42)

v=TfidfVectorizer(stop_words='english',max_features=1000)
x1=v.fit_transform(x1)
x2=v.transform(x2)

x1,xv,y1,yv=train_test_split(x1,y1,test_size=0.2,random_state=42)

m=MultinomialNB()
m.fit(x1,y1)

p=m.predict(xv)
print("Validation Accuracy:",accuracy_score(yv,p))
print("\\nClassification Report (Validation Set):")
print(classification_report(yv,p,target_names=d.target_names))

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
    let loadedFromApi = false;
    
    // 1. Try to load from server endpoint
    try {
        const response = await fetch('/api/snippets');
        if (response.ok) {
            snippets = await response.json();
            loadedFromApi = true;
        }
    } catch (e) {
        console.warn('REST API server not found or down. Utilizing localStorage fallback.');
    }

    // 2. Fallback to localStorage
    if (!loadedFromApi) {
        const saved = localStorage.getItem('clipflow_snippets');
        if (saved) {
            try {
                snippets = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved snippets:', e);
                snippets = [];
            }
        }
    }
    
    const savedView = localStorage.getItem('clipflow_view_mode');
    if (savedView) {
        viewMode = savedView;
        updateViewToggleButtons();
    }
    
    renderAll();
}

async function saveState() {
    // Save locally
    localStorage.setItem('clipflow_snippets', JSON.stringify(snippets));
    localStorage.setItem('clipflow_total_copies', totalCopies);
    
    // Push sync to server API
    try {
        await fetch('/api/snippets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(snippets)
        });
    } catch (e) {
        console.warn('Could not sync snippets to workspace storage. Offline mode maintained.');
    }
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
                    <button class="btn-card-control ctrl-view" title="Inspect Code Details"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-card-control ctrl-edit" title="Edit Title/Content"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-card-control ctrl-delete" title="Delete Snippet"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.snippet-card-controls') || e.target.closest('.btn-card-control')) return;
            copyToClipboard(snippet.content, card, snippet.title);
            openRightDrawer(snippet);
        });
        card.querySelector('.ctrl-view').addEventListener('click', (e) => { e.stopPropagation(); openRightDrawer(snippet); });
        card.querySelector('.ctrl-edit').addEventListener('click', (e) => { e.stopPropagation(); openEditModal(snippet); });
        card.querySelector('.ctrl-delete').addEventListener('click', (e) => { e.stopPropagation(); deleteSnippet(snippet.id); });
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
    dom.btnLoadDemo.addEventListener('click', loadWorkspaceSeed);
    dom.btnClearAll.addEventListener('click', clearAllSnippets);
    dom.btnExport.addEventListener('click', exportBackup);
    dom.btnAddModal.addEventListener('click', () => openEditModal());
    dom.btnModalCancel.addEventListener('click', closeEditModal);
    dom.modalCloseBtn.addEventListener('click', closeEditModal);
    dom.snippetForm.addEventListener('submit', handleFormSubmit);
    dom.viewerCloseBtn.addEventListener('click', closeViewerModal);
    dom.btnViewerCopy.addEventListener('click', () => copyToClipboard(currentViewingContent, null, dom.viewerTitle.textContent));
    dom.drawerCloseBtn.addEventListener('click', closeRightDrawer);
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
    dom.btnDrawerEdit.addEventListener('click', () => { if (currentDrawerSnippet) openEditModal(currentDrawerSnippet); });
    dom.btnDrawerDelete.addEventListener('click', () => { if (currentDrawerSnippet) deleteSnippet(currentDrawerSnippet.id); });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeEditModal(); closeViewerModal(); closeRightDrawer(); }
    });
    dom.snippetModal.addEventListener('click', (e) => { if (e.target === dom.snippetModal) closeEditModal(); });
    dom.viewerModal.addEventListener('click', (e) => { if (e.target === dom.viewerModal) closeViewerModal(); });
    dom.searchInput.addEventListener('input', renderSnippets);
    dom.viewGrid.addEventListener('click', () => { viewMode = 'grid'; localStorage.setItem('clipflow_view_mode', 'grid'); updateViewToggleButtons(); renderSnippets(); });
    dom.viewList.addEventListener('click', () => { viewMode = 'list'; localStorage.setItem('clipflow_view_mode', 'list'); updateViewToggleButtons(); renderSnippets(); });
    const dropzone = dom.dropzone;
    ['dragenter', 'dragover'].forEach(eventName => { dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }, false); });
    ['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }, false); });
    dropzone.addEventListener('drop', (e) => { handleFilesImport(e.dataTransfer.files); });
    dom.fileInput.addEventListener('change', (e) => { handleFilesImport(e.target.files); });
    dropzone.addEventListener('click', (e) => { if (e.target.closest('#file-input') || e.target.closest('label')) return; dom.fileInput.click(); });
}

function updateViewToggleButtons() {
    if (viewMode === 'list') { dom.viewList.classList.add('active'); dom.viewGrid.classList.remove('active'); }
    else { dom.viewGrid.classList.add('active'); dom.viewList.classList.remove('active'); }
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
