// Total events logic
const statTotalEvents = document.querySelector('#statTotalEvents');

statTotalEvents.textContent = fakeEvents.length;

// Full capacity logic
const statFullCapacity = document.querySelector('#statFullCapacity');
const fullCount = fakeEvents.filter((e) => e.status === 'full').length;
statFullCapacity.textContent = fullCount;
