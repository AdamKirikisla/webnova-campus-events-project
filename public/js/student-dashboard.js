document.addEventListener('DOMContentLoaded', async () => {
  // 1. Require an active session. currentUser now carries the real user_id
  //    coming from the Users table, which the registrations endpoint needs.
  const currentUser = WebNovaAPI.requireLogin();
  if (!currentUser) return;

  // 2. Update the Hero Card welcome message
  const welcomeHeader = document.querySelector('.hero-card p');
  if (welcomeHeader) {
    welcomeHeader.textContent = `Welcome back, ${currentUser.name}`;
  }

  // 3. Load everything this page needs from the backend in one round trip pair.
  try {
    const [allEvents, registrations] = await Promise.all([
      WebNovaAPI.getEvents(),
      WebNovaAPI.getUserRegistrations(currentUser.user_id),
    ]);

    const today = WebNovaAPI.startOfToday();

    // Any registration that was not cancelled counts as one of "my events".
    const activeRegistrations = registrations.filter((r) => WebNovaAPI.isActive(r));
    const myEventIds = activeRegistrations.map((r) => r.event_id);

    //  4. UPCOMING EVENTS PANEL (My registered events)
    const upcomingPanel = document.querySelector('.panel-upcoming-event');

    // Registered + still to come, earliest first. slice(0, 1) because this
    // panel only advertises the single next event, not the whole list.
    const myUpcomingEvents = allEvents
      .filter((e) => myEventIds.includes(e.event_id))
      .filter((e) => new Date(e.event_date) >= today)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 1);

    upcomingPanel.innerHTML = '<h2>Next Upcoming Event</h2>';
    if (myUpcomingEvents.length === 0) {
      upcomingPanel.innerHTML += '<p style="padding-top: 10px;">You have no upcoming events.</p>';
    } else {
      myUpcomingEvents.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
          <a href="event-details.html?id=${event.event_id}" class="event-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <strong style="color: var(--primary-color);">${event.title}</strong>
          </a>
        `;
        upcomingPanel.appendChild(eventDiv);
      });
    }

    //  4a. FAVORITE CATEGORY (category the user has attended the most, shared with the progress panel below)
    // The full event objects behind this student's registrations. Needed
    // because a registration row only knows the event id, not its category.
    const myAttendedEvents = allEvents.filter((e) => myEventIds.includes(e.event_id));

    // Tally how many of those events fall into each category, e.g.
    // { 'Career Events': 2, 'Club Activities': 1 }
    const categoryCounts = {};
    myAttendedEvents.forEach((event) => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });

    // Keep the single highest-counted category. On a tie the first one wins,
    // since a later category only replaces it on a strictly greater count.
    let favoriteCategory = null;
    let favoriteCount = 0;
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > favoriteCount) {
        favoriteCategory = category;
        favoriteCount = count;
      }
    });

    const favoriteCategoryPanel = document.querySelector('.panel-favorite-category');
    if (favoriteCategoryPanel) {
      favoriteCategoryPanel.innerHTML = '<h2>Favorite Category</h2>';
      if (favoriteCategory) {
        favoriteCategoryPanel.innerHTML += `
          <p class="favorite-category-name">${favoriteCategory}</p>
          <h1 class="big-number">${favoriteCount}</h1>
          <p class="muted" style="text-align: center;">event${favoriteCount > 1 ? 's' : ''} attended</p>
        `;
      } else {
        favoriteCategoryPanel.innerHTML += '<p style="padding-top: 10px; text-align: center;">You have not attended any events yet.</p>';
      }
    }

    //  4a-2. PARTICIPATION PROGRESS PANEL (favorite category completion + weekly activity)
    const progressPanel = document.querySelector('.progress-panel');
    if (progressPanel) {
      // Events that already happened AND the student attended (registered + in the past)
      const pastAttendedEvents = myAttendedEvents.filter((e) => new Date(e.event_date) < today);

      let progressHtml = '<h2>Participation Progress</h2>';

      if (favoriteCategory) {
        // The progress bar answers: "of the events in my favourite category
        // that have already happened, how many did I actually go to?"
        // Denominator: every passed event in that category, attended or not.
        const favoriteCategoryPassed = allEvents.filter(
          (e) => e.category === favoriteCategory && new Date(e.event_date) < today
        ).length;
        // Numerator: only the ones this student was registered for.
        const favoriteCategoryAttended = pastAttendedEvents.filter((e) => e.category === favoriteCategory).length;
        // Guard against dividing by zero when no event in that category has passed yet.
        const progressPercent = favoriteCategoryPassed > 0
          ? Math.round((favoriteCategoryAttended / favoriteCategoryPassed) * 100)
          : 0;

        progressHtml += `
          <div class="progress-favorite">
            <div class="progress-label">
              <span>${favoriteCategory}</span>
              <span class="progress-percent">${progressPercent}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <p class="muted">${favoriteCategoryAttended} of ${favoriteCategoryPassed} passed events attended</p>
          </div>
        `;
      } else {
        progressHtml += '<p class="muted" style="text-align: center;">No favorite category yet.</p>';
      }

      // The two bars underneath compare this month against last month.
      // Day 1 of a month at 00:00 is the boundary between them.
      const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

      const thisMonthStart = startOfMonth(today);
      // Month - 1 is safe in January: the Date constructor rolls back into
      // December of the previous year on its own.
      const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);

      // Anything on or after the 1st of this month.
      const attendedThisMonth = pastAttendedEvents.filter((e) => new Date(e.event_date) >= thisMonthStart).length;
      // Anything between the 1st of last month and the 1st of this one.
      const attendedLastMonth = pastAttendedEvents.filter((e) => {
        const d = new Date(e.event_date);
        return d >= lastMonthStart && d < thisMonthStart;
      }).length;

      // Both bars are drawn relative to the busier month, so the larger one
      // always fills the track. The 1 keeps it from dividing by zero when
      // neither month has any events.
      const monthMax = Math.max(attendedThisMonth, attendedLastMonth, 1);
      const thisMonthWidth = Math.round((attendedThisMonth / monthMax) * 100);
      const lastMonthWidth = Math.round((attendedLastMonth / monthMax) * 100);

      progressHtml += `
        <div class="period-bars">
          <div class="period-bar-row">
            <span class="period-bar-label">This month</span>
            <div class="period-bar-track"><div class="period-bar-fill" style="width: ${thisMonthWidth}%"></div></div>
            <span class="period-bar-value">${attendedThisMonth}</span>
          </div>
          <div class="period-bar-row">
            <span class="period-bar-label">Last month</span>
            <div class="period-bar-track"><div class="period-bar-fill period-bar-fill-alt" style="width: ${lastMonthWidth}%"></div></div>
            <span class="period-bar-value">${attendedLastMonth}</span>
          </div>
        </div>
      `;

      progressPanel.innerHTML = progressHtml;
    }

    //  4b. REGISTERED EVENTS PANEL (all events the user signed up for)
    const registeredPanel = document.querySelector('.panel-upcoming-events');

    const myRegisteredEvents = allEvents
      .filter((e) => myEventIds.includes(e.event_id))
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    if (registeredPanel) {
      registeredPanel.innerHTML = '<h2>Registered Events</h2>';
      if (myRegisteredEvents.length === 0) {
        registeredPanel.innerHTML += '<p style="padding-top: 10px;">You have not registered for any events yet.</p>';
      } else {
        myRegisteredEvents.forEach((event) => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event-item');
          eventDiv.innerHTML = `
            <a href="event-details.html?id=${event.event_id}" class="event-link">
              <strong>${event.title}</strong>
              <span class="event-meta">${event.event_date} · ${event.start_time} - ${event.end_time}</span>
              <span class="event-meta">${event.location}</span>
              <span class="muted">${event.description}</span>
            </a>
          `;
          registeredPanel.appendChild(eventDiv);
        });
      }
    }

    // --- 5. RECOMMENDED FOR YOU PANEL ---
    const recommendPanel = document.querySelector('.panel-recommended');

    // Suggestions the student could still act on, so all three filters matter:
    // 'open' rules out full/cancelled/completed events, the date rules out ones
    // that already happened, and the last one avoids recommending something
    // they are already signed up for. Soonest first, capped at 3 to fit the panel.
    const recommendedEvents = allEvents
      .filter((e) => e.status === 'open')
      .filter((e) => new Date(e.event_date) >= today)
      .filter((e) => !myEventIds.includes(e.event_id))
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 3);

    // Update the hero text dynamic counters
    /*const heroText = document.querySelector('.hero-card p');
    if (heroText) {
      heroText.textContent = `You have ${myUpcomingEvents.length} upcoming events and ${recommendedEvents.length} new recommendations this week.`;
    }*/ // Put in comments by Souheil after changing the message in p for the hero card

    recommendPanel.innerHTML = '<h2>Recommended for you</h2>';
    if (recommendedEvents.length === 0) {
      recommendPanel.innerHTML += '<p style="padding-top: 10px;">No recommendations at this time.</p>';
    } else {
      recommendedEvents.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
          <a href="event-details.html?id=${event.event_id}" class="event-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <strong style="color: var(--primary-color);">${event.title}</strong>
          </a>
        `;
        recommendPanel.appendChild(eventDiv);
      });
    }

    // --- 5b. TOTAL EVENTS ATTENDED ---
    // Was a hard-coded 10 in the HTML; now counted from real registrations.
    const totalPanel = document.querySelector('.panel-total .big-number');
    if (totalPanel) {
      totalPanel.textContent = registrations.filter((r) => WebNovaAPI.isAttended(r, today)).length;
    }
  } catch (err) {
    // A failed load should say so rather than leave the panels on their
    // placeholder markup, which would look like real (but wrong) data.
    console.error(err);
    document.querySelectorAll('.dashboard-grid .panel').forEach((panel) => {
      panel.innerHTML = `<p class="muted" style="text-align:center;">Could not load data.<br />Is the server running?</p>`;
    });
  }

  // 6. Handle Logout Logic securely
  // (Nav search bar logic now lives in public/js/nav-search.js, shared across pages)
  const logoutBtn = document.querySelector('nav a.btn-primary');
  if (logoutBtn && logoutBtn.textContent === 'Logout') {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WebNovaAPI.logout();
    });
  }
});
