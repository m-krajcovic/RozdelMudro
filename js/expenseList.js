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
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr style="text-align:left; border-bottom:1px solid #ccc;">
      <th>Description</th>
      <th>Payer</th>
      <th>Amount</th>
      <th>Recipients</th>
    </tr>
  `;
  const body = document.createElement('tbody');
  expenses.forEach(exp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:0.5rem 0;">${exp.description}</td>
      <td style="padding:0.5rem 0;">${exp.payer}</td>
      <td style="padding:0.5rem 0;">${exp.amount.toFixed(2)}</td>
      <td style="padding:0.5rem 0;">${exp.recipients.join(', ')}</td>
    `;
    body.appendChild(row);
  });
  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);
}