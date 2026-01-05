/**
 * todo.js
 * Logic for the Pro Task Manager page
 */

const taskForm = document.getElementById('taskForm');
const taskRoot = document.getElementById('task-root');
const priorityTrigger = document.getElementById('priorityTrigger');
const priorityInput = document.getElementById('priorityInput');
const dateTrigger = document.getElementById('dateTrigger');
const dueDateInput = document.getElementById('dueDateInput');

// State
let dragStartIndex;

// --- Rendering ---
function renderTasks() {
    const tasks = AppStorage.getTasks();
    taskRoot.innerHTML = '';

    if (tasks.length === 0) {
        taskRoot.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No tasks yet. Start planning!</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.setAttribute('draggable', 'true');
        card.dataset.index = index;

        // Date Logic (Basic)
        let dateHtml = '';
        if (task.dueDate) {
            const dateObj = new Date(task.dueDate);
            const isOverdue = dateObj < new Date().setHours(0,0,0,0);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateHtml = `
                <div class="date-tag ${isOverdue && !task.completed ? 'overdue' : ''}">
                    <i class="far fa-calendar-alt"></i> ${dateStr}
                </div>
            `;
        }
        
        // Priority Flag Class
        const pClass = `flag-${task.priority}`;

        card.innerHTML = `
            <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
            
            <div class="custom-checkbox" onclick="toggleTask(${index})">
                <i class="fas fa-check"></i>
            </div>
            
            <div class="task-text" style="font-weight: 500;">${task.text}</div>
            
            <div class="task-meta">
                ${dateHtml}
                <i class="fas fa-flag flag-icon ${pClass}" title="Priority"></i>
            </div>

            <button class="delete-btn" onclick="deleteTask(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        addDragEvents(card);
        taskRoot.appendChild(card);
    });
}

// --- Drag & Drop Interface ---
function addDragEvents(card) {
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('drop', dragDrop);
    card.addEventListener('dragenter', dragEnter);
    card.addEventListener('dragleave', dragLeave);
}

function dragStart(e) {
    dragStartIndex = +this.dataset.index;
    this.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over-style'); // Optional hover effect
}

function dragLeave() {
    this.classList.remove('drag-over-style');
}

function dragDrop(e) {
    const dragEndIndex = +this.dataset.index;
    swapItems(dragStartIndex, dragEndIndex);
    this.classList.remove('drag-over-style');
    document.querySelector('.dragging').classList.remove('dragging');
}

function swapItems(fromIndex, toIndex) {
    const tasks = AppStorage.getTasks();
    const itemToMove = tasks[fromIndex];
    
    // Remove from old pos
    tasks.splice(fromIndex, 1);
    // Insert at new pos
    tasks.splice(toIndex, 0, itemToMove);
    
    AppStorage.saveTasks(tasks);
    renderTasks();
}

// --- Input Logic ---
// Priority Cycler
priorityTrigger.addEventListener('click', () => {
    const current = priorityInput.value;
    let next = 'p4';
    let iconClass = 'flag-p4';
    
    if (current === 'p4') { next = 'p1'; iconClass = 'flag-p1'; } // High (Red)
    else if (current === 'p1') { next = 'p2'; iconClass = 'flag-p2'; } // Med (Orange)
    else if (current === 'p2') { next = 'p3'; iconClass = 'flag-p3'; } // Low (Blue)
    else { next = 'p4'; iconClass = 'flag-p4'; } // None (Grey)

    priorityInput.value = next;
    priorityTrigger.innerHTML = `<i class="fas fa-flag flag-icon ${iconClass}"></i>`;
});

// Date Picker
dateTrigger.addEventListener('click', () => {
    dueDateInput.showPicker(); // Modern Browser API
});
// Visual feedback when date selected
dueDateInput.addEventListener('change', () => {
    if(dueDateInput.value) {
        dateTrigger.style.color = 'var(--primary)';
        dateTrigger.style.background = 'rgba(139, 92, 246, 0.1)';
    }
});

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const text = formData.get('task');
    if (!text) return;

    const tasks = AppStorage.getTasks();
    tasks.unshift({
        text,
        priority: priorityInput.value,
        dueDate: dueDateInput.value, // YYYY-MM-DD
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    AppStorage.saveTasks(tasks);
    
    // Reset Form & State
    taskForm.reset();
    priorityInput.value = 'p4';
    priorityTrigger.innerHTML = `<i class="fas fa-flag flag-icon flag-p4"></i>`;
    dateTrigger.style.color = '';
    dateTrigger.style.background = '';
    
    renderTasks();
});

// Actions
window.toggleTask = (index) => {
    const tasks = AppStorage.getTasks();
    tasks[index].completed = !tasks[index].completed;
    AppStorage.saveTasks(tasks);
    renderTasks(); // Re-render in place
};

window.deleteTask = (index) => {
    const tasks = AppStorage.getTasks();
    tasks.splice(index, 1);
    AppStorage.saveTasks(tasks);
    renderTasks();
};

// Real-time Sync
window.addEventListener('eng-app-data-changed', renderTasks);

// Initial Render
document.addEventListener('DOMContentLoaded', renderTasks);
