document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Management (currentUser now carries the real database user_id)
  const currentUser = WebNovaAPI.requireLogin();
  if (!currentUser) return;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WebNovaAPI.logout();
    });
  }

  const titleElement = document.getElementById('event-title');
  const detailsElement = document.getElementById('event-details');
  const actionsElement = document.getElementById('dynamic-actions');

  // 2. Read the event id from the URL, e.g. event-details.html?id=3
  const params = new URLSearchParams(window.location.search);
  const eventId = Number(params.get('id'));

  if (!Number.isInteger(eventId)) {
    titleElement.textContent = 'Event not found';
    detailsElement.innerHTML = '<p>Sorry, this event could not be found or has been removed.</p>';
    return;
  }

  // The event itself, plus this student's registrations so we know whether
  // they already signed up (and with which status).
  let event;
  let registrations;
  try {
    [event, registrations] = await Promise.all([
      WebNovaAPI.getEvent(eventId),
      WebNovaAPI.getUserRegistrations(currentUser.user_id),
    ]);
  } catch (err) {
    console.error(err);
    titleElement.textContent = 'Event not found';
    detailsElement.innerHTML = `<p>${err.message}</p>`;
    return;
  }

  // 3. Inject the event information into the details grid
  titleElement.textContent = event.title;
  detailsElement.innerHTML = `
    <div class="detail-item detail-full-width">
      <span class="detail-label">Description</span>
      <p>${event.description || '—'}</p>
    </div>
    <div class="detail-item"><span class="detail-label">Category</span><p>${event.category}</p></div>
    <div class="detail-item"><span class="detail-label">Location</span><p>${event.location || '—'}</p></div>
    <div class="detail-item"><span class="detail-label">Date</span><p>${event.event_date}</p></div>
    <div class="detail-item"><span class="detail-label">Time</span><p>${event.start_time} - ${event.end_time}</p></div>
    <div class="detail-item"><span class="detail-label">Capacity</span><p>${event.capacity} students</p></div>
    <div class="detail-item"><span class="detail-label">Status</span><p>${event.status}</p></div>
  `;

  // 4. REGISTRATION LOGIC (State Machine)
  const today = WebNovaAPI.startOfToday();
  const isPast = event.dateObj !== null && event.dateObj < today;

  // This student's non-cancelled registration for this event, if there is one.
  const registration = registrations.filter((r) => r.event_id === eventId).find((r) => WebNovaAPI.isActive(r));
  const isRegistered = Boolean(registration);

  // Small helper: run a server action, then reload so the page redraws with
  // the new state. The button is disabled meanwhile to prevent double clicks.
  const runAction = async (button, action, successMessage) => {
    button.disabled = true;
    try {
      await action();
      if (successMessage) alert(successMessage);
      window.location.reload();
    } catch (err) {
      alert(err.message);
      button.disabled = false;
    }
  };

  // --- BUTTON DECISION TREE ---

  if (event.status === 'cancelled') {
    // Case 1: the event was cancelled, so no action is possible
    actionsElement.innerHTML = `<p style="color: #d32f2f; font-weight: bold; font-size: 1.1rem;">🚨 This event has been cancelled.</p>`;
  } else if (isPast) {
    // Case 2: the event already happened
    if (isRegistered) {
      if (registration.status === 'attended') {
        actionsElement.innerHTML = `<p style="color: #2e7d32; font-weight: bold;">✅ You attended this event. Hope you had fun!</p>`;
      } else if (registration.status === 'missed') {
        actionsElement.innerHTML = `<p style="color: #d32f2f; font-weight: bold;">❌ You missed this event.</p>`;
      } else {
        // Registered, but the student has not said yet whether they showed up.
        // Their answer is saved as the status on the Registrations row.
        actionsElement.innerHTML = `
          <div style="width: 100%;">
            <p style="margin-bottom: 0.8rem; font-weight: bold; color: var(--primary-color);">You were registered for this event. Did you attend?</p>
            <div style="display: flex; gap: 1rem;">
              <button id="btn-attended" class="btn btn-primary" style="background: #2e7d32; border-color: #2e7d32;">Yes, I went</button>
              <button id="btn-missed" class="btn btn-outline" style="color: #d32f2f; border-color: #d32f2f;">No, I missed it</button>
            </div>
          </div>
        `;
        const btnAttended = document.getElementById('btn-attended');
        const btnMissed = document.getElementById('btn-missed');

        btnAttended.addEventListener('click', () =>
          runAction(btnAttended, () => WebNovaAPI.updateRegistration(registration.registration_id, 'attended'))
        );
        btnMissed.addEventListener('click', () =>
          runAction(btnMissed, () => WebNovaAPI.updateRegistration(registration.registration_id, 'missed'))
        );
      }
    } else {
      actionsElement.innerHTML = `<p style="color: #666; font-style: italic;">This event has already passed.</p>`;
    }
  } else {
    // Case 3: the event is still upcoming
    if (isRegistered) {
      // Already registered -> offer to drop (sets status 'cancelled' server-side)
      actionsElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <p style="color: #2e7d32; font-weight: bold; margin: 0;">✅ You are successfully registered!</p>
          <button id="btn-drop" class="btn btn-outline" style="color: #d32f2f; border-color: #d32f2f;">Drop Event</button>
        </div>
      `;
      const btnDrop = document.getElementById('btn-drop');
      btnDrop.addEventListener('click', () => {
        if (!confirm('Are you sure you want to drop this event?')) return;
        runAction(btnDrop, () => WebNovaAPI.updateRegistration(registration.registration_id, 'cancelled'));
      });
    } else if (event.status === 'open') {
      // Not registered and the event is open -> show the Register button.
      // The server re-checks capacity, duplicates and the date before accepting.
      actionsElement.innerHTML = `<button id="btn-register" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.8rem 2rem;">Register Now</button>`;
      const btnRegister = document.getElementById('btn-register');
      btnRegister.addEventListener('click', () =>
        runAction(
          btnRegister,
          () => WebNovaAPI.registerForEvent(currentUser.user_id, eventId),
          'Registration successful!'
        )
      );
    } else if (event.status === 'full') {
      // Not registered and the event is full -> nothing to do but say so
      actionsElement.innerHTML = `<p style="color: #f57c00; font-weight: bold;">⚠️ This event is currently full.</p>`;
    }
  }
});
