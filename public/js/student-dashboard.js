document.addEventListener('DOMContentLoaded', () => {
  // 2. Update the Hero Card welcome message
  const welcomeHeader = document.querySelector('.hero-card h1');
  // 3. Update the name in the Student Profile panel (3rd panel)
  const panels = document.querySelectorAll('.panel');

  // Ensure fakeEvents is loaded from data.js
  if (typeof fakeEvents !== 'undefined') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the IDs of events the user is registered for (fallback to empty array if none)

    // --- 4. UPCOMING EVENTS PANEL (My registered events) ---
    const upcomingPanel = panels[0];

    // Filter fakeEvents to keep ONLY those the user is registered for, AND that are in the future
    const myUpcomingEvents = fakeEvents
      .filter((e) => myEventIds.includes(e.event_id))
      .filter((e) => new Date(e.event_date) >= today)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    upcomingPanel.innerHTML = '<h2>Upcoming events</h2>';
    if (myUpcomingEvents.length === 0) {
      upcomingPanel.innerHTML += '<p style="padding-top: 10px;">You have no upcoming events.</p>';
    } else {
      myUpcomingEvents.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.innerHTML = `
          <a href="event-details.html?id=${event.event_id}" class="event-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <strong style="color: var(--primary-color);">${event.title}</strong>
            <span class="muted" style="font-size: 0.9rem; color: #666;">${event.event_date} • ${event.start_time} • ${event.location}</span>
          </a>
        `;
        upcomingPanel.appendChild(eventDiv);
      });
    }

    // --- 5. RECOMMENDED FOR YOU PANEL ---
    const recommendPanel = panels[1];

    // Filter fakeEvents: must be 'open', in the future, and NOT already in the user's registered list
    const recommendedEvents = fakeEvents
      .filter((e) => e.status === 'open')
      .filter((e) => new Date(e.event_date) >= today)
      .filter((e) => !myEventIds.includes(e.event_id)) // The magic line that excludes registered events
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 3);

    // Update the hero text dynamic counters
    const heroText = document.querySelector('.hero-card p');
    if (heroText) {
      heroText.textContent = `You have ${myUpcomingEvents.length} upcoming events and ${recommendedEvents.length} new recommendations this week.`;
    }

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
            <span class="muted" style="font-size: 0.9rem; color: #666;">${event.category} • ${event.event_date}</span>
          </a>
        `;
        recommendPanel.appendChild(eventDiv);
      });
    }
  }

  // 6. Handle Logout Logic securely
  const logoutBtn = document.querySelector('nav a.btn-primary');
  if (logoutBtn && logoutBtn.textContent === 'Logout') {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html'; // Redirect to login
    });
  }
});
