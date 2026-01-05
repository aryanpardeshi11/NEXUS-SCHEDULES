/**
 * calendar.js
 * Logic for the Unified Calendar page (Exams + Events)
 */

const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

// Modal Elements
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');

let currentDate = new Date();

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    monthYearDisplay.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Clear existing days (keep headers)
    const headers = Array.from(document.querySelectorAll('.cal-header-cell'));
    calendarGrid.innerHTML = '';
    headers.forEach(h => calendarGrid.appendChild(h));

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayIndex = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    // Padding for prev month
    for (let i = 0; i < startDayIndex; i++) {
        const pad = document.createElement('div');
        pad.className = 'cal-day';
        pad.style.opacity = '0.3';
        calendarGrid.appendChild(pad);
    }

    // Days
    const today = new Date();
    // Get all events (exams/tasks)
    // We are reusing the 'EXAMS' storage key for all calendar events for simplicity, 
    // or we could migrate. Let's reuse 'EXAMS' as the 'Events' store.
    const events = AppStorage.getExams() || [];

    for (let i = 1; i <= totalDays; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        
        // Highlight today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = i;
        dayEl.appendChild(dayNum);

        // Render Events
        const dateString = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        events.forEach(event => {
            if (event.date === dateString) {
                const eventEl = document.createElement('div');
                const isExam = event.type === 'exam';
                eventEl.className = `cal-event ${isExam ? 'exam' : ''}`;
                // Display Title
                eventEl.textContent = event.title || event.subject; // Handle legacy 'subject'
                dayEl.appendChild(eventEl);
            }
        });

        calendarGrid.appendChild(dayEl);
    }
}

// Navigation
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

// Modal Logic
addEventBtn.addEventListener('click', () => {
    eventModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
});

// Close click outside
eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) eventModal.style.display = 'none';
});

// Add Event
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(eventForm);
    
    const newEvent = {
        title: formData.get('title'),
        date: formData.get('date'),
        type: formData.get('type') // 'exam' or 'event'
    };

    const events = AppStorage.getExams() || [];
    events.push(newEvent);
    AppStorage.saveExams(events); // Saving to same key

    eventForm.reset();
    eventModal.style.display = 'none';
    renderCalendar(currentDate);
});

// Initial Render
renderCalendar(currentDate);
