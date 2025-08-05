/**
 * config.js
 * Application configuration for Expense Splitter web app.
 */

// Read the Sheet ID from the URL parameter (?sheet=...)
const SHEET_ID = new URLSearchParams(window.location.search).get('sheet');

const CONFIG = {
  // Google OAuth Client ID (from README)
  GOOGLE_CLIENT_ID: '649159303626-ihv57vmqcgeoug66qrbde8ns9p42sud8.apps.googleusercontent.com',
  // API key for Google APIs (e.g. Sheets API)
  API_KEY: 'AIzaSyBBeIXuQ-wtfz8KSd_COIMkSAxznXMr_7U',
  // The Google Sheet to use for expenses and user list
  SHEET_ID,
  // Users list loaded dynamically from the 'Users' sheet, one user name per row in column A
  USERS: [],
};

// Expose sheet ID globally for convenience
window.SHEET_ID = CONFIG.SHEET_ID;

export default CONFIG;