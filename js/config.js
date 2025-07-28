/**
 * config.js
 * Application configuration for Expense Splitter web app.
 */

/**
 * Extracts the 'sheet' parameter from the URL query string.
 * @returns {string|null}
 */
/**
 * Extracts the 'sheet' parameter from the URL query string.
 * @returns {string|null}
 */
function getSheetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('sheet');
}

/**
 * Extracts the 'users' parameter from the URL query string and returns a string array.
 * @returns {string[]}
 */
function getUsersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('users') || '';
  return raw.split(',').map(u => u.trim()).filter(Boolean);
}

// Determine initial configuration from URL parameters
const sheetId = getSheetIdFromUrl();
const usersList = getUsersFromUrl();

// Expose as globals if needed
window.SHEET_ID = sheetId;
window.USERS = usersList;

const CONFIG = {
  // Google OAuth Client ID (from README)
  GOOGLE_CLIENT_ID: '649159303626-ihv57vmqcgeoug66qrbde8ns9p42sud8.apps.googleusercontent.com',
  // API key for Google APIs (e.g. Sheets API)
  API_KEY: 'AIzaSyBBeIXuQ-wtfz8KSd_COIMkSAxznXMr_7U',
  // Google Sheet ID, supplied by URL parameter 'sheet'
  SHEET_ID: sheetId,
  // List of users, supplied by URL parameter 'users'
  USERS: usersList,
};

export default CONFIG;