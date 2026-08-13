// STEP 1 + 2: fetch real events AND registrations for all 6 stat cards
async function loadDashboard() {
  try {
    const [eventsResponse, registrationsResponse] = await Promise.all([fetch('/events'), fetch('/registrations')]);

    if (!eventsResponse.ok) {
      throw new Error(`Request failed with status ${eventsResponse.status}`);
    }
    if (!registrationsResponse.ok) {
      throw new Error(`Request failed with status ${registrationsResponse.status}`);
    }

    const events = await eventsResponse.json();
    const registrations = await registrationsResponse.json();

    const statTotalEvents = document.querySelector('#statTotalEvents');
    statTotalEvents.textContent = events.length;

    const statUpcomingEvents = document.querySelector('#statUpcomingEvents');
    const upcomingCount = events.filter((e) => e.status === 'open').length;
    statUpcomingEvents.textContent = upcomingCount;

    const statFullCapacity = document.querySelector('#statFullCapacity');
    const fullCount = events.filter((e) => e.status === 'full').length;
    statFullCapacity.textContent = fullCount;

    const statCancelledEvents = document.querySelector('#statCancelledEvents');
    const cancelledCount = events.filter((e) => e.status === 'cancelled').length;
    statCancelledEvents.textContent = cancelledCount;

    // STEP 2: Total Registrations
    const statTotalRegistrations = document.querySelector('#statTotalRegistrations');
    statTotalRegistrations.textContent = registrations.length;

    // STEP 2: Most Popular Category
    // Events already come back with category_name joined in, so build a
    // lookup: event_id -> category_name, then count how many (non-cancelled)
    // registrations fall into each category.
    const categoryByEventId = {};
    for (let event of events) {
      categoryByEventId[event.event_id] = event.category_name;
    }

    const countByCategory = {};
    for (let reg of registrations) {
      if (reg.status === 'cancelled') continue;
      const categoryName = categoryByEventId[reg.event_id] || 'Uncategorized';
      countByCategory[categoryName] = (countByCategory[categoryName] || 0) + 1;
    }

    let popularCategory = 'N/A';
    let highestCount = 0;
    for (let categoryName in countByCategory) {
      if (countByCategory[categoryName] > highestCount) {
        highestCount = countByCategory[categoryName];
        popularCategory = categoryName;
      }
    }

    const statPopularCategory = document.querySelector('#statPopularCategory');
    statPopularCategory.textContent = popularCategory;

    // STEP 3: Percentage of Seats Filled per Event
    // Count non-cancelled registrations per event_id, then divide by that
    // event's capacity.
    const regCountByEvent = {};
    for (let reg of registrations) {
      if (reg.status === 'cancelled') continue;
      regCountByEvent[reg.event_id] = (regCountByEvent[reg.event_id] || 0) + 1;
    }

    const statBlockCapacity = document.querySelector('#statBlockCapacity');
    for (let event of events) {
      const filledCount = regCountByEvent[event.event_id] || 0;
      const percentage = event.capacity > 0 ? Math.round((filledCount / event.capacity) * 100) : 0;

      const line = document.createElement('p');
      line.classList.add('stat-line');
      line.textContent = `${event.title}: ${percentage}%`;
      statBlockCapacity.appendChild(line);
    }

    // STEP 4: Number of Registrations by Category
    const statBlockCategory = document.querySelector('#statBlockCategory');
    for (let categoryName in countByCategory) {
      const line = document.createElement('p');
      line.classList.add('stat-line');
      line.textContent = `${categoryName}: ${countByCategory[categoryName]}`;
      statBlockCategory.appendChild(line);
    }
  } catch (error) {
    console.log('Something went wrong:', error);
  }
}

loadDashboard();
