// Shared "search events" widget for the top navigation bar.
// Include this script (after api.js) on any page whose header has the
// .nav-search markup: #nav-search-form / #nav-search-input / #nav-search-results.
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('nav-search-form');
  const searchInput = document.getElementById('nav-search-input');
  const searchResults = document.getElementById('nav-search-results');

  if (!searchForm || !searchInput || !searchResults || typeof WebNovaAPI === 'undefined') {
    return;
  }

  const MAX_RESULTS = 6;

  // The event list is fetched once, on the first keystroke, then reused.
  // Caching the promise means concurrent keystrokes share a single request.
  let eventsPromise = null;
  const loadEvents = () => {
    if (!eventsPromise) {
      eventsPromise = WebNovaAPI.getEvents().catch(() => []);
    }
    return eventsPromise;
  };

  // Guards against an older request rendering over a newer query's results.
  let latestQuery = '';

  // Hides the dropdown and empties it. aria-expanded keeps screen readers
  // informed about whether the suggestion list is currently showing.
  const closeResults = () => {
    searchResults.hidden = true;
    searchResults.innerHTML = '';
    searchInput.setAttribute('aria-expanded', 'false');
  };

  // Paints the dropdown. Each row links straight to that event's detail page.
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

  // Runs on every keystroke. Lowercased once here so the comparisons below
  // are case-insensitive without calling toLowerCase on the query repeatedly.
  const runSearch = async (rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    latestQuery = query;

    // An empty box shows nothing rather than every event.
    if (!query) {
      closeResults();
      return;
    }

    const events = await loadEvents();

    // A newer keystroke arrived while this request was in flight — drop it.
    if (latestQuery !== query) return;

    const matches = events
      .filter((event) =>
        [event.title, event.category, event.location, event.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
      )
      .slice(0, MAX_RESULTS);

    renderResults(matches);
  };

  // Search as the student types, no button press needed.
  searchInput.addEventListener('input', (e) => runSearch(e.target.value));

  // Escape dismisses the dropdown and gives up focus.
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeResults();
      searchInput.blur();
    }
  });

  // Pressing Enter opens the first suggestion. preventDefault stops the form
  // from reloading the page, which is the default behaviour of a submit.
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
