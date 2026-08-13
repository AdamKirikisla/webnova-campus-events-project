document.addEventListener('DOMContentLoaded', () => {
  // 1. Retrieve the current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Redirect to login if no active session is found
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Update the Hero Card welcome message
  const welcomeHeader = document.querySelector('.hero-card p');
  if (welcomeHeader) {
    welcomeHeader.textContent = `Welcome back, ${currentUser.name}`;
  }

  // 3. Update the name in the Student Profile panel (3rd panel)
  const panels = document.querySelectorAll('.panel');

  // Ensure fakeEvents is loaded from data.js
  if (typeof fakeEvents !== 'undefined') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the IDs of events the user is registered for (fallback to empty array if none)
    const myEventIds = currentUser.registeredEvents || [];

    //  4. UPCOMING EVENTS PANEL (My registered events)
    const upcomingPanel = document.querySelector('.panel-upcoming-event');

    // Filter fakeEvents to keep ONLY those the user is registered for, AND that are in the future
    const myUpcomingEvents = fakeEvents
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
    const myAttendedEvents = fakeEvents.filter((e) => myEventIds.includes(e.event_id));

    const categoryCounts = {};
    myAttendedEvents.forEach((event) => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });

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
        // All events in the favorite category that have already passed, whether attended or not
        const favoriteCategoryPassed = fakeEvents.filter(
          (e) => e.category === favoriteCategory && new Date(e.event_date) < today
        ).length;
        const favoriteCategoryAttended = pastAttendedEvents.filter((e) => e.category === favoriteCategory).length;
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

      // Calendar-month boundaries
      const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

      const thisMonthStart = startOfMonth(today);
      const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);

      const attendedThisMonth = pastAttendedEvents.filter((e) => new Date(e.event_date) >= thisMonthStart).length;
      const attendedLastMonth = pastAttendedEvents.filter((e) => {
        const d = new Date(e.event_date);
        return d >= lastMonthStart && d < thisMonthStart;
      }).length;

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

    const myRegisteredEvents = fakeEvents
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

    // Filter fakeEvents: must be 'open', in the future, and NOT already in the user's registered list
    const recommendedEvents = fakeEvents
      .filter((e) => e.status === 'open')
      .filter((e) => new Date(e.event_date) >= today)
      .filter((e) => !myEventIds.includes(e.event_id)) // The magic line that excludes registered events
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
  }

  // 6. Handle Logout Logic securely
  // (Nav search bar logic now lives in public/js/nav-search.js, shared across pages)
  const logoutBtn = document.querySelector('nav a.btn-primary');
  if (logoutBtn && logoutBtn.textContent === 'Logout') {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser'); // Erase the user session
      window.location.href = 'login.html'; // Redirect to login
    });
  }
});
