/* global gapi, google */
/**
 * googleAuth.js
 * Handles authentication for the Expense Splitter app using Google Identity Services.
 */

import CONFIG from './config.js';

// Discovery doc and required scopes for Google Sheets API
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Cached OAuth token storage keys
const TOKEN_KEY = 'gsi_access_token';
const TOKEN_EXPIRY_KEY = 'gsi_access_token_expiry';

let tokenClient;
let isAuthorized = false;

/**
 * Schedule a silent token refresh just before the current token expires.
 * @param {number} expiresIn  Token lifetime in seconds
 */
function scheduleTokenRefresh(expiresIn) {
  // Refresh a minute before expiry, or halfway if expiry is short
  const refreshDelay = Math.max((expiresIn - 60) * 1000, (expiresIn * 1000) / 2);
  setTimeout(() => {
    tokenClient.requestAccessToken({ prompt: '' });
  }, refreshDelay);
}

/**
 * Initializes gapi client and Google Identity token client.
 * @returns {Promise<void>}
 */
export function initAuth() {
  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: CONFIG.API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('Token error', tokenResponse);
              return;
            }
            isAuthorized = true;
            updateSigninButtons(true);
            // Cache token and its expiry, and schedule silent refresh
            localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
            const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
            // Refresh the access token a bit before it expires (silent, no prompt)
            scheduleTokenRefresh(tokenResponse.expires_in);
            signInListeners.forEach(l => l());
            resolve();
          },
        });
        updateSigninButtons(false);
        // Try to restore a cached token if still valid
        const cachedToken = localStorage.getItem(TOKEN_KEY);
        const cachedExpiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
        if (cachedToken && cachedExpiry > Date.now()) {
          gapi.client.setToken({ access_token: cachedToken });
          isAuthorized = true;
          updateSigninButtons(true);
          // Schedule silent refresh based on remaining lifetime
          const remainingSecs = (cachedExpiry - Date.now()) / 1000;
          scheduleTokenRefresh(remainingSecs);
          signInListeners.forEach(l => l());
          resolve();
          return;
        }
        // Hook up sign-in/out button events
        const btnIn = document.getElementById('btn-signin');
        const btnOut = document.getElementById('btn-signout');
        if (btnIn && btnOut) {
          btnIn.onclick = signIn;
          btnOut.onclick = signOut;
        }
      } catch (err) {
        console.error('Error initializing Google API client', err);
        reject(err);
      }
    });
  });
}

let signInListeners = [];
export function addSignInListener(callback) {
  signInListeners.push(callback);
}
/**
 * Prompts the user to sign in / grant permissions.
 */
export function signIn() {
  tokenClient.requestAccessToken({ prompt: '' });
}

/**
 * Signs out the user by revoking the current token.
 */
export function signOut() {
  const token = gapi.client.getToken();
  if (token?.access_token) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken('');
      isAuthorized = false;
      updateSigninButtons(false);
      // Clear cached token
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    });
  } {
    isAuthorized = false;
    updateSigninButtons(false);
    // Clear cached token
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

/**
 * Retrieves the current OAuth2 access token for Google APIs.
 * @returns {string|null} Access token, or null if not signed in.
 */
export function getAccessToken() {
  const token = gapi.client.getToken();
  return token ? token.access_token : null;
}


let authorizedElements = [];
/**
 * Shows or hides sign-in/out buttons based on auth status.
 * @param {boolean} authorized
 */
function updateSigninButtons(authorized) {
  const btnSignIn = document.getElementById('btn-signin');
  const btnSignOut = document.getElementById('btn-signout');
  if (!btnSignIn || !btnSignOut) return;
  if (authorized) {
    btnSignIn.style.display = 'none';
    btnSignOut.style.display = 'inline-block';
  } else {
    btnSignIn.style.display = 'inline-block';
    btnSignOut.style.display = 'none';
  }
  authorizedElements.forEach(e => {
    e.style.display = authorized ? 'block' : 'none';
  });
}


/**
 * Adds an element to the list of authorized elements.
 * @param {Element} element
 */
export function addAuthorizedElement(elements) {
  authorizedElements = authorizedElements.concat(elements);
  updateSigninButtons(isAuthorized);
}

export function getIsAuthorized() { return isAuthorized; }