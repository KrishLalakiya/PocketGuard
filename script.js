// ==========================================
//  1. GLOBAL STATE & CONFIG
// ==========================================
const DB_KEY = 'pocketguard_db';
const BUDGET_KEY = 'pocketguard_budget';
const GOALS_KEY = 'pocketguard_goals'; // [NEW]

// Data State
let transactions = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let monthlyBudget = parseFloat(localStorage.getItem(BUDGET_KEY)) || 5000;
let categoryBudgets = JSON.parse(localStorage.getItem('pocketguard_cat_budgets')) || {};
let goals = JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
let investments = JSON.parse(localStorage.getItem('pocketguard_investments')) || [];
let currentCurrency = localStorage.getItem('pocketguard_currency') || '$'; // [NEW]

// UI State
let currentSort = { key: 'date', order: 'desc' };
let searchTerm = '';
let activeFilters = { types: [], categories: [] };
let dateFilter = { start: null, end: null };
let editingId = null;
let showNet = false;
let selectedGoalColor = '#6c5dd3'; // [NEW]

// Chart Instances
let spendingChart;
let bigCashFlowChart;
let dailyBreakdownChart;
let dashboardChart;

// Chart.js Defaults
Chart.defaults.color = '#808191';
Chart.defaults.font.family = 'Inter';

// Categories
const expenseCategories = ["🛍️ Shopping", "🍔 Food", "🚌 Transport", "🎮 Fun", "📚 Utilities", "📽️ Entertainment", "🫀 Health", "💼 Investments", "⚙️ Other"];
const incomeCategories = ["💵 Salary", "🪙 Freelance", "💸 Investments", "💰 Pocket-Money", "🎁 Gift", "⚙️ Other"];


// ==========================================
//  2. DOM ELEMENTS
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const overlay = document.getElementById('overlay');

// Dashboard Elements
const balanceDisplay = document.getElementById('total-balance-display');
const monthBalanceDisplay = document.getElementById('monthly-balance-display');
const incomeDisplay = document.getElementById('total-income-display');
const expenseDisplay = document.getElementById('total-expense-display');
const survivalText = document.getElementById('survival-text');
const survivalBar = document.getElementById('survival-bar');
const budgetDisplay = document.getElementById('budget-display');

// Modals
const addTxnModal = document.getElementById('addTransactionModal');
const filterModal = document.getElementById('filterModal');
const dateModal = document.getElementById('dateModal');
const budgetModal = document.getElementById('budgetModal'); // [NEW]
const goalModal = document.getElementById('goalModal'); // [NEW]


// ==========================================
//  3. INITIALIZATION & VIEW LOGIC
// ==========================================

// --- Sidebar Navigation ---
const sidebarLinks = document.querySelectorAll('.nav-links li a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const linkText = link.querySelector('.link-text').innerText.trim();

        // Hide all views
        document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));

        // Show selected view
        if (linkText === 'Dashboard') document.getElementById('view-dashboard').classList.remove('hidden');
        else if (linkText === 'Account') document.getElementById('view-account').classList.remove('hidden');
        else if (linkText === 'Transaction') document.getElementById('view-transaction').classList.remove('hidden');
        else if (linkText === 'Cash Flow') document.getElementById('view-cashflow').classList.remove('hidden');
        else if (linkText === 'Budget') document.getElementById('view-budget').classList.remove('hidden');
        else if (linkText === 'Goals') {
            document.getElementById('view-goals').classList.remove('hidden');
            renderGoalsPage();
        }
        else if (linkText === 'Investments') {
            document.getElementById('view-investments').classList.remove('hidden');
            renderInvestmentsPage();
        }
    });
});

// --- Mobile Menu ---
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            sidebar.classList.toggle('mobile-active');
            overlay.style.display = sidebar.classList.contains('mobile-active') ? 'block' : 'none';
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
        }
    });
}
if (overlay) {
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-active');
        overlay.style.display = 'none';
    });
}

// --- Initialize Dashboard Charts ---
// 1. Mini Cash Flow (Line Chart) - STORED GLOBALLY
const ctxFlow = document.getElementById('cashFlowChart');
if (ctxFlow) {
    const ctx = ctxFlow.getContext('2d');
    const gradIncome = ctx.createLinearGradient(0, 0, 0, 300);
    gradIncome.addColorStop(0, 'rgba(108, 93, 211, 0.4)');
    gradIncome.addColorStop(1, 'rgba(108, 93, 211, 0)');
    const gradExpense = ctx.createLinearGradient(0, 0, 0, 300);
    gradExpense.addColorStop(0, 'rgba(63, 140, 255, 0.4)');
    gradExpense.addColorStop(1, 'rgba(63, 140, 255, 0)');

    dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Income', data: [], borderColor: '#6c5dd3', backgroundColor: gradIncome, fill: true, tension: 0.4, pointRadius: 0 },
                { label: 'Expense', data: [], borderColor: '#3f8cff', backgroundColor: gradExpense, fill: true, tension: 0.4, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] }, ticks: { callback: v => '$' + v, color: '#808191' } },
                x: { grid: { display: false } }
            }
        }
    });
}
// 2. Spending Chart
const ctxSpend = document.getElementById('spendingChart').getContext('2d');
spendingChart = new Chart(ctxSpend, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#6c5dd3', '#66e6d7', '#3f8cff', '#e4e4e4', '#808191', '#a0a0a0', '#ff754c', '#f1c40f', '#ff6b9d'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: { legend: { display: false } },
        onClick: (e) => { updateDashboard(); }
    }
});


// ==========================================
//  4. CORE LOGIC & HELPERS
// ==========================================

function saveData() {
    localStorage.setItem(DB_KEY, JSON.stringify(transactions));
}
function saveGoals() {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function formatMoney(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return currentCurrency + '0.00';
    return currentCurrency + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
}

function updateCategories(type) {
    const categorySelect = document.getElementById('txn-category');
    if (!categorySelect) return;
    categorySelect.innerHTML = "";
    const categories = (type === 'income') ? incomeCategories : expenseCategories;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
        categorySelect.appendChild(option);
    });
}

// [UPDATED] Reusable Function to Open Transaction Modal
function openTxnModal(prefillCategory = null) {
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const dateInput = document.getElementById('txn-date');
    if (dateInput) dateInput.value = localDate;

    // Reset Fields
    editingId = null;
    document.getElementById('saveTransactionBtn').innerText = "Save Transaction";
    document.getElementById('txn-amount').value = '';
    document.getElementById('txn-desc').value = '';
    document.getElementById('txn-time').value = '';

    // Force 'Expense' Mode
    document.getElementById('type-expense').checked = true;
    updateCategories('expense');

    // Prefill Category if requested (The Quick Add Magic)
    if (prefillCategory) {
        document.getElementById('txn-category').value = prefillCategory;
    }

    document.getElementById('addTransactionModal').classList.add('open');
}

// --- MAIN UPDATE FUNCTION ---
// --- MAIN UPDATE FUNCTION ---
function updateDashboard() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Calculate Totals (Global)
    const totalIncome = transactions.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);
    const totalExpense = transactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    // 2. Calculate Monthly Totals
    const monthlyTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
    });
    const monthlyIncome = monthlyTransactions.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);
    const monthlyExpense = monthlyTransactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);

    // 3. Calculate Changes (Month-over-Month)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTransactions = transactions.filter(txn => {
        const d = new Date(txn.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    
    // Fixed Variable Names here:
    const prevIncome = prevMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpense;
    const prevMonthBalance = prevIncome - prevExpense;

    // --- PERCENTAGE CALCULATIONS ---

    // A. Net Balance Performance (This Month vs Last Month)
    const netBalanceChangePercent = prevMonthBalance !== 0 
        ? (((monthlyBalance - prevMonthBalance) / Math.abs(prevMonthBalance)) * 100).toFixed(1) 
        : (monthlyBalance > 0 ? 100 : 0);

    // B. Total Wealth Growth (Total Balance Growth this month)
    const startOfMonthBalance = totalBalance - monthlyBalance;
    const totalGrowthPercent = startOfMonthBalance !== 0
        ? ((monthlyBalance / Math.abs(startOfMonthBalance)) * 100).toFixed(1)
        : 0;

    // C. Income & Expense Changes
    let incomeChangePct = prevIncome > 0 ? (((monthlyIncome - prevIncome) / prevIncome) * 100).toFixed(1) : 0;
    let expenseChangePct = prevExpense > 0 ? (((monthlyExpense - prevExpense) / prevExpense) * 100).toFixed(1) : 0;

    // 4. Update UI Text
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setTxt('total-balance-display', formatMoney(totalBalance));
    setTxt('monthly-balance-display', formatMoney(monthlyBalance));
    setTxt('total-income-display', formatMoney(monthlyIncome));
    setTxt('total-expense-display', formatMoney(monthlyExpense));

    // 5. Update Survival Bar
    const survivalBar = document.getElementById('survival-bar');
    const survivalText = document.getElementById('survival-text');
    const budgetDisplay = document.getElementById('budget-display');

    if (survivalBar && survivalText && budgetDisplay) {
        budgetDisplay.innerText = formatMoney(monthlyBudget);
        let percentLeft = 0;
        if (monthlyBudget > 0) percentLeft = ((monthlyBudget - monthlyExpense) / monthlyBudget) * 100;
        
        if (percentLeft < 0) percentLeft = 0;
        if (percentLeft > 100) percentLeft = 100;

        survivalText.innerText = Math.round(percentLeft) + "% Left";
        survivalBar.style.width = percentLeft + "%";
        survivalBar.style.backgroundColor = percentLeft < 20 ? '#ff754c' : '#00d2aa';
        survivalBar.style.boxShadow = percentLeft < 20 ? '0 0 10px rgba(255, 117, 76, 0.4)' : '0 0 10px rgba(0, 210, 170, 0.4)';
    }

    // 6. Update Percentage Badges (THIS WAS MISSING)
    
    // A. Top Card: Total Balance (Uses Growth %)
    const topBalTag = document.querySelector('.balance-card-top .tag');
    if (topBalTag) {
        const isPositive = totalGrowthPercent >= 0;
        const arrow = isPositive ? 'up' : 'down';
        topBalTag.className = `tag ${isPositive ? 'positive' : 'negative'}`;
        topBalTag.innerHTML = `<i class="fas fa-arrow-${arrow}"></i> ${Math.abs(totalGrowthPercent)}%`;
    }

    // B. Middle Card: Net Balance (Uses Performance %)
    const midBalCard = document.querySelector('.balance-month');
    if (midBalCard) {
        const midBalTag = midBalCard.querySelector('.tag');
        if (midBalTag) {
            const isPositive = netBalanceChangePercent >= 0;
            const arrow = isPositive ? 'up' : 'down';
            midBalTag.className = `tag ${isPositive ? 'positive' : 'negative'} mini`;
            midBalTag.innerHTML = `<i class="fas fa-arrow-${arrow}"></i> ${Math.abs(netBalanceChangePercent)}%`;
        }
    }

    // C. Income & Expense Badges
    const incTag = document.querySelector('.income-month .tag.badge');
    if (incTag) {
        incTag.innerHTML = `${incomeChangePct > 0 ? '+' : ''}${incomeChangePct}%`;
        incTag.className = `tag badge ${incomeChangePct >= 0 ? 'positive' : 'negative'}`;
    }
    
    const expTag = document.querySelector('.expense-month .tag.badge');
    if (expTag) {
        expTag.innerHTML = `${expenseChangePct > 0 ? '+' : ''}${expenseChangePct}%`;
        const isBad = expenseChangePct > 0; 
        expTag.className = `tag badge ${isBad ? 'negative' : 'positive'}`; 
    }

    // 7. Update Charts & Lists
    // (Assuming these variables are global or handled elsewhere in your file)
    const yearSelect = document.getElementById('dashboard-year-select');
    if (yearSelect && dashboardChart) {
        // ... (Your chart update logic here) ...
        const selectedYear = parseInt(yearSelect.value) || new Date().getFullYear();
        const mInc = Array(12).fill(0);
        const mExp = Array(12).fill(0);

        transactions.forEach(t => {
            const d = new Date(t.date);
            if (d.getFullYear() === selectedYear) {
                if (t.type === 'income') mInc[d.getMonth()] += t.amount;
                else mExp[d.getMonth()] += t.amount;
            }
        });

        dashboardChart.data.datasets[0].data = mInc;
        dashboardChart.data.datasets[1].data = mExp;
        dashboardChart.update();
    }
    
    // Trigger Sub-Page Updates
    renderTransactionList();
    updateCashFlowPage();
    renderBudgetPage();
    renderGoalsPage();
    if(typeof renderInvestmentsPage === 'function') renderInvestmentsPage();
}
// ==========================================
//  5. PAGE LOGIC: TRANSACTIONS
// ==========================================
function renderTransactionList() {
    const listCard = document.querySelector('#view-transaction .card');
    if (!listCard) return;

    // A. Filter
    let filteredData = transactions.filter(txn => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            (txn.description && txn.description.toLowerCase().includes(term)) ||
            txn.category.toLowerCase().includes(term) ||
            txn.amount.toString().includes(term) ||
            txn.date.includes(term)
        );
        const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(txn.type);
        const matchesCat = activeFilters.categories.length === 0 || activeFilters.categories.includes(txn.category);

        let matchesDate = true;
        if (dateFilter.start) matchesDate = matchesDate && (new Date(txn.date) >= new Date(dateFilter.start));
        if (dateFilter.end) matchesDate = matchesDate && (new Date(txn.date) <= new Date(dateFilter.end));

        return matchesSearch && matchesType && matchesCat && matchesDate;
    });

    // B. Sort
    filteredData.sort((a, b) => {
        let valA = a[currentSort.key];
        let valB = b[currentSort.key];
        if (currentSort.key === 'amount') { valA = Math.abs(valA); valB = Math.abs(valB); }
        if (currentSort.key === 'date') { valA = new Date(valA); valB = new Date(valB); }
        if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }

        if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
        return 0;
    });

    // C. Render
    const liveTotal = filteredData.reduce((sum, t) => sum + t.amount, 0);
    const totalColor = liveTotal >= 0 ? '#00d2aa' : '#ff754c';
    listCard.innerHTML = '';

    // Header
    const headerBar = document.createElement('div');
    headerBar.className = 'live-total-bar';
    headerBar.style.display = 'flex'; headerBar.style.justifyContent = 'space-between'; headerBar.style.alignItems = 'center';

    const dateActive = dateFilter.start || dateFilter.end ? '(Date Filtered)' : '';
    headerBar.innerHTML = `
        <div><span style="margin-right: 15px;"><i class="fas fa-filter"></i> ${filteredData.length} Results <small style="color:var(--primary)">${dateActive}</small></span>
        <span>Total: <span style="color: ${totalColor}; font-size: 16px;">${formatMoney(liveTotal)}</span></span></div>
    `;

    const addBtn = document.createElement('button');
    addBtn.className = 'compact-btn';
    addBtn.style.height = '36px'; addBtn.style.fontSize = '13px';
    addBtn.innerHTML = '<i class="fas fa-plus"></i>&nbsp; Add New';
    addBtn.onclick = () => openTxnModal();
    headerBar.appendChild(addBtn);
    listCard.appendChild(headerBar);

    // Table
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'table-scroll-container';
    const table = document.createElement('table');
    table.style.width = '100%'; table.style.borderCollapse = 'collapse'; table.style.color = 'white';

    const getIcon = (key) => {
        if (currentSort.key !== key) return '<i class="fas fa-sort sort-icon"></i>';
        return currentSort.order === 'asc' ? '<i class="fas fa-sort-up sort-icon sort-active"></i>' : '<i class="fas fa-sort-down sort-icon sort-active"></i>';
    };
    const calColor = (dateFilter.start || dateFilter.end) ? '#00d2aa' : 'var(--text-muted)';

    table.innerHTML = `
        <thead class="sticky-header">
            <tr>
                <th style="padding: 15px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span onclick="handleSort('date')">Date ${getIcon('date')}</span>
                        <button onclick="openDateModal(event)" style="background: rgba(255,255,255,0.1); border: none; border-radius: 6px; padding: 4px 8px; cursor: pointer; color: ${calColor}; transition: 0.2s;"><i class="far fa-calendar-alt"></i></button>
                    </div>
                </th>
                <th onclick="openFilterModal()" style="padding: 15px; cursor: pointer; color: var(--primary);">Category <i class="fas fa-filter" style="font-size: 10px; margin-left: 5px;"></i></th>
                <th style="padding: 15px;">Description</th>
                <th onclick="handleSort('amount')" style="padding: 15px; text-align: right; cursor: pointer;">Amount ${getIcon('amount')}</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
            </tr>
        </thead>
        <tbody id="txn-list-body"></tbody>
    `;
    scrollContainer.appendChild(table);
    listCard.appendChild(scrollContainer);

    const tbody = table.querySelector('#txn-list-body');
    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>No transactions match your filters.</td></tr>`;
        return;
    }

    filteredData.forEach(txn => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        const isIncome = txn.type === 'income';
        const color = isIncome ? '#00d2aa' : '#ff754c';
        const sign = isIncome ? '+' : '-';

        row.innerHTML = `
            <td style="padding: 12px; color: #808191;">${txn.date}</td>
            <td style="padding: 12px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: ${color}"></div>${txn.category}</div></td>
            <td style="padding: 12px; color: #808191;">${txn.description || '-'}</td>
            <td style="padding: 12px; text-align: right; font-weight: 600; color: ${color}">${sign}${formatMoney(txn.amount).replace('$', '')}</td>
            <td style="padding: 12px; text-align: center;"></td>
        `;
        const actionCell = row.querySelector('td:last-child');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.style.cssText = "background: none; border: none; color: #6c5dd3; cursor: pointer; margin-right: 10px;";
        editBtn.onclick = () => startEditTransaction(txn.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.style.cssText = "background: none; border: none; color: #ff754c; cursor: pointer;";
        deleteBtn.onclick = () => deleteTransaction(txn.id);

        actionCell.appendChild(editBtn); actionCell.appendChild(deleteBtn);
        tbody.appendChild(row);
    });
}

function handleSort(key) {
    if (currentSort.key === key) currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    else { currentSort.key = key; currentSort.order = 'desc'; }
    renderTransactionList();
}


// ==========================================
//  6. PAGE LOGIC: CASH FLOW
// ==========================================
function toggleNetChart() {
    showNet = !showNet;
    const btn = document.getElementById('toggleNetBtn');
    if (showNet) {
        btn.style.background = "rgba(63, 140, 255, 0.15)"; btn.style.borderColor = "#3f8cff"; btn.style.color = "#white";
        btn.innerHTML = `<span style="width: 8px; height: 8px; background: #3f8cff; display: inline-block; border-radius: 50%; margin-right: 5px;"></span> Hide Net`;
    } else {
        btn.style.background = "rgba(255,255,255,0.05)"; btn.style.borderColor = "rgba(255,255,255,0.1)"; btn.style.color = "var(--text-muted)";
        btn.innerHTML = `<span style="width: 8px; height: 8px; background: #3f8cff; display: inline-block; border-radius: 50%; margin-right: 5px;"></span> Show Net`;
    }
    updateCashFlowPage();
}

function updateCashFlowPage() {
    const yearSelect = document.getElementById('cf-year-select');
    if (!yearSelect) return;

    // Always populate year options to ensure current year is available
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();

    // Include current year even if no transactions yet
    const yearsToShow = years.length ? years : [currentYear];
    if (!yearsToShow.includes(currentYear)) {
        yearsToShow.unshift(currentYear);
    }

    // Only repopulate if years have changed
    const currentOptions = Array.from(yearSelect.options).map(o => parseInt(o.value));
    if (!arraysEqual(currentOptions, yearsToShow)) {
        yearSelect.innerHTML = '';
        yearsToShow.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.innerText = y;
            yearSelect.appendChild(opt);
        });
    }

    // Set current year as selected if available
    if (yearsToShow.includes(currentYear)) {
        yearSelect.value = String(currentYear);
    } else {
        yearSelect.value = String(yearsToShow[0]);
    }

    const year = parseInt(yearSelect.value) || currentYear;
    const data = transactions.filter(t => new Date(t.date).getFullYear() === year);

    const totalInc = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExp = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = totalInc - totalExp;

    document.getElementById('cf-total-income').innerText = formatMoney(totalInc);
    document.getElementById('cf-total-expense').innerText = formatMoney(totalExp);
    const elNet = document.getElementById('cf-net-flow');
    elNet.innerText = (net >= 0 ? '+' : '') + formatMoney(net);
    elNet.style.color = net >= 0 ? '#00d2aa' : '#ff754c';
    document.getElementById('cf-savings-rate').innerText = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) + '%' : '0%';

    const mInc = Array(12).fill(0), mExp = Array(12).fill(0), mNet = Array(12).fill(0);
    data.forEach(t => {
        const m = new Date(t.date).getMonth();
        if (t.type === 'income') mInc[m] += t.amount; else mExp[m] += t.amount;
    });

    let best = { val: -Infinity, name: '-' }, worst = { val: -Infinity, name: '-' };
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
        mNet[i] = mInc[i] - mExp[i];
        if (mInc[i] > best.val && mInc[i] > 0) best = { val: mInc[i], name: monthNames[i] };
        if (mExp[i] > worst.val && mExp[i] > 0) worst = { val: mExp[i], name: monthNames[i] };
    }

    document.getElementById('metric-best-month').innerText = `${best.name} (${formatMoney(best.val)})`;
    document.getElementById('metric-worst-month').innerText = `${worst.name} (${formatMoney(worst.val)})`;
    document.getElementById('metric-avg-income').innerText = formatMoney(totalInc / 12);
    document.getElementById('metric-avg-expense').innerText = formatMoney(totalExp / 12);

    const ctxElement = document.getElementById('bigCashFlowChart');
    if (ctxElement) {
        if (bigCashFlowChart) bigCashFlowChart.destroy();
        const ctx = ctxElement.getContext('2d');
        bigCashFlowChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthNames,
                datasets: [
                    { label: 'Income', data: mInc, backgroundColor: '#6c5dd3', borderRadius: 4 },
                    { label: 'Expense', data: mExp, backgroundColor: '#ff754c', borderRadius: 4 },
                    ...(showNet ? [{ label: 'Net', data: mNet, type: 'line', borderColor: '#3f8cff', backgroundColor: 'rgba(63,140,255,0.1)', fill: true }] : [])
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { callback: v => '$' + v.toLocaleString() }
                    },
                    x: { grid: { display: false } }
                },
                onClick: (event, activeElements, chart) => {
                    if (activeElements.length > 0) {
                        const clickedIndex = activeElements[0].index;
                        showDailyBreakdown(clickedIndex, year);
                    }
                }
            }
        });
    }
}

function showDailyBreakdown(monthIndex, year) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const section = document.getElementById('daily-breakdown-section');
    section.classList.remove('hidden');
    document.getElementById('daily-chart-title').innerText = `${monthNames[monthIndex]} ${year} - Daily Breakdown`;

    const monthlyTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
    });

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dailyIncome = new Array(daysInMonth).fill(0);
    const dailyExpense = new Array(daysInMonth).fill(0);
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    monthlyTxns.forEach(txn => {
        const day = new Date(txn.date).getDate() - 1;
        if (txn.type === 'income') dailyIncome[day] += txn.amount; else dailyExpense[day] += txn.amount;
    });

    const ctx = document.getElementById('dailyBreakdownChart').getContext('2d');
    if (dailyBreakdownChart) dailyBreakdownChart.destroy();
    dailyBreakdownChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Income', data: dailyIncome, backgroundColor: '#6c5dd3' }, { label: 'Expense', data: dailyExpense, backgroundColor: '#ff754c' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
    section.scrollIntoView({ behavior: 'smooth' });
}
function closeDailyChart() { document.getElementById('daily-breakdown-section').classList.add('hidden'); }


// ==========================================
//  7. PAGE LOGIC: BUDGET PLANNER [UPDATED]
// ==========================================
let currentBudgetCategory = null;

// 1. Render the Budget Grid (Percentage Left + Quick Add)
function renderBudgetPage() {
    const grid = document.getElementById('budget-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let totalBudgetLimit = 0;
    let totalBudgetSpent = 0;

    expenseCategories.forEach(cat => {
        const limit = categoryBudgets[cat] || 0;

        // Calculate Spend
        const now = new Date();
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === cat &&
                new Date(t.date).getMonth() === now.getMonth() &&
                new Date(t.date).getFullYear() === now.getFullYear())
            .reduce((sum, t) => sum + t.amount, 0);

        if (limit > 0) {
            totalBudgetLimit += limit;
            totalBudgetSpent += spent;
        }

        // --- Logic: Colors & Status ---
        let percentSpent = 0;
        let percentLeft = 100;
        let colorClass = 'bg-green';
        let bottomText = 'Set a limit to track';
        let bottomClass = 'var(--text-muted)';

        if (limit > 0) {
            percentSpent = (spent / limit) * 100;
            percentLeft = Math.max(0, 100 - percentSpent);

            const remaining = limit - spent;

            if (remaining >= 0) {
                bottomText = `${formatMoney(remaining)} remaining`;
                if (percentSpent > 80) colorClass = 'bg-yellow';
            } else {
                bottomText = `Over by ${formatMoney(Math.abs(remaining))}`;
                colorClass = 'bg-red-glow';
                bottomClass = 'text-danger-glow';
                percentLeft = 0;
            }
        } else if (spent > 0) {
            percentSpent = 100;
            percentLeft = 0;
            colorClass = 'bg-red-glow';
            bottomText = 'No limit set';
        }

        const barWidth = Math.min(percentSpent, 100);

        // --- Create Card ---
        const card = document.createElement('div');
        card.className = 'budget-card';
        card.innerHTML = `
            <div class="budget-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="budget-icon">${cat.split(' ')[0]}</div>
                    <div>
                        <h4 style="margin:0;">${cat.split(' ').slice(1).join(' ')}</h4>
                        <small style="color:var(--text-muted);">${limit > 0 ? formatMoney(limit) : 'No Limit'}</small>
                    </div>
                </div>
                
                <div class="budget-actions">
                    <button class="budget-btn add" onclick="openTxnModal('${cat}')" title="Add Transaction">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="budget-btn" onclick="openBudgetModal('${cat}')" title="Edit Budget">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600;">
                <span style="color:white;">${formatMoney(spent)} spent</span>
                <span style="color:var(--text-muted);">${Math.round(percentLeft)}% Left</span>
            </div>

            <div class="budget-progress-bg">
                <div class="budget-progress-fill ${colorClass}" style="width: ${barWidth}%"></div>
            </div>

            <small class="${bottomClass}" style="${bottomClass === 'var(--text-muted)' ? 'color:var(--text-muted)' : ''}">
                ${bottomText}
            </small>
        `;
        grid.appendChild(card);
    });

    // Update Top Summary
    const totalEl = document.getElementById('total-budget-limit');
    if (totalEl) totalEl.innerText = formatMoney(totalBudgetLimit);

    const spentEl = document.getElementById('total-budget-spent');
    if (spentEl) spentEl.innerText = formatMoney(totalBudgetSpent);

    const remaining = totalBudgetLimit - totalBudgetSpent;
    const elRemaining = document.getElementById('total-budget-remaining');
    if (elRemaining) {
        elRemaining.innerText = formatMoney(remaining);
        elRemaining.style.color = remaining >= 0 ? '#00d2aa' : '#ff754c';
    }

    // Circle Chart Logic
    const totalPercent = totalBudgetLimit > 0 ? Math.min((totalBudgetSpent / totalBudgetLimit) * 100, 100) : 0;
    const circle = document.getElementById('total-budget-circle');
    if (circle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (totalPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = remaining >= 0 ? '#6c5dd3' : '#ff4d4d';

        const percentText = document.getElementById('total-budget-percent');
        if (percentText) percentText.innerText = Math.round(100 - totalPercent) + '%'; // Showing % Left
    }
}
function openBudgetModal(cat) {
    currentBudgetCategory = cat;
    document.getElementById('budget-modal-title').innerText = `Limit for ${cat}`;
    document.getElementById('budget-limit-input').value = categoryBudgets[cat] || '';
    budgetModal.classList.add('open');
}
function closeBudgetModal() { budgetModal.classList.remove('open'); }
function saveCategoryBudget() {
    const val = parseFloat(document.getElementById('budget-limit-input').value);
    if (isNaN(val) || val < 0) return alert("Invalid amount");
    categoryBudgets[currentBudgetCategory] = val;
    localStorage.setItem('pocketguard_cat_budgets', JSON.stringify(categoryBudgets));
    renderBudgetPage();
    closeBudgetModal();
}
function resetBudgets() {
    if (confirm("Clear all limits?")) {
        categoryBudgets = {};
        localStorage.setItem('pocketguard_cat_budgets', JSON.stringify({}));
        renderBudgetPage();
    }
}
// ==========================================
//  8. PAGE LOGIC: GOALS (Improved)
// ==========================================
function renderGoalsPage() {
    const grid = document.getElementById('goals-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let totalSaved = 0;
    let totalTarget = 0;

    // Status Counters for Top Cards
    let countCompleted = 0;
    let countProgress = 0;
    let countOver = 0;

    // 1. Calculate Monthly Savings Capability (Income - Expense) for AI Insight
    const now = new Date();
    const mTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const mInc = mTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const mExp = mTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthlySavingsPotential = Math.max(0, mInc - mExp); // Only count positive cash flow

    if (goals.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
            <i class="fas fa-bullseye" style="font-size: 40px; margin-bottom: 20px; opacity: 0.5;"></i>
            <p>No savings goals yet. Create one to start saving!</p>
        </div>`;
    }

    goals.forEach(goal => {
        totalSaved += goal.current;
        totalTarget += goal.target;

        // --- 1. Percent & Logic ---
        // Allow percent to go above 100 for accuracy
        const rawPercent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        const displayPercent = Math.round(rawPercent);

        // Cap the visual bar width at 100% so it doesn't break layout
        const visualWidth = Math.min(100, displayPercent);

        // --- 2. Determine Status Color & Text ---
        let statusClass = 'goal-status-normal'; // Default Purple
        let percentColor = 'white';
        let statusText = '';

        if (displayPercent < 70) {
            statusClass = 'goal-status-normal';
            countProgress++;
        } else if (displayPercent < 100) {
            statusClass = 'goal-status-near'; // Yellow
            percentColor = '#f1c40f';
            countProgress++;
        } else if (displayPercent === 100) {
            statusClass = 'goal-status-complete'; // Green
            percentColor = '#00d2aa';
            statusText = 'Completed!';
            countCompleted++;
        } else {
            statusClass = 'goal-status-over'; // Glowing Purple
            percentColor = '#d291bc';
            statusText = `Overachieved by ${displayPercent - 100}%`;
            countOver++;
        }

        // --- 3. Left vs Over Math ---
        const diff = goal.current - goal.target;
        let diffText = '';
        if (diff >= 0) {
            diffText = `<span class="text-complete">${formatMoney(diff)} over target</span>`;
        } else {
            diffText = `${formatMoney(Math.abs(diff))} left`;
        }

        // --- 4. Smart AI Insight ---
        let insightHTML = '';
        if (diff < 0) {
            if (monthlySavingsPotential > 0) {
                const monthsToGoal = Math.ceil(Math.abs(diff) / monthlySavingsPotential);
                insightHTML = `<div class="smart-insight"><i class="fas fa-clock"></i> Reach in ~${monthsToGoal} mo. at current pace</div>`;
            } else {
                insightHTML = `<div class="smart-insight"><i class="fas fa-exclamation-triangle" style="color:#ff754c"></i> Improve cash flow to reach faster</div>`;
            }
        } else {
            insightHTML = `<div class="smart-insight"><i class="fas fa-check-circle" style="color:#00d2aa"></i> Goal Reached!</div>`;
        }

        // --- 5. Render Card ---
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-card-header">
                <div style="display:flex; gap:15px; align-items:center;">
                    <div class="goal-icon-area" style="background: ${goal.color}20; color: ${goal.color}; width:45px; height:45px; font-size:18px;">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="goal-info">
                        <h4>${goal.name}</h4>
                        <small>Target: ${formatMoney(goal.target)}</small>
                    </div>
                </div>
                <div style="text-align:right;">
                    <h3 style="color:${percentColor}; margin:0;">${displayPercent}%</h3>
                    <small style="color:${percentColor}; font-size:10px;">${statusText}</small>
                </div>
            </div>
            
            <div class="goal-progress-bg">
                <div class="goal-progress-fill ${statusClass}" style="width: ${visualWidth}%;"></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-top:10px; font-weight:500;">
                <span style="color:white;">${formatMoney(goal.current)} Saved</span>
                <span style="color:var(--text-muted);">${diffText}</span>
            </div>

            ${insightHTML}

            <div class="goal-actions">
                <button class="goal-btn btn-deposit" onclick="depositToGoal(${goal.id})"><i class="fas fa-plus"></i> Deposit</button>
                <button class="goal-btn" onclick="deleteGoal(${goal.id})" style="background:rgba(255,117,76,0.1); color:#ff754c;"><i class="fas fa-archive"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update Top Summary Cards
    // Card 1: Total Saved
    document.getElementById('goals-total-saved').innerText = formatMoney(totalSaved);

    // Card 2: Total Target
    document.getElementById('goals-total-target').innerText = formatMoney(totalTarget);

    // Card 3: Health Summary (Replaces Percentage)
    // We update the label and the value to show counts instead of a raw %
    const card3Label = document.querySelector('#view-goals .card:nth-child(3) small');
    const card3Value = document.getElementById('goals-total-percent');

    if (card3Label && card3Value) {
        card3Label.innerText = "Goal Health";
        card3Value.innerHTML = `<span style="font-size:16px; color:#00d2aa;">${countCompleted} Done</span> <span style="font-size:14px; color:var(--text-muted);">• ${countProgress} Active</span>`;
    }

    // Dashboard Widget Update (Unchanged)
    updateSavingsWidget();
}
function openGoalModal() {
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-current').value = '';
    selectedGoalColor = '#6c5dd3';
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    document.querySelector('.color-option').classList.add('selected');
    const modal = document.getElementById('goalModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('open'), 10);
    }
}
function closeGoalModal() {
    const modal = document.getElementById('goalModal');
    if (modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}
function selectGoalColor(el, color) {
    selectedGoalColor = color;
    document.querySelectorAll('.color-option').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
}
function saveGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const current = parseFloat(document.getElementById('goal-current').value) || 0;
    if (!name || isNaN(target) || target <= 0) return alert("Invalid details");

    goals.push({ id: Date.now(), name, target, current, color: selectedGoalColor });
    saveGoals();
    renderGoalsPage();
    closeGoalModal();
}
function depositToGoal(id) {
    const amount = parseFloat(prompt("Enter amount to deposit:"));
    if (isNaN(amount) || amount <= 0) return;
    const goal = goals.find(g => g.id === id);
    if (goal) { goal.current += amount; saveGoals(); renderGoalsPage(); }
}
function deleteGoal(id) {
    if (confirm("Delete goal?")) { goals = goals.filter(g => g.id !== id); saveGoals(); renderGoalsPage(); }
}


// ==========================================
//  9. ACCOUNT SETTINGS & UTILS
// ==========================================
function loadAccountSettings() {
    const savedName = localStorage.getItem('pocketguard_name') || "Alex Johnson";
    const accNameInput = document.getElementById('acc-name');
    if (accNameInput) accNameInput.value = savedName;

    const headerUserName = document.querySelector('.user-profile .name');
    if (headerUserName) headerUserName.innerText = savedName;

    const accEmailInput = document.getElementById('acc-email');
    if (accEmailInput) accEmailInput.value = localStorage.getItem('pocketguard_email') || "";

    const accBudgetInput = document.getElementById('acc-budget');
    if (accBudgetInput) accBudgetInput.value = monthlyBudget;

    // [NEW] Load Currency
    const accCurrencyInput = document.getElementById('acc-currency');
    if (accCurrencyInput) accCurrencyInput.value = currentCurrency;

    const savedImage = localStorage.getItem('pocketguard_profile_pic');
    const profilePreview = document.getElementById('preview-profile-pic');
    const headerProfileImg = document.querySelector('.user-profile img');
    if (savedImage) {
        if (profilePreview) profilePreview.src = savedImage;
        if (headerProfileImg) headerProfileImg.src = savedImage;
    }
}
const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        const name = document.getElementById('acc-name').value.trim();
        const email = document.getElementById('acc-email').value.trim();
        const budget = parseFloat(document.getElementById('acc-budget').value);
        const currency = document.getElementById('acc-currency').value; // [NEW]

        if (name) {
            localStorage.setItem('pocketguard_name', name);
            document.querySelector('.user-profile .name').innerText = name;
        }
        if (email) localStorage.setItem('pocketguard_email', email);

        if (!isNaN(budget) && budget > 0) {
            monthlyBudget = budget;
            localStorage.setItem(BUDGET_KEY, budget);
        }

        // [NEW] Save Currency & Refresh
        if (currency) {
            currentCurrency = currency;
            localStorage.setItem('pocketguard_currency', currency);
        }

        updateDashboard(); // Re-render everything with new symbol
        alert("Settings Saved Successfully!");
    });
}

const profileInput = document.getElementById('profile-pic-input');
if (profileInput) {
    profileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            // CHECK SIZE (Limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image is too large! Please choose an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const result = e.target.result;
                // Update UI immediately
                const preview = document.getElementById('preview-profile-pic');
                const headerImg = document.querySelector('.user-profile img');
                if (preview) preview.src = result;
                if (headerImg) headerImg.src = result;

                // Save to storage
                try {
                    localStorage.setItem('pocketguard_profile_pic', result);
                } catch (e) {
                    alert("Storage full! Image could not be saved.");
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// ==========================================
//  SAFE RESET LOGIC (Place this near the bottom of script.js)
// ==========================================
const resetAppBtn = document.getElementById('resetAppBtn');
if (resetAppBtn) {
    resetAppBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop any default link behavior
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            localStorage.clear();
            window.location.reload();
        }
    });
} else {
    console.error("Reset Button Not Found in HTML");
}
// Search
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderTransactionList();
    });
}

// Notification Icon
const notificationIcon = document.querySelector('.notification-icon');
if (notificationIcon) {
    notificationIcon.addEventListener('click', () => {
        const badge = notificationIcon.querySelector('.badge');
        if (badge && badge.style.display !== 'none') {
            // Check for budget overages or goal milestones
            let notifications = [];

            // Check for budget overages
            for (const [cat, budget] of Object.entries(categoryBudgets)) {
                const spent = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
                if (spent > budget) {
                    notifications.push(`⚠️ ${cat} budget exceeded!`);
                }
            }

            // Check for goals near completion
            goals.forEach(goal => {
                const remaining = goal.target - goal.saved;
                if (remaining > 0 && remaining <= goal.target * 0.1) {
                    notifications.push(`🎉 ${goal.name} is almost complete!`);
                }
            });

            badge.style.display = 'none';
            const message = notifications.length > 0
                ? notifications.join('\n')
                : '✨ No new notifications. Keep up the good financial habits!';
            alert(message);
        }
    });
}

// Filter Modals
function openFilterModal() { filterModal.classList.add('open'); renderFilterCategories(); updateFilterUI(); }
function closeFilterModal() { filterModal.classList.remove('open'); }
function toggleFilterType(type) {
    if (activeFilters.types.includes(type)) activeFilters.types = activeFilters.types.filter(t => t !== type);
    else activeFilters.types.push(type);
    updateFilterUI();
}
function updateFilterUI() {
    const incBtn = document.getElementById('filter-btn-income');
    const expBtn = document.getElementById('filter-btn-expense');
    if (incBtn) incBtn.className = activeFilters.types.includes('income') ? 'filter-btn active' : 'filter-btn';
    if (expBtn) expBtn.className = activeFilters.types.includes('expense') ? 'filter-btn active' : 'filter-btn';
}
function renderFilterCategories() {
    const container = document.getElementById('filter-cats-list');
    container.innerHTML = '<small style="color: var(--text-muted); margin-bottom: 5px;">Categories</small>';
    const allCats = [...new Set([...incomeCategories, ...expenseCategories])].sort();
    allCats.forEach(cat => {
        const isChecked = activeFilters.categories.includes(cat) ? 'checked' : '';
        const div = document.createElement('div');
        div.className = 'cat-checkbox-item';
        div.innerHTML = `<input type="checkbox" id="chk-${cat}" ${isChecked} onchange="toggleFilterCat('${cat}')"><label for="chk-${cat}">${cat}</label>`;
        container.appendChild(div);
    });
}
function toggleFilterCat(cat) {
    if (activeFilters.categories.includes(cat)) activeFilters.categories = activeFilters.categories.filter(c => c !== cat);
    else activeFilters.categories.push(cat);
}
function clearFilters() { activeFilters = { types: [], categories: [] }; updateFilterUI(); renderFilterCategories(); }
function applyFilters() { renderTransactionList(); closeFilterModal(); }

// Date Modal
function openDateModal(e) { if (e) e.stopPropagation(); dateModal.classList.add('open'); document.getElementById('filter-start-date').value = dateFilter.start || ''; document.getElementById('filter-end-date').value = dateFilter.end || ''; }
function closeDateModal() { dateModal.classList.remove('open'); }
function applyDateFilter() {
    const start = document.getElementById('filter-start-date').value;
    const end = document.getElementById('filter-end-date').value;
    if (start && end && new Date(start) > new Date(end)) { alert("Start date cannot be after End date!"); return; }
    dateFilter.start = start; dateFilter.end = end;
    renderTransactionList(); closeDateModal();
}
function clearDateFilter() { dateFilter.start = null; dateFilter.end = null; renderTransactionList(); closeDateModal(); }

// Add/Edit Transaction Modal Logic
const saveTransactionBtn = document.getElementById('saveTransactionBtn');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModal');

if (openModalBtn) openModalBtn.addEventListener('click', () => openTxnModal());
if (closeModalBtn) closeModalBtn.addEventListener('click', () => addTxnModal.classList.remove('open'));
window.addEventListener('click', (e) => { if (e.target === addTxnModal) addTxnModal.classList.remove('open'); });

if (saveTransactionBtn) {
    saveTransactionBtn.addEventListener('click', () => {
        const typeInput = document.querySelector('input[name="txn-type"]:checked');
        const amountInput = document.getElementById('txn-amount');
        const dateInput = document.getElementById('txn-date');
        const timeInput = document.getElementById('txn-time');
        const categoryInput = document.getElementById('txn-category');
        const descInput = document.getElementById('txn-desc');

        if (amountInput.value === '' || amountInput.value <= 0) { alert("Please enter a valid amount!"); return; }

        const txnData = {
            id: editingId ? editingId : Date.now(),
            type: typeInput.value,
            amount: parseFloat(amountInput.value),
            date: dateInput.value,
            time: timeInput.value,
            category: categoryInput.value,
            description: descInput.value
        };

        if (editingId) {
            const index = transactions.findIndex(t => t.id === editingId);
            if (index !== -1) transactions[index] = txnData;
            editingId = null;
            saveTransactionBtn.innerText = "Save Transaction";
        } else {
            transactions.push(txnData);
        }

        saveData();
        updateDashboard();

        amountInput.value = ''; descInput.value = '';
        addTxnModal.classList.remove('open');
    });
}

function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions = transactions.filter(txn => txn.id !== id);
        saveData();
        updateDashboard();
    }
}

function startEditTransaction(id) {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;
    editingId = id;

    document.getElementById('txn-amount').value = txn.amount;
    document.getElementById('txn-date').value = txn.date;
    document.getElementById('txn-time').value = txn.time || '';
    document.getElementById('txn-desc').value = txn.description || '';

    if (txn.type === 'expense') { document.getElementById('type-expense').checked = true; updateCategories('expense'); }
    else { document.getElementById('type-income').checked = true; updateCategories('income'); }

    setTimeout(() => { document.getElementById('txn-category').value = txn.category; }, 10);
    saveTransactionBtn.innerText = "Update Transaction";
    addTxnModal.classList.add('open');
}

// ==========================================
//  FIX: DASHBOARD "SET BUDGET" BUTTON
// ==========================================
const setBudgetBtn = document.getElementById('setBudgetBtn');
if (setBudgetBtn) {
    setBudgetBtn.addEventListener('click', () => {
        // 1. Ask user for new budget
        const newBudget = prompt("Enter your Total Monthly Budget:", monthlyBudget);

        // 2. Validate and Save
        if (newBudget && !isNaN(parseFloat(newBudget)) && parseFloat(newBudget) > 0) {
            monthlyBudget = parseFloat(newBudget);
            localStorage.setItem(BUDGET_KEY, monthlyBudget);

            // 3. Update UI immediately
            updateDashboard();
            loadAccountSettings(); // Syncs with the Account page input
            alert(`Budget updated to ${formatMoney(monthlyBudget)}`);
        }
    });
}
// ==========================================
//  10. SAVINGS GOAL CAROUSEL
// ==========================================
let currentGoalIndex = 0;
let goalCarouselInterval;

function updateSavingsWidget() {
    // If no goals, hide or show placeholder
    if (!goals || goals.length === 0) {
        document.getElementById('dash-goal-name').innerText = "No Goals Set";
        document.getElementById('dash-goal-amount').innerText = "$0.00";
        document.getElementById('dash-goal-bar').style.width = "0%";
        return;
    }

    // Ensure index is valid
    if (currentGoalIndex >= goals.length) currentGoalIndex = 0;
    if (currentGoalIndex < 0) currentGoalIndex = goals.length - 1;

    const g = goals[currentGoalIndex];
    const percent = Math.min(100, Math.round((g.current / g.target) * 100));

    // Update DOM elements
    const nameEl = document.getElementById('dash-goal-name');
    const amountEl = document.getElementById('dash-goal-amount');
    const barEl = document.getElementById('dash-goal-bar');
    const targetEl = document.getElementById('dash-goal-target');
    const percentEl = document.getElementById('dash-goal-percent');

    if (nameEl) nameEl.innerText = g.name;
    if (amountEl) amountEl.innerHTML = `${formatMoney(g.current)} <span style="font-size: 14px; color: var(--text-muted); font-weight: 500;">/ ${formatMoney(g.target)}</span>`;
    if (barEl) {
        barEl.style.width = percent + "%";
        barEl.style.backgroundColor = g.color || '#6c5dd3'; // Use goal color if available
    }
    if (targetEl) targetEl.innerText = "Target: " + formatMoney(g.target);
    if (percentEl) percentEl.innerText = percent + "%";
}

function startGoalCarousel() {
    updateSavingsWidget(); // Run immediately
    if (goalCarouselInterval) clearInterval(goalCarouselInterval);

    // Change goal every 6 seconds
    goalCarouselInterval = setInterval(() => {
        currentGoalIndex++;
        updateSavingsWidget();
    }, 6000);
}

function manualRotateGoal(direction) {
    // Reset timer so it doesn't change immediately after user clicks
    clearInterval(goalCarouselInterval);

    currentGoalIndex += direction;
    updateSavingsWidget();

    // Restart timer
    goalCarouselInterval = setInterval(() => {
        currentGoalIndex++;
        updateSavingsWidget();
    }, 4000);
}

// Start the carousel when app loads
document.addEventListener('DOMContentLoaded', () => {
    startGoalCarousel();
});

// ==========================================
//  10B. PAGE LOGIC: INVESTMENTS
// ==========================================
function saveInvestments() {
    localStorage.setItem('pocketguard_investments', JSON.stringify(investments));
}

function renderInvestmentsPage() {
    const tbody = document.getElementById('inv-list-body');
    if (!tbody) return;

    let totalInvested = 0;
    let totalValue = 0;

    tbody.innerHTML = '';

    if (investments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fas fa-chart-line" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>No investments yet. Start building your portfolio!</td></tr>`;
    } else {
        investments.forEach((inv, idx) => {
            totalInvested += inv.amount;
            totalValue += inv.currentValue;

            const gainLoss = inv.currentValue - inv.amount;
            const gainLossPercent = inv.amount > 0 ? ((gainLoss / inv.amount) * 100).toFixed(2) : 0;
            const gainColor = gainLoss >= 0 ? '#00d2aa' : '#ff754c';

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            row.innerHTML = `
                <td style="padding: 12px 15px;">${inv.name}</td>
                <td style="padding: 12px 15px;">${inv.type}</td>
                <td style="padding: 12px 15px; text-align: right;">${formatMoney(inv.amount)}</td>
                <td style="padding: 12px 15px; text-align: right;">${formatMoney(inv.currentValue)}</td>
                <td style="padding: 12px 15px; text-align: right; color: ${gainColor};">${gainLoss >= 0 ? '+' : ''}${gainLossPercent}%</td>
                <td style="padding: 12px 15px; text-align: center;">
                    <button onclick="editInvestment(${idx})" style="background: none; border: none; color: var(--primary); cursor: pointer; margin-right: 10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteInvestment(${idx})" style="background: none; border: none; color: #ff754c; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update summary cards
    const totalROI = totalInvested > 0 ? (((totalValue - totalInvested) / totalInvested) * 100).toFixed(2) : 0;

    const invTotalEl = document.getElementById('inv-total-invested');
    const invValueEl = document.getElementById('inv-total-value');
    const invGainEl = document.getElementById('inv-gain-loss');
    const invROIEl = document.getElementById('inv-roi');

    if (invTotalEl) invTotalEl.innerText = formatMoney(totalInvested);
    if (invValueEl) invValueEl.innerText = formatMoney(totalValue);
    if (invGainEl) {
        const gainLoss = totalValue - totalInvested;
        invGainEl.innerText = formatMoney(gainLoss);
        invGainEl.style.color = gainLoss >= 0 ? '#00d2aa' : '#ff754c';
    }
    if (invROIEl) {
        invROIEl.innerText = totalROI + '%';
        invROIEl.style.color = totalROI >= 0 ? '#00d2aa' : '#ff754c';
    }
}

function openInvestmentModal() {
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    document.getElementById('inv-name').value = '';
    document.getElementById('inv-type').value = 'Stock';
    document.getElementById('inv-amount').value = '';
    document.getElementById('inv-current').value = '';
    document.getElementById('inv-date').value = localDate;
    document.getElementById('inv-notes').value = '';
    document.getElementById('inv-modal-title').innerText = 'Add Investment';

    document.getElementById('investmentModal').classList.add('open');
    window.currentInvEditIndex = -1;
}

function closeInvestmentModal() {
    document.getElementById('investmentModal').classList.remove('open');
}

function saveInvestment() {
    const name = document.getElementById('inv-name').value.trim();
    const type = document.getElementById('inv-type').value;
    const amount = parseFloat(document.getElementById('inv-amount').value);
    const currentValue = parseFloat(document.getElementById('inv-current').value);
    const date = document.getElementById('inv-date').value;
    const notes = document.getElementById('inv-notes').value.trim();

    if (!name || !amount || !currentValue || isNaN(amount) || isNaN(currentValue)) {
        alert('Please fill in all required fields');
        return;
    }

    const investment = { name, type, amount, currentValue, date, notes, id: Date.now() };

    if (window.currentInvEditIndex >= 0) {
        investments[window.currentInvEditIndex] = { ...investments[window.currentInvEditIndex], ...investment };
    } else {
        investments.push(investment);
    }

    saveInvestments();
    renderInvestmentsPage();
    closeInvestmentModal();
}

function editInvestment(index) {
    const inv = investments[index];
    document.getElementById('inv-name').value = inv.name;
    document.getElementById('inv-type').value = inv.type;
    document.getElementById('inv-amount').value = inv.amount;
    document.getElementById('inv-current').value = inv.currentValue;
    document.getElementById('inv-date').value = inv.date;
    document.getElementById('inv-notes').value = inv.notes || '';
    document.getElementById('inv-modal-title').innerText = 'Edit Investment';
    window.currentInvEditIndex = index;
    document.getElementById('investmentModal').classList.add('open');
}

function deleteInvestment(index) {
    if (confirm('Are you sure you want to delete this investment?')) {
        investments.splice(index, 1);
        saveInvestments();
        renderInvestmentsPage();
    }
}

function exportInvestments(format) {
    if (investments.length === 0) {
        alert('No investments to export');
        return;
    }

    let content = '';
    const headers = ['Asset Name', 'Type', 'Amount Invested', 'Current Value', 'Gain/Loss %', 'Date', 'Notes'];

    if (format === 'csv') {
        content = headers.join(',') + '\n';
        investments.forEach(inv => {
            const gainLoss = inv.amount > 0 ? (((inv.currentValue - inv.amount) / inv.amount) * 100).toFixed(2) : 0;
            const row = [
                `"${inv.name}"`,
                inv.type,
                inv.amount,
                inv.currentValue,
                gainLoss,
                inv.date,
                `"${inv.notes || ''}"`
            ].join(',');
            content += row + '\n';
        });
    } else if (format === 'excel') {
        // Simple Excel-compatible format
        content = headers.join('\t') + '\n';
        investments.forEach(inv => {
            const gainLoss = inv.amount > 0 ? (((inv.currentValue - inv.amount) / inv.amount) * 100).toFixed(2) : 0;
            const row = [
                inv.name,
                inv.type,
                inv.amount,
                inv.currentValue,
                gainLoss,
                inv.date,
                inv.notes || ''
            ].join('\t');
            content += row + '\n';
        });
    }

    // Create download link
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `investments_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert(`Investments exported as ${format.toUpperCase()}!`);
}
// ==========================================
//  SCROLL EFFECT FOR TOP BAR
// ==========================================
const topHeader = document.querySelector('.top-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) { // If scrolled down more than 20px
        topHeader.classList.add('scrolled');
    } else {
        topHeader.classList.remove('scrolled');
    }
});
// ==========================================
//  11. INITIAL RUN
// ==========================================


document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Settings
    loadAccountSettings();

    // 2. Set Default Categories
    updateCategories('expense');

    // 3. Render Dashboard
    updateDashboard();

    // 4. Start Goal Carousel
    if (typeof startGoalCarousel === 'function') {
        startGoalCarousel();
    }
});

updateCategories('expense');
updateDashboard();
loadAccountSettings();