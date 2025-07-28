/**
 * setup.js
 * Renders the initial setup screen to capture Sheet ID and user list.
 */

/**
 * Renders a form prompting for the Google Sheet ID and list of users.
 * On submit, redirects to the same page with URL parameters.
 * @param {HTMLElement} container
 */
export function renderSetupScreen(container) {
  const form = document.createElement('form');
  form.innerHTML = `
    <h2>Configure Expense Splitter</h2>
    <div>
      <label for="sheet-input">Google Sheet ID:</label><br>
      <input id="sheet-input" name="sheet" type="text" required style="width:100%; max-width:400px;">
    </div>
    <div style="margin-top:1rem;">
      <label for="users-input">Users (comma-separated):</label><br>
      <input id="users-input" name="users" type="text" required style="width:100%; max-width:400px;">
    </div>
    <div style="margin-top:1rem;">
      <button type="submit">Start</button>
    </div>
  `;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const sheet = data.get('sheet').trim();
    const usersRaw = data.get('users');
    const users = usersRaw.split(',').map(u => u.trim()).filter(Boolean).join(',');
    const params = new URLSearchParams({ sheet, users });
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  });
  container.innerHTML = '';
  container.appendChild(form);
}