/**
 * expenseForm.js
 * Renders and handles the Add Expense form.
 */

import CONFIG from './config.js';
import { addExpense } from './sheetsService.js';

/**
 * Renders and handles the Add Expense form.
 * @param {HTMLElement} container  Element to render the form into
 * @param {Function} [onSuccess]   Callback invoked after a successful submission
 */
export function renderExpenseForm(container, onSuccess) {
  container.innerHTML = '';
  const form = document.createElement('form');
  form.innerHTML = `
    <h2>Add Expense</h2>
    <div>
      <label for="payer">Payer:</label><br>
      <select id="payer" name="payer" required>
        ${CONFIG.USERS.map(u => `<option value="${u}">${u}</option>`).join('')}
      </select>
    </div>
    <div style="margin-top:0.5rem;">
      <label for="description">Description:</label><br>
      <input id="description" name="description" type="text" required style="width:100%; max-width:400px;">
    </div>
    <div style="margin-top:0.5rem;">
      <label for="amount">Amount:</label><br>
      <input id="amount" name="amount" type="number" step="0.01" min="0" required style="width:100px;">
    </div>
    <fieldset style="margin-top:0.5rem;">
      <legend>Recipients:</legend>
      ${CONFIG.USERS.map(u => `
        <label style="margin-right:1rem;">
          <input type="checkbox" name="recipients" value="${u}"> ${u}
        </label>`).join('')}
    </fieldset>
    <div style="margin-top:1rem;">
      <button type="submit">Add Expense</button>
    </div>
  `;
  form.addEventListener('submit', async e => {
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
      await addExpense({ payer, recipients, amount, description });
      form.reset();
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense. See console for details.');
    }
  });
  container.appendChild(form);
}