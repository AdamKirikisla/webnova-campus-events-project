// Total events logic
const statTotalEvents = document.querySelector('#statTotalEvents');

statTotalEvents.textContent = fakeEvents.length;

// Full capacity logic
const statFullCapacity = document.querySelector('#statFullCapacity');
const fullCount = fakeEvents.filter((e) => e.status === 'full').length;
statFullCapacity.textContent = fullCount;

// Cancelled events logic
const statCancelledEvents = document.querySelector('#statCancelledEvents');
const cancelledCount = fakeEvents.filter((e) => e.status === 'cancelled').length;
statCancelledEvents.textContent = cancelledCount;
