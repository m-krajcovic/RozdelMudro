/**
 * expenseList.js
 * Renders the list of expenses and allows editing.
 */
import { renderExpenseForm } from './expenseForm.js';
import { getExpenses, deleteExpense } from './sheetsService.js';
import { loader } from './utils.js';

/**
 * Renders the list of expenses in a simple table.
 * @param {HTMLElement} container
 * @param {Array<{rowIndex:number,payer:string,recipients:string[],amount:number,description:string}>} expenses
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
      <th class="px-2 py-1">Actions</th>
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
    <td class="px-2 py-1">
      <button type="button" class="edit-expense-btn bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Edit</button>
      <button type="button" class="delete-expense-btn ml-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
    </td>
    `;
    body.appendChild(row);
    const editBtn = row.querySelector('.edit-expense-btn');
    if (editBtn) {
      editBtn.addEventListener('click', e => {
        e.preventDefault();
        renderExpenseForm(container, async () => {
          const expenses = await getExpenses();
          renderExpenseList(container, expenses);
        }, exp);
      });
    }
    const delBtn = row.querySelector('.delete-expense-btn');
    if (delBtn) {
      delBtn.addEventListener('click', async e => {
        e.preventDefault();
        if (!confirm(`Delete expense "${exp.description}" for ${exp.payer}?`)) return;
        loader(async () => {
          try {
            await deleteExpense(exp.rowIndex);
            const updated = await getExpenses();
            renderExpenseList(container, updated);
          } catch (err) {
            console.error('Failed to delete expense', err);
            alert('Error deleting expense. See console for details.');
          }
        });
      });
    }
  });
  table.appendChild(header);
  table.appendChild(body);
  container.appendChild(table);
}