window.addEventListener('pageshow', function (event) {
  document.querySelectorAll('form').forEach((form) => form.reset());
});
