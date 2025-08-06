/**
 * utils.js
 * Utility functions for Expense Splitter.
 */

/**
 * Calculate net balance for each user based on expenses.
 * Positive balance means the user is owed money; negative means they owe money.
 * @param {Array<{payer:string,recipients:string[],amount:number}>} expenses
 * @param {string[]} users
 * @returns {{[user:string]:number}}
 */
import CONFIG from './config.js';

/**
 * Calculate net balance for each user based on expenses.
 * Positive balance means the user is owed money; negative means they owe money.
 * Balances smaller than CONFIG.BALANCE_EPSILON (absolute) are snapped to zero.
 * @param {Array<{payer:string,recipients:string[],amount:number}>} expenses
 * @param {string[]} users
 * @returns {{[user:string]:number}}
 */
export function calculateSplits(expenses, users) {
  const balances = {};
  // Initialize balances
  users.forEach(u => {
    balances[u] = 0;
  });
  // Process each expense
  expenses.forEach(exp => {
    const { payer, recipients, amount } = exp;
    const count = recipients.length;
    if (count === 0) return;
    const share = amount / count;
    // Each recipient owes their share
    recipients.forEach(r => {
      if (balances[r] != null) {
        balances[r] -= share;
      }
    });
    // Payer is credited the full amount
    if (balances[payer] != null) {
      balances[payer] += amount;
    }
  });
  // Snap tiny rounding errors to zero
  users.forEach(u => {
    if (Math.abs(balances[u]) < CONFIG.BALANCE_EPSILON) {
      balances[u] = 0;
    }
  });
  return balances;
}

export function loader(callback) {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';
  callback();
  loader.style.display = 'none';
}