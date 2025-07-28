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

let tokenClient;
let isAuthorized = false;

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
            resolve();
          },
        });
        updateSigninButtons(false);
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
    });
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
}