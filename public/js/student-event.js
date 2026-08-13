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

  // 2. Data processing optimization
  if (typeof fakeEvents !== 'undefined') {
    // Set 'today' to exactly midnight to prevent time-of-day bugs during comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = [];
    const pastEvents = [];

    // O(n) Single-pass distribution: more efficient than running .filter() twice
    fakeEvents.forEach((event) => {
      const eventDate = new Date(event.event_date);
      if (eventDate >= today) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    // Sort upcoming events chronologically (closest date first)
    upcomingEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // Sort past events reverse-chronologically (most recent past date first)
    pastEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    // 3. UI Rendering
    function renderEventList(listElement, events) {
      if (!listElement) return;

      if (!events.length) {
        listElement.innerHTML =
          '<li class="event-item" style="list-style: none;"><strong>No events available.</strong></li>';
        return;
      }

      // Map event data to HTML and inject it safely
      listElement.innerHTML = events
        .map(
          (event) => `
        <li class="event-item" style="list-style: none;">
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

    // Execute render functions
    renderEventList(document.getElementById('upcoming-events-list'), upcomingEvents);
    renderEventList(document.getElementById('past-events-list'), pastEvents);
  }
});
