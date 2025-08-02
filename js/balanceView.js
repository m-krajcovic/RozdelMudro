/**
 * balanceView.js
 * Renders the balance summary view.
 */

/**
 * Renders the balance summary for each user in a table.
 * @param {HTMLElement} container
 * @param {{[user:string]: number}} balances
 */
/**
 * Given net balances for users, returns a list of settlement suggestions.
 * @param {{[user:string]: number}} balances
 * @returns {Array<{from: string, to: string, amount: number}>}
 */
function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];
  Object.entries(balances).forEach(([user, bal]) => {
    if (bal > 0) creditors.push({ user, bal });
    else if (bal < 0) debtors.push({ user, bal });
  });
  // Sort creditors descending (highest positive first), debtors ascending (most negative first)
  creditors.sort((a, b) => b.bal - a.bal);
  debtors.sort((a, b) => a.bal - b.bal);

  const suggestions = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(creditor.bal, -debtor.bal);
    if (amount <= 0) break;
    suggestions.push({ from: debtor.user, to: creditor.user, amount });
    debtor.bal += amount;
    creditor.bal -= amount;
    if (Math.abs(debtor.bal) < 1e-6) i++;
    if (Math.abs(creditor.bal) < 1e-6) j++;
  }
  return suggestions;
}

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

  // Suggest settlements between debtors and creditors
  const suggestions = computeSettlements(balances);
  if (suggestions.length > 0) {
    const sec = document.createElement('div');
    sec.innerHTML = `<h3 class="text-lg font-semibold mb-2">Settlements</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'list-disc ml-6 mb-4';
    suggestions.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.from} pays ${s.to} $${s.amount.toFixed(2)}`;
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    container.appendChild(sec);
  }
}