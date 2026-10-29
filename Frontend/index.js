// Frontend for requirements 1–10. No React required.
// If served by XAMPP Apache, API calls go to Node on port 5050.
// If served by Node at :5050, API calls use the same origin.
// Route requests through Express, whether the frontend runs on Apache or Node.
const API_BASE = window.location.port === '5050' ? '' : 'http://localhost:5050';
const $ = (selector) => document.querySelector(selector);

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Unexpected response from backend. Is it running?'); }
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

function message(selector, content, isError = false) {
  const el = $(selector);
  el.textContent = content;
  el.classList.toggle('error', isError);
  el.classList.toggle('success', !isError && !!content);
}

function showSignedIn(username) {
  const signedIn = Boolean(username);
  $('#search-workspace').hidden = !signedIn;
  $('#locked-message').hidden = signedIn;
  $('#signed-in-panel').hidden = !signedIn;
  $('#auth-indicator').textContent = signedIn ? `Signed in: ${username}` : 'Not signed in';
  $('#welcome-user').textContent = signedIn ? `Welcome, ${username}` : '';
}

function formatSalary(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—';
}

function renderUsers(users, description) {
  const table = $('#results-body');
  table.replaceChildren();
  $('#result-count').textContent = String(users.length);
  message('#results-status', `${description} — ${users.length} matching user(s).`);
  if (users.length === 0) {
    const row = table.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.className = 'empty';
    cell.textContent = 'No matching users found.';
    return;
  }
  for (const u of users) {
    const row = table.insertRow();
    // Render database values as text.
    const values = [
      u.username, u.firstname, u.lastname, u.age, formatSalary(u.salary),
      u.registerday || '—', u.signintime || 'Never'
    ];
    for (const value of values) row.insertCell().textContent = String(value ?? '—');
  }
}

async function runSearch(path, label) {
  try {
    const result = await api(path);
    renderUsers(result.data, label);
  } catch (error) {
    message('#results-status', error.message, true);
  }
}

$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const info = Object.fromEntries(new FormData(form));
  try {
    const result = await api('/api/auth/register', {
      method: 'POST', body: JSON.stringify(info)
    });
    message('#register-status', result.message);
    form.reset();
  } catch (error) { message('#register-status', error.message, true); }
});

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const result = await api('/api/auth/login', {
      method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    showSignedIn(result.username);
    message('#login-status', result.message);
    form.reset();
  } catch (error) { message('#login-status', error.message, true); }
});

$('#logout-button').addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
    showSignedIn(null);
    message('#login-status', 'Signed out successfully.');
    $('#results-body').replaceChildren();
    $('#result-count').textContent = '0';
  } catch (error) { message('#login-status', error.message, true); }
});

$('#search-name-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const query = new URLSearchParams({
    firstname: String(fields.get('firstname') || '').trim(),
    lastname: String(fields.get('lastname') || '').trim()
  });
  await runSearch(`/api/users/name?${query}`, 'Name search');
});

$('#search-id-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = new FormData(event.currentTarget).get('username');
  await runSearch(`/api/users/id?${new URLSearchParams({ username })}`, 'User ID search');
});

$('#search-salary-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const query = new URLSearchParams({ min: fields.get('min'), max: fields.get('max') });
  await runSearch(`/api/users/salary?${query}`, 'Salary range search');
});

$('#search-age-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const query = new URLSearchParams({ min: fields.get('min'), max: fields.get('max') });
  await runSearch(`/api/users/age?${query}`, 'Age range search');
});

$('#search-registered-after-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = new FormData(event.currentTarget).get('username');
  await runSearch(
    `/api/users/registered-after?${new URLSearchParams({ username })}`,
    'Registered after search'
  );
});

$('#search-never-signed-in-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  await runSearch('/api/users/never-signed-in', 'Never signed in search');
});

$('#search-registered-same-day-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = new FormData(event.currentTarget).get('username');
  await runSearch(
    `/api/users/registered-same-day?${new URLSearchParams({ username })}`,
    'Same registration day search'
  );
});

$('#search-registered-today-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  await runSearch('/api/users/registered-today', "Today's registrations search");
});

// Restore login UI on refresh while the server-side session is active.
// Restore the active session after a refresh.
(async () => {
  try {
    const result = await api('/api/auth/me');
    showSignedIn(result.authenticated ? result.username : null);
  } catch (error) {
    showSignedIn(null);
    message('#login-status', 'Backend unavailable. Start the server using npm start.', true);
  }
})();
