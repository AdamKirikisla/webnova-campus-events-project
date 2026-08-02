document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Management
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Handle Logout Logic
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // 2. Data Filtering and Sorting
  if (typeof fakeEvents !== 'undefined') {
    // Normalize today's date to midnight for accurate day-level comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for future events and sort them chronologically
    const upcomingEvents = fakeEvents
      .filter((event) => new Date(event.event_date) >= today)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // 3. UI Rendering
    const listElement = document.getElementById('all-upcoming-events-list');

    if (!listElement) return; // Safeguard if element doesn't exist

    // Handle empty state gracefully
    if (upcomingEvents.length === 0) {
      listElement.innerHTML =
        '<li class="event-item" style="list-style: none;"><strong>No upcoming events available.</strong></li>';
      return;
    }

    // Map filtered events to HTML
    listElement.innerHTML = upcomingEvents
      .map(
        (event) => `
      <li class="event-item" style="list-style: none; padding: 10px; border-bottom: 1px solid #eee;">
        <a href="event-details.html?id=${event.event_id}" class="event-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
          <strong style="color: var(--primary-color);">${event.title}</strong>
          <span class="muted" style="font-size: 0.9rem; color: #666;">
            ${event.event_date} • ${event.start_time} • ${event.location}
          </span>
        </a>
      </li>
    `
      )
      .join('');
  }
});
