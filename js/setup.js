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
      <input id="sheet-input" name="sheet" type="text" style="width:100%; max-width:400px;">
    </div>
    <div style="margin-top:1rem;">
      <label for="users-input">Users (comma-separated):</label><br>
      <input id="users-input" name="users" type="text" required style="width:100%; max-width:400px;">
    </div>
    <div style="margin-top:1rem;">
      <button type="submit">Start</button>
    </div>
  `;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const sheet = (data.get('sheet') || '').trim();
    const usersRaw = data.get('users') || '';
    const users = usersRaw.split(',').map(u => u.trim()).filter(Boolean).join(',');
    // If no sheet ID provided, create a new Google Sheet via Sheets API
    let targetSheet = sheet;
    if (!targetSheet) {
      // Lazy-load authentication and create sheet
      try {
        const { initAuth } = await import('./googleAuth.js');
        await initAuth();
        const response = await gapi.client.sheets.spreadsheets.create({
          properties: { title: 'Expense Splitter' },
        });
        targetSheet = response.result.spreadsheetId;
      } catch (err) {
        console.error('Failed to create new sheet:', err);
        alert('Error creating Google Sheet. See console for details.');
        return;
      }
    }
    const params = new URLSearchParams({ sheet: targetSheet, users });
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  });
  container.innerHTML = '';
  container.appendChild(form);
}