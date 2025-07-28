/**
 * balanceView.js
 * Renders the balance summary view.
 */

/**
 * Renders the balance summary for each user in a table.
 * @param {HTMLElement} container
 * @param {{[user:string]: number}} balances
 */
export function renderBalance(container, balances) {
  container.innerHTML = '';
  const users = Object.keys(balances);
  if (users.length === 0) {
    container.textContent = 'No balances to display.';
    return;
  }
  const table = document.createElement('table');
  table.className = 'w-full table-auto mb-4';

  const header = document.createElement('thead');
  header.innerHTML = `
    <tr class="text-left border-b">
      <th class="px-2 py-1">User</th>
      <th class="px-2 py-1">Balance</th>
    </tr>
  `;

  const body = document.createElement('tbody');
  users.forEach(user => {
    const row = document.createElement('tr');
    row.className = 'border-b';
    const bal = balances[user];
    const balStr = bal >= 0 ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`;
    row.innerHTML = `
      <td class="px-2 py-1">${user}</td>
      <td class="px-2 py-1">${balStr}</td>
    `;
    body.appendChild(row);
  });

  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);
}