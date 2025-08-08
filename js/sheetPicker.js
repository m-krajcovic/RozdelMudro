/**
 * sheetPicker.js
 * Renders a Google Picker to let the user select a Google Spreadsheet
 * when they are signed in but lack access to the configured sheet.
 */
import CONFIG from './config.js';

/**
 * Renders a button that launches the Google Picker for spreadsheets.
 * @param {HTMLElement} container
 */
export function renderSheetPicker(container) {
  container.innerHTML = '';
  const msg = document.createElement('p');
  msg.textContent =
    'RozdelMudro does not have access to the configured spreadsheet. Please select the sheet:';
  msg.className = 'mb-4';
  const btn = document.createElement('button');
  btn.textContent = 'Select Spreadsheet';
  btn.className = 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700';
  btn.addEventListener('click', createPicker);
  container.append(msg, btn);
}

/**
 * Loads the Picker API and builds the picker for spreadsheets.
 */
function createPicker() {
  gapi.load('picker', () => {
    const view = new google.picker.DocsView(
      google.picker.ViewId.SPREADSHEETS
    );
    view.setFileIds(CONFIG.SHEET_ID);
    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(gapi.client.getToken()?.access_token)
      .setDeveloperKey(CONFIG.API_KEY)
      .setAppId(CONFIG.APP_ID)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  });
}

/**
 * Called when the user picks a file or cancels.
 * @param {Object} data
 */
function pickerCallback(data) {
  console.log(data);
  console.log(data.viewToken);
  if (
    data.action === google.picker.Action.PICKED &&
    data.docs &&
    data.docs.length
  ) {
    const doc = data.docs[0];
    const id = doc.id;

    // Redirect to the app with the chosen sheet ID
    const params = new URLSearchParams({ sheet: id });
    window.location.href = `${window.location.pathname}?${params}`;
  }
}
