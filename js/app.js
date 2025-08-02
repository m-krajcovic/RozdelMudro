/**
 * app.js
 * Main entry point for Expense Splitter application.
 */

import CONFIG from './config.js';
import { addAuthorizedElement, initAuth, getIsAuthorized, addSignInListener } from './googleAuth.js';
import { getExpenses } from './sheetsService.js';
import { renderExpenseForm } from './expenseForm.js';
import { renderExpenseList } from './expenseList.js';
import { renderBalance } from './balanceView.js';
import { calculateSplits } from './utils.js';

import { renderSetupScreen } from './setup.js';

async function initApp() {
  addSignInListener(postAuth);
  addAuthorizedElement(['nav-expenses', 'nav-balance', 'nav-add'].map(id => document.getElementById(id)));


  // Initialize application (auth)
  await initAuth();

  if (getIsAuthorized()) return;

  await postAuth();
}

async function postAuth() {
  const main = document.getElementById('app');

  // If no sheet ID provided, show setup screen  
  if (!CONFIG.SHEET_ID) {
    ['nav-expenses', 'nav-balance', 'nav-add'].map(id => document.getElementById(id)).forEach(e => e.style.display = 'none');
    renderSetupScreen(main);
    return;
  }
  ['nav-expenses', 'nav-balance', 'nav-add'].map(id => document.getElementById(id)).forEach(e => e.style.display = 'inline-block');

  // Show link to open the Google Sheet in a new tab
  const openSheetLink = document.getElementById('nav-opensheet');
  if (openSheetLink) {
    openSheetLink.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
    openSheetLink.style.display = 'inline-block';
  }

  // Load users list from cell A1 of the Expenses sheet (comma-delimited)
  try {
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.SHEET_ID,
      range: 'Expenses!A1',
    });
    const raw = (resp.result.values || [['']])[0][0] || '';
    const users = raw.split(',').map(u => u.trim()).filter(Boolean);
    CONFIG.USERS = users;
    window.USERS = users;
  } catch (err) {
    console.error('Failed to load user list from A1:', err);
  }
  // Wire up Expenses nav button to fetch and render the expense list
  const navExpenses = document.getElementById('nav-expenses');
  if (navExpenses) {
    navExpenses.addEventListener('click', async e => {
      e.preventDefault();
      const expenses = await getExpenses();
      renderExpenseList(main, expenses);
    });
  }

  // Wire up Add Expense nav button to show the expense form
  const navAdd = document.getElementById('nav-add');
  if (navAdd) {
    navAdd.addEventListener('click', e => {
      e.preventDefault();
      // Render the expense entry form, and then refresh the expense list on success
      renderExpenseForm(main, async () => {
        const expenses = await getExpenses();
        renderExpenseList(main, expenses);
      });
    });
  }

  // Wire up Balance nav button to fetch expenses, calculate splits, and render balances
  const navBalance = document.getElementById('nav-balance');
  if (navBalance) {
    navBalance.addEventListener('click', async e => {
      e.preventDefault();
      const expenses = await getExpenses();
      const balances = calculateSplits(expenses, CONFIG.USERS);
      renderBalance(main, balances);
    });
  }

  navAdd.click();
}

document.addEventListener('DOMContentLoaded', initApp);