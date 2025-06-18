const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const summary = document.getElementById('summary');
const clearBtn = document.getElementById('clear-btn');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function renderExpenses() {
  expenseList.innerHTML = '';
  summary.innerHTML = '';
  let total = 0;
  let paidTotals = {};
  let owedTotals = {};

  expenses.forEach((exp, index) => {
    const perPerson = exp.amount / exp.splitAmong;
    total += exp.amount;

    // Track who paid how much
    if (!paidTotals[exp.paidBy]) {
      paidTotals[exp.paidBy] = 0;
    }
    paidTotals[exp.paidBy] += exp.amount;

    // Assign owed amounts
    for (let i = 0; i < exp.splitAmong; i++) {
      const name = i === 0 ? exp.paidBy : `Roommate${i + 1}`;
      if (!owedTotals[name]) {
        owedTotals[name] = 0;
      }
      owedTotals[name] += perPerson;
    }

    // Render expense card
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.innerHTML = `
      <div class="expense-card">
        <div class="left">
          <div class="desc"><strong>${index + 1}</strong>. ${exp.description}</div>
          <div class="payer">Paid by: <strong>${exp.paidBy}</strong></div>
        </div>
        <div class="right">
          <div class="amount">$${exp.amount.toFixed(2)}</div>
          <div class="split">Split: ${exp.splitAmong} → $${perPerson.toFixed(2)} per person</div>
        </div>
      </div>
    `;
    expenseList.appendChild(div);
  });

  // Summary total
  summary.innerHTML = `<strong>Total Expenses:</strong> $${total.toFixed(2)}<br><br>`;

  const allNames = new Set([...Object.keys(paidTotals), ...Object.keys(owedTotals)]);

  allNames.forEach(name => {
    const paid = paidTotals[name] || 0;
    const owed = owedTotals[name] || 0;
    const balance = paid - owed;
    const paidDisplay = paid.toFixed(2);
    const owedDisplay = owed.toFixed(2);
    const balanceDisplay = Math.abs(balance).toFixed(2);

    if (balance > 0) {
      summary.innerHTML += `${name} overpaid: $${balanceDisplay} → Paid: $${paidDisplay} − Owed: $${owedDisplay}<br>`;
    } else if (balance < 0) {
      summary.innerHTML += `${name} owes: $${balanceDisplay} → Paid: $${paidDisplay} + Owed: $${owedDisplay}<br>`;
    } else {
      summary.innerHTML += `${name} is settled: Paid = Owed = $${paidDisplay}<br>`;
    }
  });

  localStorage.setItem('expenses', JSON.stringify(expenses));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const paidBy = document.getElementById('paidBy').value.trim();
  const splitAmong = parseInt(document.getElementById('splitAmong').value);

  if (description && amount > 0 && paidBy && splitAmong > 0) {
    expenses.push({ description, amount, paidBy, splitAmong });
    renderExpenses();
    form.reset();
  } else {
    alert("Please fill in all fields correctly.");
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all expenses?')) {
    expenses = [];
    localStorage.removeItem('expenses');
    renderExpenses();
  }
});

renderExpenses();
