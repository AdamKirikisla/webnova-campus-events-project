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

  // 2. Data processing
  if (typeof fakeEvents !== 'undefined') {
    const listElement = document.getElementById('registered-events-list');
    if (!listElement) return;

    // Récupère les inscriptions de l'utilisateur actif (ou un tableau vide s'il n'y en a pas)
    const registeredEventIds = currentUser.registeredEvents || [];

    // Filtre les événements pour ne garder que ceux où l'utilisateur est inscrit
    const registeredEvents = fakeEvents
      .filter((event) => registeredEventIds.includes(event.event_id))
      // Optionnel mais pro : on les trie chronologiquement
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // 3. UI Rendering
    if (registeredEvents.length === 0) {
      listElement.innerHTML =
        '<li class="event-item" style="list-style: none;"><strong>You are not registered for any events yet.</strong></li>';
    } else {
      listElement.innerHTML = registeredEvents
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
  }
});
