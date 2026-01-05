/**
 * schedule.js
 * Handles the Drag & Drop, Editing, Adding of Schedule Items, and Tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Force sync schedule to defaults (User requested publish)
    AppStorage.resetSchedule();
    
    renderScheduleTable();
    setupDragAndDrop();
    
    // Listen for data changes
    window.addEventListener('eng-app-data-changed', renderScheduleTable);
    
    // Initialize Modal State
    window.scheduleModal = document.getElementById('eventModal');
});

// Tab Switching
window.switchTab = (tabName) => {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName === 'personal' ? 'daily' : 'college'));
    });
    
    // Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if(tabName === 'personal') {
        document.getElementById('personal-tab').style.display = 'block';
        document.getElementById('college-tab').style.display = 'none';
        // Ensure active class for animation
        setTimeout(() => document.getElementById('personal-tab').classList.add('active'), 10);
        document.getElementById('college-tab').classList.remove('active');
    } else {
        document.getElementById('personal-tab').style.display = 'none';
        document.getElementById('college-tab').style.display = 'block';
        setTimeout(() => document.getElementById('college-tab').classList.add('active'), 10);
        document.getElementById('personal-tab').classList.remove('active');
    }
};

// Modal Functions
window.openModal = () => {
    document.getElementById('eventModal').classList.add('open');
};

window.closeModal = () => {
    document.getElementById('eventModal').classList.remove('open');
};

// Handle Form Submit
document.getElementById('scheduleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const start = formData.get('startTime'); // 24h format
    const end = formData.get('endTime');     // 24h format
    const activity = formData.get('activity');
    const details = formData.get('details');
    
    // Format Times
    const format = (t) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };
    
    const timeRange = `${format(start)} – ${format(end)}`;
    
    // Calculate Hours
    const sDate = new Date(`2000-01-01T${start}`);
    const eDate = new Date(`2000-01-01T${end}`);
    const diff = (eDate - sDate) / (1000 * 60 * 60); // hours
    
    // Add to storage
    const schedule = AppStorage.getSchedule();
    schedule.push({
        timeRange: timeRange,
        activity: activity + (details ? ` (${details})` : ''),
        hours: Math.abs(diff).toFixed(2)
    });
    AppStorage.saveSchedule(schedule);
    
    renderScheduleTable();
    closeModal();
    e.target.reset();
});

function renderScheduleTable() {
    const tbody = document.getElementById('schedule-body');
    const schedule = AppStorage.getSchedule();
    
    if(!tbody) return;
    tbody.innerHTML = '';
    
    schedule.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'draggable-row';
        tr.setAttribute('draggable', 'true');
        tr.dataset.index = index;
        
        // Split Time Range
        // Robust split: Hyphen, En Dash, Em Dash
        const parts = item.timeRange ? item.timeRange.split(/[\u2013\u2014-]/).map(s => s.trim()) : ['', ''];
        const start = parts[0] || '';
        const end = parts[1] || '';
        
        tr.innerHTML = `
            <td style="width: 40px; text-align: center; color: var(--text-muted); cursor: grab;" class="drag-handle"><i class="fas fa-grip-vertical"></i></td>
            <td contenteditable="true" onblur="updateTime(${index}, 'start', this.innerText)" style="font-weight: 500; font-family: monospace; color: var(--primary);">${start}</td>
            <td contenteditable="true" onblur="updateTime(${index}, 'end', this.innerText)" style="font-weight: 500; font-family: monospace; color: var(--text-muted);">${end}</td>
            <td contenteditable="true" onblur="updateItem(${index}, 'activity', this.innerText)" style="font-weight: 600;">${item.activity}</td>
            <td contenteditable="true" onblur="updateItem(${index}, 'hours', this.innerText)" style="text-align: center;">${item.hours}</td>
            <td style="text-align: center;">
                <button onclick="deleteScheduleItem(${index})" style="color: #ef4444; background: none; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.2s;"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        
        // Add Drag Events
        addDragEvents(tr);
        
        tbody.appendChild(tr);
    });
}

// Update Start or End time specifically
window.updateTime = (index, type, value) => {
    const schedule = AppStorage.getSchedule();
    if (schedule[index]) {
        const parts = schedule[index].timeRange ? schedule[index].timeRange.split(/[\u2013\u2014-]/).map(s => s.trim()) : ['', ''];
        let start = parts[0];
        let end = parts[1];
        
        if (type === 'start') start = value.trim();
        if (type === 'end') end = value.trim();
        
        schedule[index].timeRange = `${start} – ${end}`;
        AppStorage.saveSchedule(schedule);
    }
};

window.updateItem = (index, field, value) => {
    const schedule = AppStorage.getSchedule();
    if(schedule[index]) {
        schedule[index][field] = value.trim();
        AppStorage.saveSchedule(schedule);
        // Don't re-render immediately to avoid losing focus, 
        // but maybe we should to ensure consistency? 
        // For now, let it stay provided local storage is updated.
    }
};

window.deleteScheduleItem = (index) => {
    if(confirm('Remove this activity?')) {
        const schedule = AppStorage.getSchedule();
        schedule.splice(index, 1);
        AppStorage.saveSchedule(schedule);
        renderScheduleTable();
    }
};

window.addScheduleItem = () => {
    const schedule = AppStorage.getSchedule();
    schedule.push({
        timeRange: '00:00 AM – 00:00 AM',
        activity: 'New Activity',
        hours: '0'
    });
    AppStorage.saveSchedule(schedule);
    renderScheduleTable();
};

/* Drag & Drop Logic */
let dragSrcEl = null;

function addDragEvents(row) {
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragenter', handleDragEnter);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();

    if (dragSrcEl !== this) {
        // Swap Data in Storage
        const schedule = AppStorage.getSchedule();
        const srcIndex = parseInt(dragSrcEl.dataset.index);
        const targetIndex = parseInt(this.dataset.index);
        
        // Swap elements in array
        const temp = schedule[srcIndex];
        schedule[srcIndex] = schedule[targetIndex];
        schedule[targetIndex] = temp;
        
        AppStorage.saveSchedule(schedule);
        renderScheduleTable();
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    document.querySelectorAll('.draggable-row').forEach(row => {
        row.classList.remove('over');
    });
}
