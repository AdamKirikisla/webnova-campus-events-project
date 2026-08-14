document.getElementById('form-contact').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Your message has been sent!');
      e.target.reset();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Server error. Please try again later.');
  }
});
