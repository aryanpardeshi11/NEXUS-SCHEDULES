/**
 * nav.js
 * Handles dynamic sidebar injection and navigation logic
 */

const SidebarComponent = `
    <div class="sidebar" id="app-sidebar">
        <div class="brand" id="sidebar-toggle" title="Toggle Sidebar">
            <i class="fas fa-bolt"></i> <span>NEXUS</span>
        </div>
        <ul class="nav-links">
            <li>
                <a href="index.html" class="nav-item">
                    <i class="fas fa-home"></i> <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="schedule.html" class="nav-item">
                    <i class="fas fa-clock"></i> <span>Schedule</span>
                </a>
            </li>
            <li>
                <a href="todo.html" class="nav-item">
                    <i class="fas fa-check-square"></i> <span>Tasks</span>
                </a>
            </li>
            <li>
                <a href="calendar.html" class="nav-item">
                    <i class="fas fa-calendar-alt"></i> <span>Calendar</span>
                </a>
            </li>
            <li>
                <a href="notes.html" class="nav-item">
                    <i class="fas fa-sticky-note"></i> <span>Notes</span>
                </a>
            </li>
        </ul>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = SidebarComponent;
    }

    // 2. Logic for Collapsible Sidebar
    const sidebar = document.getElementById('app-sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('sidebar-toggle');
    // const toggleIcon = toggleBtn.querySelector('i'); // No icon swap needed for hamburger usually

    // Load State
    const isCollapsed = localStorage.getItem('nexus_sidebar_collapsed') === 'true';
    if (isCollapsed) {
        setCollapsedState(true);
    }

    // Toggle Handler
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const collapsed = sidebar.classList.contains('collapsed');
            setCollapsedState(!collapsed);
        });

        // Double-click to go to Dashboard
        toggleBtn.addEventListener('dblclick', () => {
            window.location.href = 'index.html';
        });
    }

    function setCollapsedState(collapsed) {
        if (collapsed) {
            sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
            // toggleIcon.className = 'fas fa-chevron-right';
            localStorage.setItem('nexus_sidebar_collapsed', 'true');
        } else {
            sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('expanded');
            // toggleIcon.className = 'fas fa-chevron-left';
            localStorage.setItem('nexus_sidebar_collapsed', 'false');
        }
    }

    // 3. Highlight active link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('engineering-scheduler/')))) {
            link.classList.add('active');
        }
    });
});
