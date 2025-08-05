/**
 * sheetsService.js
 * Interacts with Google Sheets API to fetch and update expenses.
 */

import CONFIG from './config.js';
import { getAccessToken } from './googleAuth.js';

// Range name for the Expenses sheet (assumes headers in row 1: payer, recipients, amount, description)
const EXPENSES_RANGE = 'Expenses!A1:D';

/**
 * Fetches all expenses from the Google Sheet.
 * @returns {Promise<Array<{payer: string, recipients: string[], amount: number}>>}
 */
/**
 * Fetches all expenses from the Google Sheet and includes sheet row number.
 * @returns {Promise<Array<{rowIndex:number,payer:string,recipients:string[],amount:number,description:string}>>}
 */
export async function getExpenses() {
  if (!getAccessToken()) throw new Error('User not authenticated');
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.SHEET_ID,
    range: EXPENSES_RANGE,
  });
  const rows = response.result.values || [];
  // rowIndex is sheet row number (starts at row 2)
  return rows.map((r, i) => {
    const [payer = '', recipients = '', amount = '0', description = ''] = r;
    return {
      rowIndex: i + 2,
      payer,
      recipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
      amount: parseFloat(amount),
      description,
    };
  });
}

/**
 * Appends a new expense to the Google Sheet.
 * @param {{payer: string, recipients: string[], amount: number}} expense
 * @returns {Promise<gapi.client.Response<AppendValuesResponse>>}
 */
/**
 * Appends or updates an expense row in the sheet.
 * If expense.rowIndex is provided, updates that row; otherwise appends a new row.
 */
export async function addExpense(expense) {
  if (!getAccessToken()) throw new Error('User not authenticated');
  const values = [[
    expense.payer,
    expense.recipients.join(','),
    expense.amount,
    expense.description || '',
  ]];
  const resource = { values };
  if (expense.rowIndex) {
    const range = `Expenses!A${expense.rowIndex}:D${expense.rowIndex}`;
    return gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: CONFIG.SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource,
    });
  }
  return gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: CONFIG.SHEET_ID,
    range: EXPENSES_RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource,
  });
}