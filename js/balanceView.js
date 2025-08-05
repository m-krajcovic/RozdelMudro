/**
 * balanceView.js
 * Renders the balance summary view and allows settling debts.
 */
import { addExpense, getExpenses } from './sheetsService.js';
import { calculateSplits } from './utils.js';
import CONFIG from './config.js';

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

/**
 * Show a modal popup with the payment notes for a given user.
 * @param {string} user
 */
function showUserNoteModal(user) {
  const note = CONFIG.USER_NOTES[user] || '(no payment info)';
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: '1000'
  });
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem',
    maxWidth: '90%', maxHeight: '80%', overflowY: 'auto'
  });
  const title = document.createElement('h4');
  title.textContent = `Payment info for ${user}`;
  title.className = 'text-lg font-semibold mb-2';
  const content = document.createElement('p');
  content.textContent = note;
  content.className = 'mb-4';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.className = 'bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400';
  closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
  modal.append(title, content, closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function renderBalance(container, balances) {
  container.innerHTML = '';
  const lastPayer = localStorage.getItem('lastPayer') || CONFIG.USERS[0] || '';
  const storedFilter = localStorage.getItem('balanceFilter');
  const filterUser = storedFilter !== null ? storedFilter : (lastPayer || 'all');
  const filterDiv = document.createElement('div');
  filterDiv.className = 'mb-4';
  filterDiv.innerHTML = `
    <label for="balance-filter" class="block mb-1">Filter by person</label>
    <select id="balance-filter" class="w-full max-w-md border border-gray-300 rounded p-2">
      ${['all', ...Object.keys(balances)].map(u => `<option value="${u}"${u===filterUser ? ' selected' : ''}>${u==='all' ? 'All' : u}</option>`).join('')}
    </select>
  `;
  const select = filterDiv.querySelector('#balance-filter');
  select.addEventListener('change', () => {
    localStorage.setItem('balanceFilter', select.value);
    renderBalance(container, balances);
  });
  container.appendChild(filterDiv);
  let users = Object.keys(balances);
  if (filterUser !== 'all') users = users.filter(u => u === filterUser);
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
    const balStr = bal >= 0 ? `+${bal.toFixed(2)}` : `-${Math.abs(bal).toFixed(2)}`;
    row.innerHTML = `
      <td class="px-2 py-1">${user}</td>
      <td class="px-2 py-1">${balStr}</td>
    `;
    body.appendChild(row);
  });

  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);

  const suggestions = computeSettlements(balances);
  const filteredSuggestions = filterUser === 'all'
    ? suggestions
    : suggestions.filter(s => s.from === filterUser || s.to === filterUser);
  if (filteredSuggestions.length > 0) {
    const sec = document.createElement('div');
    sec.innerHTML = `<h3 class="text-lg font-semibold mb-2">Settlements</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'list-none ml-6 mb-4';
    filteredSuggestions.forEach(s => {
      const li = document.createElement('li');
      li.className = 'm-1';
      li.textContent = '';
      li.appendChild(document.createTextNode(`${s.from} pays `));
      const toLink = document.createElement('button');
      toLink.textContent = s.to;
      toLink.className = 'text-blue-600 underline bg-transparent p-0 m-0';
      toLink.addEventListener('click', () => showUserNoteModal(s.to));
      li.appendChild(toLink);
      li.appendChild(document.createTextNode(` $${s.amount.toFixed(2)}`));
      const btn = document.createElement('button');
      btn.textContent = 'Settle up';
      btn.className = 'ml-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm';
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await addExpense({
            payer: s.from,
            recipients: [s.to],
            amount: s.amount,
            description: `Settlement payment from ${s.from} to ${s.to}`
          });
          const expenses = await getExpenses();
          const newBalances = calculateSplits(expenses, Object.keys(balances));
          renderBalance(container, newBalances);
        } catch (err) {
          console.error('Settlement failed', err);
          alert('Failed to record settlement. See console for details.');
          btn.disabled = false;
        }
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    container.appendChild(sec);
  }
}