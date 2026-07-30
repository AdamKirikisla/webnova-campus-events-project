// Total events logic
const statTotalEvents = document.querySelector('#statTotalEvents');

statTotalEvents.textContent = fakeEvents.length;

// Upcoming (open) events logic
const statUpcomingEvents = document.querySelector('#statUpcomingEvents');
const upcomingCount = fakeEvents.filter((e) => e.status === 'open').length;
statUpcomingEvents.textContent = upcomingCount;

// Full capacity logic
const statFullCapacity = document.querySelector('#statFullCapacity');
const fullCount = fakeEvents.filter((e) => e.status === 'full').length;
statFullCapacity.textContent = fullCount;

// Cancelled events logic
const statCancelledEvents = document.querySelector('#statCancelledEvents');
const cancelledCount = fakeEvents.filter((e) => e.status === 'cancelled').length;
statCancelledEvents.textContent = cancelledCount;
