document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    const pathname = window.location.pathname;

    if (pathname.endsWith('login.html')) {
        handleLogin();
    } else if (pathname.endsWith('register.html')) {
        handleRegister();
    } else if (pathname.endsWith('dashboard.html')) {
        handleDashboard();
    } else {
        // Landing page or other
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Update buttons if logged in (optional)
        }
    }
});

/**
 * Handles the login form submission.
 * Sends a POST request to /api/login and stores the user in localStorage.
 */
function handleLogin() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                // Store user session client-side
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    });
}

/**
 * Handles the registration form submission.
 * Sends a POST request to /api/register and stores the user in localStorage.
 */
function handleRegister() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    });
}

/**
 * Initializes the dashboard.
 * Checks for user session, loads data, and sets up event listeners.
 */
function handleDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Add Transaction Modal
    const modal = document.getElementById('transactionModal');
    const btn = document.getElementById('addTransactionBtn');
    const span = document.getElementsByClassName('close-modal')[0];

    btn.onclick = () => modal.style.display = 'flex';
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    }

    // Add Transaction Form
    document.getElementById('transactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('t-desc').value;
        const amount = document.getElementById('t-amount').value;
        const type = document.getElementById('t-type').value;
        const category = document.getElementById('t-category').value;

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, amount, type, category })
            });
            if (res.ok) {
                modal.style.display = 'none';
                e.target.reset();
                loadDashboardData(); // Refresh
            } else {
                alert('Failed to add transaction');
            }
        } catch (err) {
            console.error(err);
        }
    });

    loadDashboardData();
}

/**
 * Fetches and displays dashboard data (Stats, Transactions, Chart).
 */
async function loadDashboardData() {
    try {
        // Fetch Stats
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();

        document.getElementById('totalBalance').textContent = `$${stats.balance.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${stats.income.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `$${stats.expense.toFixed(2)}`;

        // Fetch Transactions
        const transRes = await fetch('/api/transactions');
        const transactions = await transRes.json();

        const list = document.getElementById('transactionList');
        list.innerHTML = '';
        if (transactions.length === 0) {
            list.innerHTML = '<li class="empty-state">No transactions yet.</li>';
        } else {
            transactions.slice().reverse().forEach(t => {
                const li = document.createElement('li');
                li.className = 'transaction-item';
                li.innerHTML = `
                    <div class="t-info">
                        <h4>${t.description}</h4>
                        <span>${new Date(t.date).toLocaleDateString()} • ${t.category}</span>
                    </div>
                    <div class="t-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                    </div>
                `;
                list.appendChild(li);
            });
        }

        // Render Chart
        renderChart(transactions);

    } catch (err) {
        console.error('Error loading data:', err);
    }
}

let myChart = null;

/**
 * Renders the Cash Flow chart using Chart.js.
 * @param {Array} transactions - List of transaction objects.
 */
function renderChart(transactions) {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');

    // Group by type
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
