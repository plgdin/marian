import os
import sys
import json
import re
import subprocess

# --- Terminal ANSI Color Codes for Premium Aesthetics ---
CLR_PURPLE = "\033[38;5;141m"
CLR_CYAN = "\033[38;5;51m"
CLR_GREEN = "\033[38;5;84m"
CLR_RED = "\033[38;5;203m"
CLR_YELLOW = "\033[38;5;220m"
CLR_MUTED = "\033[38;5;244m"
CLR_BOLD = "\033[1m"
CLR_RESET = "\033[0m"

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "snippets.json")
TXT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "doc.txt")

def show_banner():
    banner = f"""{CLR_PURPLE}{CLR_BOLD}
    ____ _ _       _____ _
   / ___| (_)     |  ___| | ___ _      __
  | |   | | |  _  | |_  | |/ _ \\ \\ /\\ / /
  | |___| | | (_) |  _| | | (_) \\ V  V /
   \\____|_|_|     |_|   |_|\\___/ \\_/\\_/
{CLR_CYAN}   --- Visual Snippet Clipboard Dashboard CLI & Backend Sync (v1.0) ---{CLR_RESET}
"""
    try:
        print(banner)
    except Exception:
        print("=== ClipFlow Dashboard CLI & Backend Sync v1.0 ===")

def detect_category(title):
    t = title.lower()
    if 'pre-process' in t or 'preprocessing' in t: return 'Preprocessing'
    if 'pos' in t or 'tag' in t: return 'POS Tagging'
    if 'ner' in t or 'entity' in t or 'name' in t: return 'NER'
    if 'concord' in t: return 'Concordance'
    if 'bag' in t or 'bow' in t: return 'Bag of Words'
    if 'tf' in t or 'idf' in t: return 'TF-IDF'
    if 'chat' in t or 'bot' in t or 'agent' in t: return 'Chatbot'
    if 'class' in t: return 'Classification'
    return 'General'

def detect_language(content):
    c = content.strip()
    if c.startswith('import ') or c.startswith('from ') or 'print(' in c or 'def ' in c: return 'python'
    if 'const ' in c or 'let ' in c or 'function ' in c or 'console.log(' in c: return 'javascript'
    if c.startswith('<') and c.endswith('>'): return 'html'
    if '{' in c and '}' in c and ('margin:' in c or 'color:' in c): return 'css'
    if c.startswith('{') and c.endswith('}'): return 'json'
    return 'text'

def parse_doc_txt():
    """Fallback parser to segment doc.txt directly if json database isn't built yet."""
    if not os.path.exists(TXT_FILE):
        return []
        
    try:
        with open(TXT_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"{CLR_RED}Error reading doc.txt: {e}{CLR_RESET}")
        return []

    imported = []
    current_title = ""
    current_content = []

    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith("//") or (trimmed.startswith("#") and not trimmed.startswith("#!")):
            if current_title or current_content:
                content_str = "".join(current_content).strip()
                if content_str:
                    imported.append({
                        "title": current_title or "Untitled Snippet",
                        "category": detect_category(current_title) if current_title else "General",
                        "language": detect_language(content_str),
                        "content": content_str
                    })
            current_title = re.sub(r'^[\/\#\s]+', '', trimmed).strip()
            current_content = []
        else:
            if not current_title and trimmed == "":
                continue
            if not current_title:
                current_title = "Imported Content"
            current_content.append(line)

    if current_title or current_content:
        content_str = "".join(current_content).strip()
        if content_str:
            imported.append({
                "title": current_title or "Untitled Snippet",
                "category": detect_category(current_title) if current_title else "General",
                "language": detect_language(content_str),
                "content": content_str
            })
    return imported

def load_snippets():
    # 1. Try to load json database
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass # fallback to doc.txt parsing
            
    # 2. Fallback to dynamic doc.txt parsing
    if os.path.exists(TXT_FILE):
        return parse_doc_txt()
        
    return []

def copy_to_clipboard(text):
    """Pipes content into native clip.exe for zero-dependency high reliability clipboard copy on Windows."""
    try:
        # Zero-dependency, doesn't flash a cmd window, handles wide character encodings smoothly
        p = subprocess.Popen(['clip.exe'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
        p.communicate(input=text)
        return True
    except Exception as e:
        # PowerShell Fallback injection just in case
        try:
            escaped = text.replace('"', '`"').replace('$', '`$')
            subprocess.run(['powershell.exe', '-Command', f'Set-Clipboard -Value "{escaped}"'], check=True)
            return True
        except Exception:
            return False

def show_help():
    print(f"{CLR_BOLD}USAGE COMMANDS:{CLR_RESET}")
    print(f"  {CLR_CYAN}python clip.py list{CLR_RESET}             List all available snippets and their titles")
    print(f"  {CLR_CYAN}python clip.py search <query>{CLR_RESET}   Search snippets matching keywords")
    print(f"  {CLR_CYAN}python clip.py show <number>{CLR_RESET}    Display full contents of a snippet by its index")
    print(f"  {CLR_CYAN}python clip.py copy <number>{CLR_RESET}    Copy snippet contents directly to system clipboard")
    print(f"\n{CLR_BOLD}EXAMPLES:{CLR_RESET}")
    print(f"  python clip.py list")
    print(f"  python clip.py search tokenize")
    print(f"  python clip.py show 3")
    print(f"  python clip.py copy 12\n")

def cmd_list(snippets):
    if not snippets:
        print(f"{CLR_YELLOW}No snippets loaded. Run your Node.js server or ensure doc.txt exists in the workspace.{CLR_RESET}")
        return
        
    print(f"{CLR_BOLD}AVAILABLE SNIPPETS ({len(snippets)} total):{CLR_RESET}\n")
    for i, s in enumerate(snippets, start=1):
        cat = s.get("category", "General")
        title = s.get("title", "Untitled")
        print(f"  {CLR_PURPLE}{i:2d}.{CLR_RESET}  [{CLR_CYAN}{cat.upper():13s}{CLR_RESET}]  {CLR_BOLD}{title}{CLR_RESET}")
    print(f"\n{CLR_MUTED}Tip: Run 'python clip.py copy <number>' to copy snippet code directly to clipboard.{CLR_RESET}\n")

def cmd_search(snippets, query):
    if not snippets:
        print(f"{CLR_YELLOW}No snippets to search.{CLR_RESET}")
        return
        
    query_low = query.lower()
    matches = []
    
    for i, s in enumerate(snippets, start=1):
        if (query_low in s.get("title", "").lower() or 
            query_low in s.get("category", "").lower() or 
            query_low in s.get("content", "").lower()):
            matches.append((i, s))
            
    if not matches:
        print(f"{CLR_YELLOW}No snippets matched query '{query}'.{CLR_RESET}")
        return
        
    print(f"{CLR_BOLD}FOUND {len(matches)} MATCHES:{CLR_RESET}\n")
    for idx, s in matches:
        cat = s.get("category", "General")
        title = s.get("title", "Untitled")
        print(f"  {CLR_PURPLE}{idx:2d}.{CLR_RESET}  [{CLR_CYAN}{cat.upper():13s}{CLR_RESET}]  {CLR_BOLD}{title}{CLR_RESET}")
    print("")

def cmd_show(snippets, index_str):
    try:
        idx = int(index_str)
    except ValueError:
        print(f"{CLR_RED}Error: Index must be a valid number.{CLR_RESET}")
        return
        
    if idx < 1 or idx > len(snippets):
        print(f"{CLR_RED}Error: Index {idx} is out of bounds (1-{len(snippets)}).{CLR_RESET}")
        return
        
    s = snippets[idx - 1]
    title = s.get("title", "Untitled")
    cat = s.get("category", "General")
    lang = s.get("language", "text")
    content = s.get("content", "")
    
    print(f"{CLR_MUTED}======================================================================{CLR_RESET}")
    print(f" {CLR_BOLD}{title.upper()}{CLR_RESET}  [{CLR_CYAN}Category: {cat}{CLR_RESET}]  [{CLR_PURPLE}Lang: {lang.upper()}{CLR_RESET}]")
    print(f"{CLR_MUTED}======================================================================{CLR_RESET}")
    print(content)
    print(f"{CLR_MUTED}======================================================================{CLR_RESET}")
    print(f"{CLR_MUTED}Tip: Run 'python clip.py copy {idx}' to write this code block to clipboard.{CLR_RESET}\n")

def cmd_copy(snippets, index_str):
    try:
        idx = int(index_str)
    except ValueError:
        print(f"{CLR_RED}Error: Index must be a valid number.{CLR_RESET}")
        return
        
    if idx < 1 or idx > len(snippets):
        print(f"{CLR_RED}Error: Index {idx} is out of bounds (1-{len(snippets)}).{CLR_RESET}")
        return
        
    s = snippets[idx - 1]
    content = s.get("content", "")
    title = s.get("title", "Untitled")
    
    success = copy_to_clipboard(content)
    if success:
        print(f"{CLR_GREEN}[OK] Success! Snippet #{idx} '{title}' written to Windows Clipboard!{CLR_RESET}")
        print(f"{CLR_MUTED}Works perfectly in the background or when browser is minimized.{CLR_RESET}\n")
    else:
        print(f"{CLR_RED}[ERROR] Error injecting code snippet into Windows Clipboard.{CLR_RESET}")

def main():
    # Enable virtual terminal codes on Windows CMD/PowerShell if needed
    os.system("")
    
    show_banner()
    snippets = load_snippets()
    
    if len(sys.argv) < 2:
        show_help()
        return
        
    cmd = sys.argv[1].lower()
    
    if cmd == "list":
        cmd_list(snippets)
    elif cmd == "search":
        if len(sys.argv) < 3:
            print(f"{CLR_RED}Error: Search command requires a query search term.{CLR_RESET}\n")
            show_help()
            return
        cmd_search(snippets, " ".join(sys.argv[2:]))
    elif cmd == "show":
        if len(sys.argv) < 3:
            print(f"{CLR_RED}Error: Show command requires a snippet number index.{CLR_RESET}\n")
            show_help()
            return
        cmd_show(snippets, sys.argv[2])
    elif cmd == "copy":
        if len(sys.argv) < 3:
            print(f"{CLR_RED}Error: Copy command requires a snippet number index.{CLR_RESET}\n")
            show_help()
            return
        cmd_copy(snippets, sys.argv[2])
    elif cmd in ("--help", "-h", "help"):
        show_help()
    else:
        print(f"{CLR_RED}Unknown command: '{cmd}'{CLR_RESET}\n")
        show_help()

if __name__ == "__main__":
    main()
