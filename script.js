let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

document.addEventListener('DOMContentLoaded', function() {
    displayRandomQuote();
    updateDashboardAndLists();
});

function displayRandomQuote() {
    let quotes = [
        "Track your money, or its absence will track you.",
        "Do not save what is left after spending; spend what is left after saving.",
        "Small expenses can add up fast. Keep a close watch!",
        "Budgeting isn't about limiting yourself; it's about making choices."
    ];
    let randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('quote-text').innerHTML = `<i class="fa-solid fa-quote-left"></i> ${quotes[randomIndex]}`;
}

let navButtons = document.querySelectorAll('.nav-btn');
let tabs = document.querySelectorAll('.tab-content');

navButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        navButtons.forEach(btn => btn.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        button.classList.add('active');
        
        let targetId = button.getAttribute('data-tab');
        document.getElementById(targetId).classList.add('active');
    });
});
let form = document.getElementById('transaction-form');

form.addEventListener('submit', function(event) {
    event.preventDefault(); // Stop page from reloading when form submits

    let text = document.getElementById('trans-text').value;
    let amount = Number(document.getElementById('trans-amount').value);
    let category = document.getElementById('trans-category').value;
    let type = document.getElementById('trans-type').value;

    if (amount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    let newTransaction = {
        id: Date.now(), 
        text: text,
        amount: amount,
        category: category,
        type: type
    };

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    updateDashboardAndLists();
    form.reset(); 
});

function deleteTransaction(id) {
    
    transactions = transactions.filter(item => item.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboardAndLists();
}


function updateDashboardAndLists() {
    let totalIncome = 0;
    let totalExpense = 0;

   
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'income') {
            totalIncome = totalIncome + transactions[i].amount;
        } else {
            totalExpense = totalExpense + transactions[i].amount;
        }
    }

    let totalBalance = totalIncome - totalExpense;

    document.getElementById('total-income').textContent = "₹" + totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('total-expense').textContent = "₹" + totalExpense.toLocaleString('en-IN', {minimumFractionDigits: 2});
    
    let balanceElement = document.getElementById('total-balance');
    balanceElement.textContent = "₹" + totalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2});
    
    if (totalBalance >= 0) {
        balanceElement.style.color = 'var(--success)';
    } else {
        balanceElement.style.color = 'var(--danger)';
    }

    renderRecentList();
    renderMasterTable();
    renderAnalyticsBars(totalExpense);
}

function renderRecentList() {
    let listContainer = document.getElementById('recent-list');
    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        listContainer.innerHTML = `<li style="text-align:center; color:#64748b; padding:20px;">No recent transactions.</li>`;
        return;
    }

    let itemsCount = 0;
    for (let i = transactions.length - 1; i >= 0; i--) {
        if (itemsCount >= 5) break; // Limit viewport to only 5 items

        let item = transactions[i];
        let li = document.createElement('li');
        li.className = "transaction-item " + item.type + "-type";
        
        let sign = (item.type === 'income') ? '+' : '-';
        let color = (item.type === 'income') ? 'var(--success)' : 'var(--danger)';

        li.innerHTML = `
            <span><strong>${item.text}</strong><br><small style="color:#64748b;">${item.category}</small></span>
            <span style="font-weight: 700; color: ${color}">${sign}₹${item.amount.toLocaleString('en-IN')}</span>
        `;
        listContainer.appendChild(li);
        itemsCount++;
    }
}

function renderMasterTable() {
    let tableBody = document.getElementById('history-body');
    tableBody.innerHTML = '';

    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding: 20px;">No transaction logs available.</td></tr>`;
        return;
    }

    for (let i = transactions.length - 1; i >= 0; i--) {
        let item = transactions[i];
        let row = document.createElement('tr');
        
        let styleBadge = (item.type === 'income') 
            ? 'background: rgba(0, 184, 148, 0.1); color: var(--success);' 
            : 'background: rgba(214, 48, 49, 0.1); color: var(--danger);';

        row.innerHTML = `
            <td><strong>${item.text}</strong></td>
            <td><span style="background:#f1f5f9; padding:6px 10px; border-radius:6px; font-size:0.82rem; font-weight:500;">${item.category}</span></td>
            <td><span class="badge" style="${styleBadge}">${item.type}</span></td>
            <td style="font-weight:600;">₹${item.amount.toFixed(2)}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${item.id})"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

function renderAnalyticsBars(totalExpense) {
    let container = document.getElementById('analytics-bars');
    container.innerHTML = '';

    let categoryMap = {};

    for (let i = 0; i < transactions.length; i++) {
        let item = transactions[i];
        if (item.type === 'expense') {
            if (categoryMap[item.category] === undefined) {
                categoryMap[item.category] = 0;
            }
            categoryMap[item.category] = categoryMap[item.category] + item.amount;
        }
    }

    let categories = Object.keys(categoryMap);

    if (categories.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#64748b; padding:24px;">No expense records available to chart.</p>`;
        return;
    }

    for (let i = 0; i < categories.length; i++) {
        let catName = categories[i];
        let catAmount = categoryMap[catName];
        
        let percentage = 0;
        if (totalExpense > 0) {
            percentage = ((catAmount / totalExpense) * 100).toFixed(0);
        }

        let chartRow = document.createElement('div');
        chartRow.className = 'chart-row';
        chartRow.innerHTML = `
            <div class="chart-label">
                <span>${catName}</span>
                <span><strong>₹${catAmount.toFixed(2)}</strong> (${percentage}%)</span>
            </div>
            <div class="bar-wrap">
                <div class="bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(chartRow);
    }
}

document.getElementById('gst-btn').addEventListener('click', function() {
    let baseAmount = Number(document.getElementById('gst-amount').value);
    let gstRate = Number(document.getElementById('gst-rate').value);

    if (baseAmount <= 0 || isNaN(baseAmount)) return;

    let gstTaxAmount = (baseAmount * gstRate) / 100;
    let finalGrossBill = baseAmount + gstTaxAmount;

    document.getElementById('gst-result').innerHTML = `
        GST Tax Value: <span style="color: var(--primary); font-weight:600;">₹${gstTaxAmount.toFixed(2)}</span><br>
        Gross Net Total: <span style="color: var(--success); font-weight:600;">₹${finalGrossBill.toFixed(2)}</span>
    `;
});

document.getElementById('emi-btn').addEventListener('click', function() {
    let principal = Number(document.getElementById('loan-amount').value);
    let annualRate = Number(document.getElementById('loan-rate').value);
    let tenureMonths = Number(document.getElementById('loan-months').value);

    if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return;

    let monthlyRate = annualRate / 12 / 100;
    
    let growthValue = Math.pow(1 + monthlyRate, tenureMonths);
    let monthlyEmiResult = (principal * monthlyRate * growthValue) / (growthValue - 1);

    document.getElementById('emi-result').innerHTML = `
        Monthly Pay Payable: <span style="color: var(--primary); font-size:1.15rem; font-weight:700;">₹${monthlyEmiResult.toFixed(2)} / Month</span>
    `;
});