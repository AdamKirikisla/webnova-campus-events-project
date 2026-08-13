// Shared "search events" widget for the top navigation bar.
// Include this script (after events-data.js) on any page whose header has
// the .nav-search markup: #nav-search-form / #nav-search-input / #nav-search-results.
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('nav-search-form');
  const searchInput = document.getElementById('nav-search-input');
  const searchResults = document.getElementById('nav-search-results');

  if (!searchForm || !searchInput || !searchResults || typeof fakeEvents === 'undefined') {
    return;
  }

  const MAX_RESULTS = 6;

  const closeResults = () => {
    searchResults.hidden = true;
    searchResults.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');
  };

  const renderResults = (matches) => {
    if (matches.length === 0) {
      searchResults.innerHTML = '<li class="nav-search-result no-results">No events found.</li>';
    } else {
      searchResults.innerHTML = matches
        .map(
          (event) => `
            <li>
              <a class="nav-search-result" href="event-details.html?id=${event.event_id}">
                <strong>${event.title}</strong>
                <span>${event.category} · ${event.event_date}</span>
              </a>
            </li>
          `
        )
        .join('');
    }
    searchResults.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  };

  const runSearch = (rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      closeResults();
      return;
    }

    const matches = fakeEvents
      .filter((event) =>
        [event.title, event.category, event.location, event.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
      )
      .slice(0, MAX_RESULTS);

    renderResults(matches);
  };

  searchInput.addEventListener('input', (e) => runSearch(e.target.value));

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeResults();
      searchInput.blur();
    }
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstResult = searchResults.querySelector('.nav-search-result:not(.no-results)');
    if (firstResult) {
      window.location.href = firstResult.getAttribute('href');
    }
  });

  // Close the dropdown when clicking outside the search widget
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) {
      closeResults();
    }
  });
});
