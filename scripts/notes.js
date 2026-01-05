/**
 * notes.js
 */

const notesRoot = document.getElementById('notes-root');
const modal = document.getElementById('noteModal');
const titleInput = document.getElementById('noteTitle');
const bodyInput = document.getElementById('noteBody');
const urlInput = document.getElementById('noteUrl'); 

let currentNoteId = null;
let autoSaveTimeout = null;
const saveStatus = document.getElementById('save-status');

function renderNotes() {
    if (!notesRoot) return; // Safety check
    const notes = AppStorage.getNotes();
    notesRoot.innerHTML = '';
    
    // Sort logic (Newest first)
    // notes.reverse(); 

    if (notes.length === 0) {
        notesRoot.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Create your first note!</p>';
        return;
    }

    notes.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        const type = detectType(note.url);
        const typeBadge = getTypeBadge(type);
        const isNotion = type === 'Notion'; // Keep specific logic for cover/button if needed

        let coverHtml = '';
        if (isNotion) {
            // Notion Auto-Branding
             coverHtml = `
                <div class="note-cover" style="height: 120px; background: #fff; display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem; border-bottom: 1px solid var(--border-color);">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" style="height: 64px; width: 64px; object-fit: contain;" alt="Notion">
                </div>
            `;
        } else if (note.cover) {
             coverHtml = `
                <div class="note-cover" style="height: 120px; background-image: url('${note.cover}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem; border-bottom: 1px solid var(--border-color);"></div>
            `;
        }

        // Only open the note for editing if there's no URL or if the click isn't on the link itself
        card.onclick = (event) => {
            if (!event.target.closest('.note-url-link')) {
                openNote(index);
            }
        };
        
        let urlLinkHtml = '';
        if (note.url) {
            let btnText = 'Open Link';
            if (isNotion) btnText = 'Open Notion';
            else if (type === 'PDF') btnText = 'View PDF';
            else if (type === 'Google Doc') btnText = 'Open Doc';
            else if (type === 'Drive') btnText = 'Open Drive';
            else if (type === 'Youtube') btnText = 'Watch Video';

            urlLinkHtml = `
                <a href="${note.url}" target="_blank" class="note-url-link" style="display: block; margin-top: auto; padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.1); color: var(--primary); text-align: center; text-decoration: none; border-radius: 8px; border: 1px solid var(--border-color); font-weight: 500; transition: background 0.2s;">
                    ${btnText} <i class="fas fa-external-link-alt" style="margin-left: 0.25rem;"></i>
                </a>
            `;
        }

        card.innerHTML = `
            ${coverHtml}
            <div class="note-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div style="flex: 1; margin-right: 0.5rem;">
                    <div class="note-title" style="margin: 0; font-size: 1.1rem; font-weight: 700; line-height: 1.3;">${note.title || 'Untitled'}</div>
                    <div style="margin-top: 6px;">${typeBadge}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteNote(${index})" style="background: transparent; color: var(--text-muted); border: none; cursor: pointer; padding: 4px; transition: color 0.2s;" title="Delete Note">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="note-preview" style="margin-bottom: 1rem;">${note.body || ''}</div>
            <div class="note-date" style="margin-bottom: 1rem;">${new Date(note.updatedAt).toLocaleDateString()}</div>
            ${urlLinkHtml}
        `;
        
        notesRoot.appendChild(card);
    });
}

function detectType(url) {
    if (!url) return 'Text';
    try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        const path = u.pathname.toLowerCase();

        if (host.includes('notion.so')) return 'Notion';
        if (host.includes('drive.google.com')) return 'Drive';
        if (host.includes('docs.google.com')) {
             if (path.includes('/document/')) return 'Google Doc';
             if (path.includes('/spreadsheets/')) return 'Google Sheet';
             if (path.includes('/presentation/')) return 'Google Slide';
             return 'Google Doc';
        }
        if (host.includes('youtube.com') || host.includes('youtu.be')) return 'Youtube';
        if (host.includes('github.com')) return 'GitHub';
        if (host.includes('figma.com')) return 'Figma';

        if (path.endsWith('.pdf')) return 'PDF';
        if (path.match(/\.(doc|docx)$/)) return 'Word';
        if (path.match(/\.(xls|xlsx|csv)$/)) return 'Excel';
        if (path.match(/\.(ppt|pptx)$/)) return 'PowerPoint';
        if (path.match(/\.(zip|rar|7z)$/)) return 'Archive';
        if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'Image';

        return 'Link';
    } catch {
        return 'Link';
    }
}

function getTypeBadge(type) {
    let icon = 'fa-link';
    let color = 'var(--text-muted)';
    let bg = 'rgba(255,255,255,0.1)';
    
    switch (type) {
        case 'Text': icon = 'fa-align-left'; color='#9ca3af'; break;
        case 'Notion': icon = 'fa-file-alt'; color='#ffffff'; break; // Notion Icon handled in cover usually, but here for badge
        case 'PDF': icon = 'fa-file-pdf'; color='#ef4444'; bg='rgba(239, 68, 68, 0.1)'; break;
        case 'Word': icon = 'fa-file-word'; color='#2563eb'; bg='rgba(37, 99, 235, 0.1)'; break;
        case 'Excel': 
        case 'Google Sheet':
            icon = 'fa-file-excel'; color='#10b981'; bg='rgba(16, 185, 129, 0.1)'; break;
        case 'PowerPoint':
        case 'Google Slide': 
            icon = 'fa-file-powerpoint'; color='#f97316'; bg='rgba(249, 115, 22, 0.1)'; break;
        case 'Google Doc': icon = 'fa-file-alt'; color='#3b82f6'; bg='rgba(59, 130, 246, 0.1)'; break;
        case 'Drive': icon = 'fab fa-google-drive'; color='#10b981'; break;
        case 'Youtube': icon = 'fab fa-youtube'; color='#ef4444'; break;
        case 'GitHub': icon = 'fab fa-github'; color='#ffffff'; break;
        case 'Figma': icon = 'fab fa-figma'; color='#ec4899'; break;
        case 'Archive': icon = 'fa-file-archive'; color='#eab308'; break;
        case 'Image': icon = 'fa-file-image'; color='#a855f7'; break;
        default: icon = 'fa-link'; color='var(--primary)'; bg='rgba(139, 92, 246, 0.1)';
    }

    // Special styling for "Text" (subtle)
    if (type === 'Text') {
         return `<span style="font-size: 0.75rem; color: ${color}; background: ${bg}; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);"><i class="fas ${icon}" style="margin-right:4px;"></i>${type}</span>`;
    }

    return `<span style="font-size: 0.75rem; color: ${color}; background: ${bg}; padding: 2px 8px; border-radius: 4px; border: 1px solid ${color}20;"><i class="fas ${icon}" style="margin-right:4px;"></i>${type}</span>`;
}

window.openNote = (index = null) => {
    currentNoteId = index;
    modal.classList.add('open');
    
    if (index !== null) {
        const notes = AppStorage.getNotes();
        const note = notes[index];
        titleInput.value = note.title;
        bodyInput.value = note.body;
        // Populate URL URL field if it exists
        if(urlInput && note.url) urlInput.value = note.url;
        else if(urlInput) urlInput.value = '';
        
    } else {
        titleInput.value = '';
        bodyInput.value = '';
        if(urlInput) urlInput.value = '';
    }
    
    titleInput.focus();
};

window.closeNote = () => {
    modal.classList.remove('open');
};

// Helper to get branding from URL
function getMetadataFromUrl(urlStr) {
    let title = '';
    let image = '';
    
    try {
        // Ensure protocol
        if (!urlStr.startsWith('http')) urlStr = 'https://' + urlStr;
        
        const url = new URL(urlStr);
        const hostname = url.hostname;
        const pathname = url.pathname;

        // 1. PDF Detection
        if (pathname.toLowerCase().endsWith('.pdf')) {
            // Extract filename: "my-file_name.pdf" -> "My File Name"
            const filename = pathname.split('/').pop().replace(/\.pdf$/i, '');
            title = decodeURIComponent(filename).replace(/[-_]/g, ' ');
            // Title Case
            title = title.replace(/\b\w/g, c => c.toUpperCase());
            
            // Standard PDF Icon
            image = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg';
        }
        // 2. Website Detection
        else {
            // Title from Domain: "www.gemini.google.com" -> "Gemini"
            // "github.com" -> "Github"
            let domain = hostname.replace(/^www\./, '');
            let name = domain.split('.')[0];
            
            // Specific Overrides
            if (hostname.includes('gemini.google.com')) name = 'Gemini';
            if (hostname.includes('chatgpt.com')) name = 'ChatGPT';
            if (hostname.includes('docs.google.com')) name = 'Google Docs';
            if (hostname.includes('drive.google.com')) name = 'Google Drive';
            if (hostname.includes('youtube.com')) name = 'YouTube';
            if (hostname.includes('notion.so')) name = 'Notion';

            title = name.charAt(0).toUpperCase() + name.slice(1);
            
            // Auto Image (High Res Favicon)
            image = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
        }
    } catch (e) {
        console.error('URL Parse Error:', e);
        title = 'New Resource';
        image = 'https://ui-avatars.com/api/?name=Link&background=random'; // Generic fallback image
    }

    return { title, image };
}

window.saveNote = (isAutoSave = false) => {
    let title = titleInput.value.trim();
    const body = bodyInput.value;
    const url = urlInput ? urlInput.value.trim() : '';

    if (!body && !url && !title) {
        if (!isAutoSave) alert('Please enter content or a link');
        return;
    }

    // Visual feedback for auto-save
    if (isAutoSave && saveStatus) {
        saveStatus.textContent = 'Saving...';
    }

    let notes = AppStorage.getNotes();
    
    let autoCover = null;
    if (url) {
        const metadata = getMetadataFromUrl(url);
        if (!title && !isAutoSave) { // Only auto-set title on manual save to avoid jumps? Or allow it? 
            // Better to only do it if title is empty.
            title = metadata.title;
        }
        autoCover = metadata.image;
    }

    const newNote = {
        title: title || 'Untitled',
        body: body,
        url: url || null,
        cover: autoCover, 
        updatedAt: new Date().toISOString()
    };

    if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = {
            ...notes[currentNoteId],
            ...newNote 
        };
    } else {
        // Create new note
        notes.push(newNote);
        // Important: Update currentNoteId so subsequent auto-saves update this note instead of creating duplicates
        currentNoteId = notes.length - 1;
    }
    
    AppStorage.saveNotes(notes);
    renderNotes(); // We must render to update background list, but we stay in modal if auto-save

    if (isAutoSave) {
        if (saveStatus) {
            saveStatus.textContent = 'Saved';
            setTimeout(() => { if (saveStatus) saveStatus.textContent = ''; }, 2000);
        }
    } else {
        closeNote();
    }
};

const handleAutoSave = () => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        // Only auto-save if modal is open and we have minimal content
        if (modal.classList.contains('open')) {
            window.saveNote(true);
        }
    }, 1000); // 1s debounce
};

// Add listeners safely
if (titleInput) titleInput.addEventListener('input', handleAutoSave);
if (bodyInput) bodyInput.addEventListener('input', handleAutoSave);
if (urlInput) urlInput.addEventListener('input', handleAutoSave);

window.deleteNote = (index) => {
    if(confirm('Delete this note?')) {
        const notes = AppStorage.getNotes();
        notes.splice(index, 1);
        AppStorage.saveNotes(notes);
        renderNotes();
    }
};

// Real-time Sync
window.addEventListener('eng-app-data-changed', renderNotes);

renderNotes();
