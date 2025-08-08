/**
 * sheetsService.js
 * Interacts with Google Sheets API to fetch and update expenses.
 */

import CONFIG from './config.js';
import { getAccessToken } from './googleAuth.js';

// Range name for the Expenses sheet (assumes headers in row 1: payer, recipients, amount, description)
const EXPENSES_RANGE = 'Expenses!A1:D';

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
      rowIndex: i + 1,
      payer,
      recipients: recipients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      amount: parseFloat(amount),
      description,
    };
  });
}

/**
 * Appends or updates an expense row in the sheet.
 * If expense.rowIndex is provided, updates that row; otherwise appends a new row.
 */
export async function addExpense(expense) {
  if (!getAccessToken()) throw new Error('User not authenticated');
  const values = [
    [
      expense.payer,
      expense.recipients.join(','),
      expense.amount,
      expense.description || '',
    ],
  ];
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

// Internal cache for the Expenses sheet ID
let EXPENSES_SHEET_ID = null;

/**
 * Retrieves the sheetId for the "Expenses" tab via spreadsheet metadata.
 * @returns {Promise<number>}
 */
async function getExpensesSheetId() {
  if (EXPENSES_SHEET_ID != null) return EXPENSES_SHEET_ID;
  const meta = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: CONFIG.SHEET_ID,
    fields: 'sheets(properties(sheetId,title))',
  });
  const sheet = meta.result.sheets.find(
    (s) => s.properties.title === 'Expenses'
  );
  if (!sheet) throw new Error('Expenses sheet not found');
  EXPENSES_SHEET_ID = sheet.properties.sheetId;
  return EXPENSES_SHEET_ID;
}

/**
 * Deletes a row from the Expenses sheet.
 * @param {number} rowIndex 1-based sheet row index to delete
 * @returns {Promise<gapi.client.Response>} batchUpdate response
 */
export async function deleteExpense(rowIndex) {
  if (!getAccessToken()) throw new Error('User not authenticated');
  const sheetId = await getExpensesSheetId();
  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex - 1,
          endIndex: rowIndex,
        },
      },
    },
  ];
  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: CONFIG.SHEET_ID,
    resource: { requests },
  });
}
