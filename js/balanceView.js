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
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const header = document.createElement('thead');
  header.innerHTML = `
    <tr style="text-align:left; border-bottom:1px solid #ccc;">
      <th>User</th>
      <th>Balance</th>
    </tr>
  `;

  const body = document.createElement('tbody');
  users.forEach(user => {
    const row = document.createElement('tr');
    const bal = balances[user];
    const balStr = bal >= 0 ? `+$${bal.toFixed(2)}` : `-$${Math.abs(bal).toFixed(2)}`;
    row.innerHTML = `
      <td style="padding:0.5rem 0;">${user}</td>
      <td style="padding:0.5rem 0;">${balStr}</td>
    `;
    body.appendChild(row);
  });

  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);
}