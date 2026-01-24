const searchDropdown = document.getElementById('searchDropdown');
const dropdown = document.getElementById('dropdown');
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');

// Sample data
const mockData = {
    Employees: [
        { id: 1, name: 'John Doe', category: 'Engineering' },
        { id: 2, name: 'Jane Smith', category: 'Marketing' },
        { id: 3, name: 'Bob Johnson', category: 'Sales' },
    ],
    Companies: [
        { id: 1, name: 'Tech Corp', category: 'Technology' },
        { id: 2, name: 'Finance Inc', category: 'Finance' },
        { id: 3, name: 'Health Plus', category: 'Healthcare' }
    ],
    AppTypes: [
        { id: 1, name: 'Enterprise License', category: 'Premium' },
        { id: 2, name: 'Standard License', category: 'Standard' },
        { id: 3, name: 'Trial License', category: 'Trial' }
    ],
    Statuses: [
        { id: 1, name: 'Active', category: 'Operational' },
        { id: 2, name: 'Inactive', category: 'Operational' },
        { id: 3, name: 'Pending', category: 'Operational' }
    ]
};

// Dropdown options
const options = ['All Categories', 'Engineering', 'Marketing', 'Sales', 'HR', 'Technology', 'Finance', 'Healthcare', 'Premium', 'Standard', 'Trial', 'Operational'];

let currentTab = 'Employees';
let selectedCategory = '';

// Populate dropdown initially
options.forEach(option => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = option;
    item.addEventListener('click', () => {
        searchDropdown.value = option;
        dropdown.style.display = 'none';
        selectedCategory = option === 'All Categories' ? '' : option;
        loadTableData(); 
    });
    dropdown.appendChild(item);
});

// Show dropdown on focus
searchDropdown.addEventListener('focus', () => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    items.forEach(item => item.style.display = 'block');
    dropdown.style.display = 'block';
});

// Filter dropdown on input
searchDropdown.addEventListener('input', () => {
    const query = searchDropdown.value.toLowerCase();
    const items = dropdown.querySelectorAll('.dropdown-item');
    let hasVisible = false;
    items.forEach(item => {
        if (item.textContent.toLowerCase().includes(query)) {
            item.style.display = 'block';
            hasVisible = true;
        } else {
            item.style.display = 'none';
        }
    });
    dropdown.style.display = hasVisible ? 'block' : 'none';
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!searchDropdown.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Tab switching
document.querySelectorAll('#mdTabs .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#mdTabs .nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.type;
        searchInput.value = '';
        searchDropdown.value = '';
        selectedCategory = '';
        loadTableData();
    });
});

// Search input
searchInput.addEventListener('input', () => {
    loadTableData();
});

// Load table data
function loadTableData() {
    const data = mockData[currentTab] || [];
    const searchTerm = searchInput.value.toLowerCase();

    let filteredData = data.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No data found</td></tr>';
    } else {
        filteredData.forEach((item, index) => {
            const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="editItem(${item.id})">✏️ Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">🗑️ Delete</button>
                            </td>
                        </tr>
                    `;
            tableBody.innerHTML += row;
        });
    }

    // Update counts
    document.getElementById('countEmployees').textContent = mockData.Employees.length;
    document.getElementById('countCompanies').textContent = mockData.Companies.length;
    document.getElementById('countAppTypes').textContent = mockData.AppTypes.length;
    document.getElementById('countStatuses').textContent = mockData.Statuses.length;
}

// Add button
document.getElementById('addBtn').addEventListener('click', () => {
    alert(`Add new ${currentTab}`);
});

// Edit and delete functions
function editItem(id) {
    alert(`Edit item ${id} in ${currentTab}`);
}

function deleteItem(id) {
    if (confirm(`Delete item ${id} from ${currentTab}?`)) {
        alert(`Item ${id} deleted`);
    }
}

// Initial load
loadTableData();