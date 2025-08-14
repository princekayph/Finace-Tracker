let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const balanceEl = document.getElementById("balance");
const form = document.getElementById("transaction-form");
const list = document.getElementById("transactions");
const categoryFilter = document.getElementById("category-filter");
let categoryChart;

let currentFilter = "all"; // Initialize with the default filter

// Adding transactions
form.addEventListener("submit", e => {
    e.preventDefault();

    const title = form.querySelector("input[type='text']").value.trim();
    const amount = parseFloat(form.querySelector("input[type='number']").value);
    const category = form.querySelector("select").value;

    if (!title || isNaN(amount) || amount === 0) {
        alert("Please enter a valid title and non-zero amount.");
        return;
    }

    const transaction = {
        id: Date.now(),
        title,
        amount,
        category,
        date: new Date().toLocaleDateString()
    };

    transactions.push(transaction);
    refreshUI();
    form.reset();
});

// Render transactions
function renderTransactions() {
    list.innerHTML = "";

    const filteredTransactions = transactions.filter(t => {
        if (currentFilter === "income") return t.amount > 0;
        if (currentFilter === "expense") return t.amount < 0;
        return true;
    });

    const fragment = document.createDocumentFragment();

    filteredTransactions.forEach(t => {
        const li = document.createElement("li");
        li.classList.add(t.amount < 0 ? "expense" : "income");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = t.title;

        const amountSpan = document.createElement("span");
        amountSpan.textContent = `${t.amount < 0 ? "-" : "+"}${Math.abs(t.amount).toFixed(2)}`;

        const dateSpan = document.createElement("span");
        dateSpan.classList.add("date");
        dateSpan.textContent = t.date;

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.onclick = () => deleteTransaction(t.id);

        li.append(titleSpan, amountSpan, dateSpan, delBtn);
        fragment.appendChild(li);
    });

    list.appendChild(fragment);
}

// Update balance
function updateBalance() {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    balanceEl.textContent = total.toFixed(2);
}

// Save and load from localStorage
function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Delete button function
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    refreshUI();
}

// Avoiding DRY
function refreshUI() {
    updateLocalStorage();
    renderTransactions();
    updateBalance();
    renderChart();
}

// Listen for changes on the dropdown
categoryFilter.addEventListener("change", () => {
    currentFilter = categoryFilter.value;
    refreshUI();
});

//category totals for the chart
function getCategoryTotals(data){
    const totals = {};

    data.forEach(t => {
        if(!totals[t.category]){
            totals[t.category]= 0
        }
        totals[t.category] += t.amount;
    });

    return totals;
}

//render the chart
function renderChart(){
    //const selectedCategory = filter.value;
    const dataToShow = currentFilter === "all" ? transactions
    //: transactions.filter(t => t.category === selectedCategory);
    :transactions.filter(t => {
        if(currentFilter === "income") return t.amount > 0;
        if(currentFilter === "expense") return t.amount < 0;

        return t.category === currentFilter;
    });

    const totals = getCategoryTotals(dataToShow)
    const categories = Object.keys(totals);
    const amounts = Object.values(totals);

    if (categoryChart){
        categoryChart.destroy();
    }

    const ctx = document.getElementById("categoryChart").getContext("2d");

    categoryChart = new Chart(ctx, {
        type:"bar",
        data:{
            labels: categories,
            datasets:[{
                label: "Category Breakdown",
                data: amounts,
                backgroundColor: [
                    "#4caf50","#2196f3","#ff9800","#9c27b0","#f44336","#00bcd4"
                ],
                borderWidth: 1
            }]
        },
        options:{
            responsive: true,
            plugins:{
                legend:{
                    display: false
                },
                title:{
                    display: true,
                    text: "Spending Breakdown by Category"
                }
            },
            scales:{
                y:{
                    beginAtZero: true,
                    title:{
                        display: true,
                        text: "Amount($)"
                    }
                },
                x:{
                    title:{
                        display: true,
                        text: "Category"

                    }
                }
            }
        }
    });
}

//Ai integration front- end
document.getElementById("get-advice").addEventListener("click", async () => {
    const adviceBox = document.getElementById("advice-box");
     adviceBox.textContent = "Thinking...";

     //Send only recent transactions
     const recent = transactions.slice(-10);
     
     try{
        const response = await
        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactions: recent})
        });

        const data = await response.json();
        adviceBox.textContent = data.advice;

     } catch(err){
        adviceBox.textContent = "Failed to get advice. Try again later.";
     }

});


//dark mode button//
const toggle = document.getElementById("theme-Toggle");
const currentTheme = localStorage.getItem("theme")||"light";


document.documentElement.setAttribute("data-theme", currentTheme);
toggle.textContent = currentTheme === "dark"?"Light Mode":"Dark Mode";

    toggle.addEventListener("click", ()=>{
    const theme = document.documentElement.getAttribute("data-theme")
    ==="dark"?"light":"dark";

    document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        toggle.textContent = theme ==="dark"?"Light Mode":"Dark Mode";

});

// init app
function init() {
    currentFilter = categoryFilter.value; 
    refreshUI();
}

init();




