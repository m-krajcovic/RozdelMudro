/**
 * expenseForm.js
 * Renders and handles the Add or Edit Expense form.
 */

import CONFIG from './config.js';
import { addExpense } from './sheetsService.js';
import { loader } from './utils.js';

/**
 * Renders and handles the Add or Edit Expense form.
 * @param {HTMLElement} container  Element to render the form into
 * @param {Function} [onSuccess]   Callback invoked after a successful submission
 * @param {{rowIndex?:number,payer:string,recipients:string[],amount:number,description:string}} [expense]
 *   Existing expense to edit; if provided, form is pre-filled and submission updates that row.
 */
export function renderExpenseForm(container, onSuccess, expense) {
  container.innerHTML = '';
  const form = document.createElement('form');
  // Determine if editing an existing expense and the default payer
  const isEdit = Boolean(expense && expense.rowIndex);
  const lastPayer = localStorage.getItem('lastPayer') || CONFIG.USERS[0] || '';
  const initialPayer = (expense && expense.payer) || lastPayer;
  form.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
    <div class="mb-4">
      <label for="payer" class="block mb-1">Payer</label>
      <select id="payer" name="payer" required class="w-full max-w-md border border-gray-300 rounded p-2">
        ${CONFIG.USERS.map((u) => `<option value="${u}"${u === initialPayer ? ' selected' : ''}>${u}</option>`).join('')}
      </select>
    </div>
    <div class="mb-4">
      <label for="description" class="block mb-1">Description</label>
      <input id="description" name="description" type="text" required class="w-full max-w-md border border-gray-300 rounded p-2" value="${expense?.description || ''}" />
    </div>
    <div class="mb-4">
      <div class="flex-1">
        <label for="amount" class="block mb-1">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" required class="w-full max-w-md border border-gray-300 rounded p-2" value="${expense?.amount ?? ''}" />
      </div>
    </div>
    <div class="mb-4">
      <fieldset class="flex-1">
        <legend class="font-medium mb-1">Recipients</legend>
        <div class="flex flex-wrap gap-4">
          ${CONFIG.USERS.map((u) => `<label class="flex items-center"><input type="checkbox" name="recipients" value="${u}" class="mr-1"${expense && expense.recipients.includes(u) ? ' checked' : ''} />${u}</label>`).join('')}
        </div>
      </fieldset>
    </div>
    <div>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        ${isEdit ? 'Save Expense' : 'Add Expense'}
      </button>
    </div>
  `;
  form.addEventListener('submit', async (e) => {
    loader(async () => {
      e.preventDefault();
      const formData = new FormData(form);
      const payer = formData.get('payer');
      const description = formData.get('description').trim();
      const amount = parseFloat(formData.get('amount'));
      const recipients = Array.from(
        form.querySelectorAll('input[name="recipients"]:checked')
      ).map((cb) => cb.value);
      if (recipients.length === 0) {
        alert('Please select at least one recipient.');
        return;
      }
      try {
        // Cache last payer selection
        localStorage.setItem('lastPayer', payer);
        const payload = { payer, recipients, amount, description };
        if (expense && expense.rowIndex) payload.rowIndex = expense.rowIndex;
        await addExpense(payload);
        if (typeof onSuccess === 'function') onSuccess();
      } catch (err) {
        console.error('Error adding expense:', err);
        alert('Failed to add expense. See console for details.');
      }
    });
  });
  container.appendChild(form);
}
