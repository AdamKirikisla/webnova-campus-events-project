document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Management
  const currentUser = await WebNovaAPI.requireLogin();
  if (!currentUser) return;

  // Handle Logout Logic
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WebNovaAPI.logout();
    });
  }

  // 2. Data processing — the catalogue now comes from the Events table
  try {
    const allEvents = await WebNovaAPI.getEvents();

    // Set 'today' to exactly midnight to prevent time-of-day bugs during comparison
    const today = WebNovaAPI.startOfToday();

    const upcomingEvents = [];
    const pastEvents = [];

    // O(n) Single-pass distribution: more efficient than running .filter() twice
    allEvents.forEach((event) => {
      if (event.dateObj && event.dateObj >= today) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    // Sort upcoming events chronologically (closest date first)
    upcomingEvents.sort((a, b) => a.dateObj - b.dateObj);

    // Sort past events reverse-chronologically (most recent past date first)
    pastEvents.sort((a, b) => b.dateObj - a.dateObj);

    // 3. UI Rendering
    // Shared by both cards on this page: it takes the target <ul> and the
    // events to show, so the same markup is not written out twice.
    function renderEventList(listElement, events) {
      if (!listElement) return;

      // Empty state, so the card never renders as a blank box.
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
  } catch (err) {
    console.error(err);
    const message =
      '<li class="event-item" style="list-style: none;"><strong>Could not load events.</strong><span class="muted">Is the server running?</span></li>';
    const upcomingList = document.getElementById('upcoming-events-list');
    const pastList = document.getElementById('past-events-list');
    if (upcomingList) upcomingList.innerHTML = message;
    if (pastList) pastList.innerHTML = '';
  }
});
