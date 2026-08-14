document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Management (currentUser now holds the real database user_id)
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

  // 2. Data processing — the student's own registrations come from the backend
  try {
    const listElement = document.getElementById('registered-events-list');

    const allRegistrations = await WebNovaAPI.getMyRegistrations();

    // Cancelled registrations are dropped; the rest are sorted chronologically.
    const registeredEvents = allRegistrations
      .filter((r) => WebNovaAPI.isActive(r))
      .sort((a, b) => a.dateObj - b.dateObj);

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
      // Midnight today, so comparing a day against "now" ignores the time part.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Column headers, and the month names used in the "Aug 10 - Aug 16" label.
      const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const MONTH_LABELS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      // Returns the Monday of the week the given date falls in.
      // getDay() is 0 for Sunday, so Sunday has to jump back 6 days instead
      // of forward 1, which is what the (day === 0 ? -6 : 1) part handles.
      const startOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      // Two dates are "the same day" only if year, month and date all match.
      const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

      // How many weeks away from the current week we are showing.
      // 0 = this week, -1 = last week, +1 = next week, etc.
      let weekOffset = 0;

      // Draws the seven day boxes for whichever week weekOffset points at.
      // Called once on load, then again every time the user changes week.
      const renderAgenda = () => {
        const weekStart = startOfWeek(today);
        weekStart.setDate(weekStart.getDate() + weekOffset * 7);

        // Build the 7 dates of that week, Monday through Sunday.
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() + i);
          return d;
        });
        const weekEnd = days[6];

        // Header label. The year is only repeated on both sides when the
        // week straddles New Year (e.g. "Dec 29, 2026 - Jan 4, 2027").
        const formatShort = (d) => `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
        agendaRange.textContent =
          weekStart.getFullYear() === weekEnd.getFullYear()
            ? `${formatShort(weekStart)} – ${formatShort(weekEnd)}, ${weekEnd.getFullYear()}`
            : `${formatShort(weekStart)}, ${weekStart.getFullYear()} – ${formatShort(weekEnd)}, ${weekEnd.getFullYear()}`;

        agendaGrid.innerHTML = days
          .map((day, i) => {
            // Keep only the registrations falling on this particular day,
            // ordered by start time so the earliest event sits at the top.
            const dayEvents = registeredEvents
              .filter((event) => event.dateObj && sameDay(event.dateObj, day))
              .sort((a, b) => new Date(`${a.event_date} ${a.start_time}`) - new Date(`${b.event_date} ${b.start_time}`));

            // Used for styling: today's box is highlighted, past days are dimmed.
            const isToday = sameDay(day, today);
            const isPast = day < today && !isToday;

            // A day with nothing on it shows a dash rather than an empty box.
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

      // Week navigation. Each button only moves the offset and redraws —
      // no new request is made, because all registrations are already loaded.
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

      // First draw: the current week.
      renderAgenda();
    }
  } catch (err) {
    console.error(err);
    const listElement = document.getElementById('registered-events-list');
    if (listElement) {
      listElement.innerHTML =
        '<li class="event-item" style="list-style: none;"><strong>Could not load your events.</strong><span class="muted">Is the server running?</span></li>';
    }
    const agendaGrid = document.getElementById('agenda-grid');
    if (agendaGrid) agendaGrid.innerHTML = '';
  }
});
