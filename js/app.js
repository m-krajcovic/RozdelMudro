/**
 * app.js
 * Main entry point for Expense Splitter application.
 */

import CONFIG from './config.js';
import { initAuth } from './googleAuth.js';
import { getExpenses, addExpense } from './sheetsService.js';
import { renderExpenseForm } from './expenseForm.js';
import { renderExpenseList } from './expenseList.js';
import { renderBalance } from './balanceView.js';
import { calculateSplits } from './utils.js';

import { renderSetupScreen } from './setup.js';

async function initApp() {
  const main = document.getElementById('app');
  // If no sheet ID provided, show setup screen
  if (!CONFIG.SHEET_ID) {
    renderSetupScreen(main);
    return;
  }
  // Show link to open the Google Sheet in a new tab
  const openSheetLink = document.getElementById('nav-opensheet');
  if (openSheetLink) {
    openSheetLink.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
    openSheetLink.style.display = 'inline-block';
  }
  // Initialize application (auth, routing, wiring up views)
  await initAuth();
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
}

document.addEventListener('DOMContentLoaded', initApp);