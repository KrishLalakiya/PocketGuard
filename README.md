# PocketGuard - Personal Finance Tracker 💰
2nd Term End-Term Project

## 📌 Project Description
PocketGuard is a comprehensive personal finance dashboard designed to help users track their income, expenses, savings goals, and investment portfolios. It solves the problem of financial unawareness by providing real-time analytics, visual charts, and budget tracking in a browser-based environment without the need for backend servers.

## 🚀 Features Implemented
- **Dashboard Analytics:** Real-time calculation of Total Balance, Net Cash Flow, and Survival Status.
- **Transaction Management:** Add, edit, delete, and filter transactions (Income/Expense).
- **Dynamic Visualizations:** Interactive charts using Chart.js for spending breakdown and cash flow trends.
- **Budget Planner:** Visual progress bars indicating budget usage per category with "Percentage Left" logic.
- **Savings Goals:** Goal tracking with AI-simulated insights on completion timeframes.
- **Investment Portfolio:** Track stocks/crypto and export data to CSV.
- **Data Persistence:** All data is saved locally using Browser LocalStorage.

## 🧱 DOM Concepts Used
1.  **Element Creation:** Dynamic generation of transaction rows and goal cards using `document.createElement` and Template Literals.
2.  **Event Handling:** Extensive use of `addEventListener` for modals, form submissions, and dynamic delete buttons (Event Delegation).
3.  **DOM Traversal:** Querying parent/child nodes to update specific UI cards based on IDs.
4.  **Class Manipulation:** Using `classList.toggle` for the sidebar navigation and modal visibility.
5.  **Dynamic Styling:** Updating CSS variables and inline styles (e.g., progress bar widths) via JavaScript.

## ⚙️ Steps to Run the Project
1.  Clone the repository or download the ZIP file.
2.  Open `index.html` in any modern web browser (Chrome/Firefox/Edge).
3.  (Optional) For best experience, use a local server (e.g., Live Server in VS Code) to ensure no CORS issues with modules, though the app supports direct file opening.

## ⚠️ Known Limitations
-   Data is stored in `localStorage`, so clearing browser cache will wipe the data.
-   Export functionality is limited to `.csv` format for Investments.