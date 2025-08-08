/**
 * app.js
 * Main entry point for Expense Splitter application.
 */

import CONFIG from './config.js';
import { initAuth, getIsAuthorized, addSignInListener } from './googleAuth.js';
import { getExpenses } from './sheetsService.js';
import { renderExpenseForm } from './expenseForm.js';
import { renderExpenseList } from './expenseList.js';
import { renderBalance } from './balanceView.js';
import { calculateSplits , loader } from './utils.js';

import { renderSetupScreen } from './setup.js';
import { renderSheetPicker } from './sheetPicker.js';

async function initApp() {
  toggleNavs(false);

  addSignInListener(postAuth);

  // Initialize application (auth)
  await initAuth();

  if (getIsAuthorized()) return;

  await postAuth();
}

const NAV_IDS = ['nav-expenses', 'nav-balance', 'nav-add'];

function toggleNavs(show) {
  NAV_IDS.forEach(
    (id) =>
      (document.getElementById(id).style.display = show
        ? 'inline-block'
        : 'none')
  );
}

async function postAuth() {
  const main = document.getElementById('app');

  // If no sheet ID provided, show setup screen
  if (!CONFIG.SHEET_ID) {
    toggleNavs(false);
    renderSetupScreen(main);
    return;
  }
  toggleNavs(true);

  // Show link to open the Google Sheet in a new tab
  const openSheetLink = document.getElementById('nav-opensheet');
  if (openSheetLink) {
    openSheetLink.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
    openSheetLink.style.display = 'inline-block';
  }

  // Load users list and payment notes from the 'Users' sheet (columns A and B)
  try {
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.SHEET_ID,
      range: 'Users!A:B',
    });
    const rows = resp.result.values || [];
    const users = [];
    const notes = {};
    rows.forEach((r) => {
      const name = (r[0] || '').trim();
      if (!name) return;
      users.push(name);
      notes[name] = (r[1] || '').trim();
    });
    CONFIG.USERS = users;
    CONFIG.USER_NOTES = notes;
    window.USERS = users;
    window.USER_NOTES = notes;
  } catch (err) {
    console.error("Failed to load user list from 'Users' sheet:", err);
    // If user is signed in but lacks permission, let them pick another spreadsheet
    toggleNavs(false);
    renderSheetPicker(main);
    return;
  }
  // Wire up Expenses nav button to fetch and render the expense list
  const navExpenses = document.getElementById('nav-expenses');
  if (navExpenses) {
    navExpenses.addEventListener('click', async (e) => {
      loader(async () => {
        e.preventDefault();
        const expenses = await getExpenses();
        renderExpenseList(main, expenses);
      });
    });
  }

  // Wire up Add Expense nav button to show the expense form
  const navAdd = document.getElementById('nav-add');
  if (navAdd) {
    navAdd.addEventListener('click', async (e) => {
      loader(async () => {
        e.preventDefault();
        // Render the expense entry form, and then refresh the expense list on success
        renderExpenseForm(main, async () => {
          const expenses = await getExpenses();
          renderExpenseList(main, expenses);
        });
      });
    });
  }

  // Wire up Balance nav button to fetch expenses, calculate splits, and render balances
  const navBalance = document.getElementById('nav-balance');
  if (navBalance) {
    navBalance.addEventListener('click', async (e) => {
      loader(async () => {
        e.preventDefault();
        const expenses = await getExpenses();
        const balances = calculateSplits(expenses, CONFIG.USERS);
        renderBalance(main, balances);
      });
    });
  }

  navBalance.click();
}

document.addEventListener('DOMContentLoaded', initApp);
