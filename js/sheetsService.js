/**
 * sheetsService.js
 * Interacts with Google Sheets API to fetch and update expenses.
 */

import CONFIG from './config.js';
import { getAccessToken } from './googleAuth.js';

// Range name for the Expenses sheet (assumes headers in row 1)
const EXPENSES_RANGE = 'Expenses!A2:C';

/**
 * Fetches all expenses from the Google Sheet.
 * @returns {Promise<Array<{payer: string, recipients: string[], amount: number}>>}
 */
export async function getExpenses() {
  if (!getAccessToken()) {
    throw new Error('User not authenticated');
  }
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.SHEET_ID,
    range: EXPENSES_RANGE,
  });
  const rows = response.result.values || [];
  return rows.map(([payer, recipients, amount]) => ({
    payer,
    recipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
    amount: parseFloat(amount),
  }));
}

/**
 * Appends a new expense to the Google Sheet.
 * @param {{payer: string, recipients: string[], amount: number}} expense
 * @returns {Promise<gapi.client.Response<AppendValuesResponse>>}
 */
export async function addExpense(expense) {
  if (!getAccessToken()) {
    throw new Error('User not authenticated');
  }
  const values = [[
    expense.payer,
    expense.recipients.join(','),
    expense.amount,
  ]];
  const resource = { values };
  return gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: CONFIG.SHEET_ID,
    range: EXPENSES_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource,
  });
}