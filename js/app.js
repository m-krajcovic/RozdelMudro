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

function initApp() {
  const main = document.getElementById('app');
  // If no sheet ID provided, show setup screen
  if (!CONFIG.SHEET_ID) {
    renderSetupScreen(main);
    return;
  }
  // TODO: Initialize application (auth, routing, initial data load)
  initAuth();
}

document.addEventListener('DOMContentLoaded', initApp);