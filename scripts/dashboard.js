/**
 * dashboard.js
 * Logic for the Dashboard page (index.html)
 */


function initDashboard() {
    // Force sync schedule to defaults as requested by user
    AppStorage.resetSchedule();

    updateDate();
    updateGreeting();
    renderDailySchedulePreview();
    renderQuickTasks();
    updateStats();
    updateDayProgress();

    // Listen for global data changes
    // Listen for global data changes
    window.addEventListener('eng-app-data-changed', () => {
        renderQuickTasks();
        updateStats();
    });
}

function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting');
    let text = 'Good Morning';
    if (hour >= 12 && hour < 17) text = 'Good Afternoon';
    else if (hour >= 17) text = 'Good Evening';
    
    greetingEl.textContent = `${text}, Student`;
}

function updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function renderDailySchedulePreview() {
    const scheduleContainer = document.getElementById('dashboard-schedule');
    let schedule = AppStorage.getSchedule();
    
    // Safety check
    if (!schedule || schedule.length === 0) {
        scheduleContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                No schedule set
            </div>`;
        return;
    }

    // Sort chronologically to fix any ordering issues
    schedule.sort((a, b) => {
        const getStart = (range) => {
            if (!range) return 99999; // Push invalid/empty to end
            // Split by hyphen (-), en-dash (– \u2013), or em-dash (— \u2014)
            const parts = range.split(/[\u2013\u2014-]/); 
            if (!parts[0]) return 99999;
            
            // Cleanup: "08:00 AM" or "8:00AM" -> parse
            return parseTime(parts[0].trim());
        };
        return getStart(a.timeRange) - getStart(b.timeRange);
    });

    scheduleContainer.innerHTML = '';

    // Show top 5 items
    const previewItems = schedule.slice(0, 5);
    const now = new Date();
    const currentMins = (now.getHours() * 60) + now.getMinutes();

    previewItems.forEach((item, index) => {
        // Parse time to see if active
        // format "08:00 AM – 09:15 AM"
        let isActive = false;
        let isPast = false;
        
        // Robust split for range
        const [startStr, endStr] = item.timeRange ? item.timeRange.split(/[\u2013\u2014-]/).map(s => s.trim()) : [];
        if (startStr && endStr) {
            const start = parseTime(startStr);
            const end = parseTime(endStr);
            if (currentMins >= start && currentMins < end) isActive = true;
            if (currentMins >= end) isPast = true;
        }

        const div = document.createElement('div');
        div.className = `timeline-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`;
        div.style.cssText = 'display: flex; gap: 1rem; padding: 0.75rem 1.5rem; position: relative;';
        
        // Colors
        const markerColor = isActive ? 'var(--primary)' : (isPast ? 'var(--text-muted)' : 'var(--border-color)');
        const textColor = isActive ? 'var(--text-main)' : (isPast ? 'var(--text-muted)' : 'var(--text-main)');
        const markerStyle = isActive ? `background: ${markerColor}; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);` : `background: ${markerColor};`;

        div.innerHTML = `
            <!-- Time -->
            <div style="width: 60px; text-align: right; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; padding-top: 2px;">
                ${startStr ? startStr.split(' ')[0] : ''}<span style="font-size:0.7em">${startStr ? startStr.split(' ')[1] : ''}</span>
            </div>
            
            <!-- Line & Marker -->
            <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                <div style="width: 10px; height: 10px; border-radius: 50%; ${markerStyle} z-index: 2;"></div>
                ${index !== previewItems.length - 1 ? `<div style="width: 2px; flex: 1; background: var(--border-color); margin-top: -2px; margin-bottom: -1rem; opacity: 0.5;"></div>` : ''}
            </div>

            <!-- Content -->
            <div style="flex: 1; padding-bottom: 1.5rem;">
                <div style="font-weight: 600; font-size: 0.95rem; color: ${textColor}; margin-bottom: 2px;">${item.activity}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${item.hours}h • ${item.timeRange}</div>
            </div>
        `;
        scheduleContainer.appendChild(div);
    });
}

// Helper to parse "08:00 AM" to minutes
function parseTime(timeStr) {
    if (!timeStr) return 99999;
    
    // Matches: 8:00, 08:00, 8:00AM, 8:00 AM, 8:00 am
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([APap][Mm])?/);
    if (!match) return 99999;

    let [_, h, m, p] = match;
    let hours = parseInt(h);
    const mins = parseInt(m);
    const period = p ? p.toUpperCase() : null;

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return (hours * 60) + mins;
}

function renderQuickTasks() {
    const tasksContainer = document.getElementById('dashboard-tasks');
    const tasks = AppStorage.getTasks().filter(t => !t.completed); 
    
    tasksContainer.innerHTML = '';
    
    if (!tasks || tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                <i class="fas fa-clipboard-check" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #10b981;"></i>
                All caught up!
            </div>`;
        return;
    }

    // Show top 5 pending
    tasks.slice(0, 5).forEach(task => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color);';
        
        let priorityColor = '#a1a1aa'; // Default grey
        let priorityIcon = 'fa-flag';
        if(task.priority === 'p1') { priorityColor = '#ef4444'; priorityIcon = 'fa-flag'; } 
        else if(task.priority === 'p2') { priorityColor = '#f97316'; }
        else if(task.priority === 'p3') { priorityColor = '#3b82f6'; }

        div.innerHTML = `
            <i class="fas ${priorityIcon}" style="color: ${priorityColor}; margin-right: 1rem; font-size: 0.9rem;"></i>
            <span style="font-size: 0.95rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${task.text}</span>
            ${task.dueDate ? `<span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>` : ''}
        `;
        tasksContainer.appendChild(div);
    });
}

function updateStats() {
    // 1. Pending Tasks
    const pendingCount = AppStorage.getTasks().filter(t => !t.completed).length;
    const tasksEl = document.getElementById('tasks-count');
    if(tasksEl) tasksEl.textContent = pendingCount;
    
    // 2. Upcoming Events (Exams)
    const events = AppStorage.getExams(); 
    const upcomingEvents = events.length; 
    const upcomingEl = document.getElementById('upcoming-count');
    if(upcomingEl) upcomingEl.textContent = upcomingEvents;

    // 3. Notes Count
    const notesCount = AppStorage.getNotes().length;
    const notesEl = document.getElementById('total-notes');
    if(notesEl) notesEl.textContent = notesCount;

    // 4. Task Donut Chart
    const tasks = AppStorage.getTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    // Update Ring
    const donutEl = document.getElementById('task-donut');
    if(donutEl) {
        donutEl.style.background = `conic-gradient(var(--primary) ${percent}%, rgba(255,255,255,0.05) 0%)`;
    }
    const percentEl = document.getElementById('task-percent');
    if(percentEl) percentEl.textContent = `${percent}%`;

    // 5. Day Progress
    updateDayProgress();
}

function updateDayProgress() {
    const now = new Date();
    // Start: 8:00 AM, End: 8:00 PM (20:00)
    const startHour = 8;
    const endHour = 20;
    
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    // Calculate total minutes from midnight
    const startMins = startHour * 60;
    const endMins = endHour * 60;
    const currentTotalMins = (currentHour * 60) + currentMin;
    
    let percentage = 0;
    
    if (currentTotalMins <= startMins) {
        percentage = 0;
    } else if (currentTotalMins >= endMins) {
        percentage = 100;
    } else {
        const totalDuration = endMins - startMins;
        const elapsed = currentTotalMins - startMins;
        percentage = (elapsed / totalDuration) * 100;
    }
    
    const bar = document.getElementById('day-progress');
    if(bar) bar.style.width = `${percentage}%`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    // Update progress bar every minute
    setInterval(updateDayProgress, 60000);
});

// End of file

