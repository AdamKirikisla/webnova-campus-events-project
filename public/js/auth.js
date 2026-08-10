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

// 1. GESTION DE L'INSCRIPTION
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();

  // On récupère le champ unique (N'oublie pas de changer l'ID dans ton HTML !)
  const firstName = document.getElementById('signup-firstname').value.trim();
  const lastName = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const fullName = `${firstName} ${lastName}`;

  try {
    // On envoie la requête POST à notre vrai backend Node.js
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
      // Si le backend renvoie une erreur (ex: Email déjà utilisé)
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Erreur lors de la création du compte :', error);
    alert('Server error. Please try again later.');
  }
});

// 2. GESTION DE LA CONNEXION
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    // On envoie les infos au serveur pour vérification
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Magie du serveur : c'est lui qui nous dit vers quelle page aller !
      window.location.href = data.redirectUrl;
    } else {
      alert('Invalid email or password.');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    alert('Server error. Please try again later.');
  }
});
