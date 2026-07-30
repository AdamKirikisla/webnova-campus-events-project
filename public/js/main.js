window.addEventListener('pageshow', function (event) {
  // Sélectionne tous les formulaires de la page et les réinitialise
  document.querySelectorAll('form').forEach((form) => form.reset());
});
