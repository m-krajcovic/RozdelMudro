/**
 * config.js
 * Application configuration for Expense Splitter web app.
 */

// Read the Sheet ID from the URL parameter (?sheet=...)
const SHEET_ID = new URLSearchParams(window.location.search).get('sheet');

const CONFIG = {
  // Build-time injection via environment variables (see .env.example)
  APP_ID: process.env.APP_ID,
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  // API key for Google APIs (e.g. Sheets API)
  API_KEY: process.env.API_KEY,
  // The Google Sheet to use for expenses and user list
  SHEET_ID,
  // Users list loaded dynamically from the 'Users' sheet, one user name per row in column A
  USERS: [],
  // Optional payment notes loaded from column B in the 'Users' sheet (e.g. IBAN or payment URL)
  USER_NOTES: {},
  // Rounding threshold: ignore tiny net balances under this absolute value (e.g. cents)
  BALANCE_EPSILON: 0.1,
};

// Expose sheet ID globally for convenience
window.SHEET_ID = CONFIG.SHEET_ID;

export default CONFIG;
