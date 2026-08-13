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

    // Récupère les inscriptions de l'utilisateur actif (ou un tableau vide s'il n'y en a pas)
    const registeredEventIds = currentUser.registeredEvents || [];

    // Filtre les événements pour ne garder que ceux où l'utilisateur est inscrit
    const registeredEvents = fakeEvents
      .filter((event) => registeredEventIds.includes(event.event_id))
      // Optionnel mais pro : on les trie chronologiquement
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // 3. UI Rendering (flat chronological list)
    if (listElement) {
      if (registeredEvents.length === 0) {
        listElement.innerHTML =
          '<li class="event-item" style="list-style: none;"><strong>You are not registered for any events yet.</strong></li>';
      } else {
        listElement.innerHTML = registeredEvents
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
    }

    // 4. Weekly Agenda Calendar (registered events only, one week at a time)
    const agendaGrid = document.getElementById('agenda-grid');
    const agendaRange = document.getElementById('agenda-range');
    const agendaPrevBtn = document.getElementById('agenda-prev');
    const agendaNextBtn = document.getElementById('agenda-next');
    const agendaTodayBtn = document.getElementById('agenda-today');

    if (agendaGrid && agendaRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const MONTH_LABELS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      // Monday-start week boundary
      const startOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

      let weekOffset = 0;

      const renderAgenda = () => {
        const weekStart = startOfWeek(today);
        weekStart.setDate(weekStart.getDate() + weekOffset * 7);

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() + i);
          return d;
        });
        const weekEnd = days[6];

        const formatShort = (d) => `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
        agendaRange.textContent =
          weekStart.getFullYear() === weekEnd.getFullYear()
            ? `${formatShort(weekStart)} – ${formatShort(weekEnd)}, ${weekEnd.getFullYear()}`
            : `${formatShort(weekStart)}, ${weekStart.getFullYear()} – ${formatShort(weekEnd)}, ${weekEnd.getFullYear()}`;

        agendaGrid.innerHTML = days
          .map((day, i) => {
            const dayEvents = registeredEvents
              .filter((event) => sameDay(new Date(event.event_date), day))
              .sort((a, b) => new Date(`${a.event_date} ${a.start_time}`) - new Date(`${b.event_date} ${b.start_time}`));

            const isToday = sameDay(day, today);
            const isPast = day < today && !isToday;

            const eventsHtml = dayEvents.length
              ? dayEvents
                  .map(
                    (event) => `
                      <a href="event-details.html?id=${event.event_id}" class="agenda-event${isPast ? ' agenda-event-past' : ''}">
                        <span class="agenda-event-time">${event.start_time}</span>
                        <span class="agenda-event-title">${event.title}</span>
                      </a>
                    `
                  )
                  .join('')
              : '<p class="agenda-empty">—</p>';

            return `
              <div class="agenda-day${isToday ? ' agenda-day-today' : ''}">
                <div class="agenda-day-header">
                  <span class="agenda-day-name">${DAY_LABELS[i]}</span>
                  <span class="agenda-day-date">${day.getDate()}</span>
                </div>
                <div class="agenda-day-events">${eventsHtml}</div>
              </div>
            `;
          })
          .join('');
      };

      agendaPrevBtn.addEventListener('click', () => {
        weekOffset -= 1;
        renderAgenda();
      });
      agendaNextBtn.addEventListener('click', () => {
        weekOffset += 1;
        renderAgenda();
      });
      agendaTodayBtn.addEventListener('click', () => {
        weekOffset = 0;
        renderAgenda();
      });

      renderAgenda();
    }
  }
});
