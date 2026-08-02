// Automatically clear all form inputs when the page is loaded or restored from history
window.addEventListener('pageshow', function (event) {
  document.querySelectorAll('form').forEach((form) => form.reset());
});
