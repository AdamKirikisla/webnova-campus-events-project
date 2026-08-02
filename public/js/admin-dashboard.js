// Calculate and display the total number of events present in the mock dataset
const statTotalEvents = document.querySelector('#statTotalEvents');

statTotalEvents.textContent = fakeEvents.length;

// Filter the events array to isolate, count, and render only the 'open' events
const statUpcomingEvents = document.querySelector('#statUpcomingEvents');
const upcomingCount = fakeEvents.filter((e) => e.status === 'open').length;
statUpcomingEvents.textContent = upcomingCount;

// Filter the events array to isolate and count events that have reached 'full' capacity
const statFullCapacity = document.querySelector('#statFullCapacity');
const fullCount = fakeEvents.filter((e) => e.status === 'full').length;
statFullCapacity.textContent = fullCount;

// Filter the events array to isolate and count events that have been explicitly 'cancelled'
const statCancelledEvents = document.querySelector('#statCancelledEvents');
const cancelledCount = fakeEvents.filter((e) => e.status === 'cancelled').length;
statCancelledEvents.textContent = cancelledCount;
