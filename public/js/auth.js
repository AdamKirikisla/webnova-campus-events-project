// DOM elements selection for authentication forms and toggle buttons
const toggleLogin = document.getElementById('toggle-login');
const toggleSignup = document.getElementById('toggle-signup');
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

// Handle UI transitions between Login and Sign Up views
toggleSignup.addEventListener('click', () => {
  formLogin.classList.add('hidden');
  formSignup.classList.remove('hidden');
  toggleSignup.classList.add('active');
  toggleLogin.classList.remove('active');
});

toggleLogin.addEventListener('click', () => {
  formSignup.classList.add('hidden');
  formLogin.classList.remove('hidden');
  toggleLogin.classList.add('active');
  toggleSignup.classList.remove('active');
});

// Auto-select Sign Up form if '?mode=signup' is present in the URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

if (mode === 'signup') {
  toggleSignup.click();
} else {
  toggleLogin.click();
}

// REGISTRATION (SIGN UP)
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('signup-firstname').value.trim();
  const lastName = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  const fullName = `${firstName} ${lastName}`;

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Account created successfully! You can now log in.');
      toggleLogin.click();
      formSignup.reset();
    } else {
      // Show the error message returned by the backend (e.g., "Email already exists")
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error during account creation:', error);
    alert('Server error. Please try again later.');
  }
});

// LOGIN
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = data.redirectUrl;
    } else {
      // show the error message returned by the backend (e.g., "Email or password is incorrect")
      alert(data.error || 'Invalid email or password.');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Server error. Please try again later.');
  }
});
