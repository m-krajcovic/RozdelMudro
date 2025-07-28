/**
 * expenseList.js
 * Renders the list of expenses.
 */

/**
 * Renders the list of expenses in a simple table.
 * @param {HTMLElement} container
 * @param {Array<{payer:string,recipients:string[],amount:number,description:string}>} expenses
 */
export function renderExpenseList(container, expenses) {
  container.innerHTML = '';
  if (!expenses || expenses.length === 0) {
    container.textContent = 'No expenses to display.';
    return;
  }
  const table = document.createElement('table');
  table.className = 'w-full table-auto mb-4';
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr class="text-left border-b">
      <th class="px-2 py-1">Description</th>
      <th class="px-2 py-1">Payer</th>
      <th class="px-2 py-1">Amount</th>
      <th class="px-2 py-1">Recipients</th>
    </tr>
  `;
  const body = document.createElement('tbody');
  expenses.forEach(exp => {
    const row = document.createElement('tr');
    row.className = 'border-b';
    row.innerHTML = `
      <td class="px-2 py-1">${exp.description}</td>
      <td class="px-2 py-1">${exp.payer}</td>
      <td class="px-2 py-1">${exp.amount.toFixed(2)}</td>
      <td class="px-2 py-1">${exp.recipients.join(', ')}</td>
    `;
    body.appendChild(row);
  });
  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);
}