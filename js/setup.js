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
    <h2 class="text-xl font-semibold mb-4">Configure Expense Splitter</h2>
    <div class="mb-4">
      <label for="sheet-input" class="block mb-1">Google Sheet ID:</label>
      <input id="sheet-input" name="sheet" type="text"
             class="w-full max-w-lg border border-gray-300 rounded p-2" />
    </div>
    <div class="mb-4">
      <label for="users-input" class="block mb-1">Users (comma-separated):</label>
      <input id="users-input" name="users" type="text" required
             class="w-full max-w-lg border border-gray-300 rounded p-2" />
    </div>
    <div>
      <button type="submit"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Start
      </button>
    </div>
  `;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const sheet = (data.get('sheet') || '').trim();
    // If no sheet ID provided, create a new Google Sheet via Sheets API
    let targetSheet = sheet;
    if (!targetSheet) {
      // Lazy-load authentication and create sheet
      try {
        const { initAuth } = await import('./googleAuth.js');
        await initAuth();
        const response = await gapi.client.sheets.spreadsheets.create({
          properties: { title: 'Expense Splitter' },
          sheets: {title: "Expenses"},
        });
        targetSheet = response.result.spreadsheetId;
      } catch (err) {
        console.error('Failed to create new sheet:', err);
        alert('Error creating Google Sheet. See console for details.');
        return;
      }
    }
    // Write users list into cell A1 (comma-delimited)
    try {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: targetSheet,
        range: 'Expenses!A1',
        valueInputOption: 'RAW',
        resource: { values: [[ data.get('users') ]] },
      });
    } catch (err) {
      console.error('Failed to write users to A1:', err);
      alert('Error saving user list to sheet. See console for details.');
      return;
    }
    const params = new URLSearchParams({ sheet: targetSheet });
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  });
  container.innerHTML = '';
  container.appendChild(form);
}