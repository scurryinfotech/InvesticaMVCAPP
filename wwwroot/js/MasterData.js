//const searchDropdown = document.getElementById('searchDropdown');
//const dropdown = document.getElementById('dropdown');
//const searchInput = document.getElementById('searchInput');
//const tableBody = document.getElementById('tableBody');

//// Sample data
//const mockData = {
//    Employees: [
//        { id: 1, name: 'John Doe', category: 'Engineering' },
//        { id: 2, name: 'Jane Smith', category: 'Marketing' },
//        { id: 3, name: 'Bob Johnson', category: 'Sales' },
//    ],
//    Companies: [
//        { id: 1, name: 'Tech Corp', category: 'Technology' },
//        { id: 2, name: 'Finance Inc', category: 'Finance' },
//        { id: 3, name: 'Health Plus', category: 'Healthcare' }
//    ],
//    AppTypes: [
//        { id: 1, name: 'Enterprise License', category: 'Premium' },
//        { id: 2, name: 'Standard License', category: 'Standard' },
//        { id: 3, name: 'Trial License', category: 'Trial' }
//    ],
//    Statuses: [
//        { id: 1, name: 'Active', category: 'Operational' },
//        { id: 2, name: 'Inactive', category: 'Operational' },
//        { id: 3, name: 'Pending', category: 'Operational' }
//    ]
//};

//// Dropdown options
//const options = ['All Categories', 'Engineering', 'Marketing', 'Sales', 'HR', 'Technology', 'Finance', 'Healthcare', 'Premium', 'Standard', 'Trial', 'Operational'];

//let currentTab = 'Employees';
//let selectedCategory = '';

//// Populate dropdown initially
//options.forEach(option => {
//    const item = document.createElement('div');
//    item.className = 'dropdown-item';
//    item.textContent = option;
//    item.addEventListener('click', () => {
//        searchDropdown.value = option;
//        dropdown.style.display = 'none';
//        selectedCategory = option === 'All Categories' ? '' : option;
//        loadTableData();
//    });
//    dropdown.appendChild(item);
//});

//// Show dropdown on focus
//searchDropdown.addEventListener('focus', () => {
//    const items = dropdown.querySelectorAll('.dropdown-item');
//    items.forEach(item => item.style.display = 'block');
//    dropdown.style.display = 'block';
//});

//// Filter dropdown on input
//searchDropdown.addEventListener('input', () => {
//    const query = searchDropdown.value.toLowerCase();
//    const items = dropdown.querySelectorAll('.dropdown-item');
//    let hasVisible = false;
//    items.forEach(item => {
//        if (item.textContent.toLowerCase().includes(query)) {
//            item.style.display = 'block';
//            hasVisible = true;
//        } else {
//            item.style.display = 'none';
//        }
//    });
//    dropdown.style.display = hasVisible ? 'block' : 'none';
//});

//// Hide dropdown when clicking outside
//document.addEventListener('click', (e) => {
//    if (!searchDropdown.contains(e.target) && !dropdown.contains(e.target)) {
//        dropdown.style.display = 'none';
//    }
//});

//// Tab switching
//document.querySelectorAll('#mdTabs .nav-link').forEach(tab => {
//    tab.addEventListener('click', (e) => {
//        e.preventDefault();
//        document.querySelectorAll('#mdTabs .nav-link').forEach(t => t.classList.remove('active'));
//        tab.classList.add('active');
//        currentTab = tab.dataset.type;
//        searchInput.value = '';
//        searchDropdown.value = '';
//        selectedCategory = '';
//        loadTableData();
//    });
//});

//// Search input
//searchInput.addEventListener('input', () => {
//    loadTableData();
//});

//// Load table data
//function loadTableData() {
//    const data = mockData[currentTab] || [];
//    const searchTerm = searchInput.value.toLowerCase();

//    let filteredData = data.filter(item => {
//        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
//        const matchesCategory = !selectedCategory || item.category === selectedCategory;
//        return matchesSearch && matchesCategory;
//    });

//    tableBody.innerHTML = '';

//    if (filteredData.length === 0) {
//        tableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No data found</td></tr>';
//    } else {
//        filteredData.forEach((item, index) => {
//            const row = `
//                        <tr>
//                            <td>${index + 1}</td>
//                            <td>${item.name}</td>
//                            <td>
//                                <button class="btn btn-primary btn-sm" onclick="editItem(${item.id})">✏️ Edit</button>
//                                <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">🗑️ Delete</button>
//                            </td>
//                        </tr>
//                    `;
//            tableBody.innerHTML += row;
//        });
//    }

//    // Update counts
//    document.getElementById('countEmployees').textContent = mockData.Employees.length;
//    document.getElementById('countCompanies').textContent = mockData.Companies.length;
//    document.getElementById('countAppTypes').textContent = mockData.AppTypes.length;
//    document.getElementById('countStatuses').textContent = mockData.Statuses.length;
//}

//// Add button
//document.getElementById('addBtn').addEventListener('click', () => {
//    alert(`Add new ${currentTab}`);
//});

//// Edit and delete functions
//function editItem(id) {
//    alert(`Edit item ${id} in ${currentTab}`);
//}

//function deleteItem(id) {
//    if (confirm(`Delete item ${id} from ${currentTab}?`)) {
//        alert(`Item ${id} deleted`);
//    }
//}

//// Initial load
//loadTableData();


//chat gpt code 
    const STORAGE_KEY = "MASTER_DATA_V1";
    let activeType = "Employees";
    let editIndex = null;

        // ✅ Load + normalize masterData
        let masterData = (() => {
            const raw = localStorage.getItem(STORAGE_KEY);
    let parsed = null;
    try {parsed = raw ? JSON.parse(raw) : null; } catch (e) {parsed = null; }

    const defaults = {Employees: [], Companies: [], AppTypes: [], Statuses: [] };
    const md = Object.assign({ }, defaults, parsed || { });
            Object.keys(defaults).forEach(k => { if (!Array.isArray(md[k])) md[k] = []; });
    return md;
        })();

    function saveMD() {localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData)); }

    // ✅ Modal instances
    const mdModal = new bootstrap.Modal(document.getElementById("mdModal"));
    const empModal = new bootstrap.Modal(document.getElementById("empModal"));

    // ✅ init
    document.addEventListener("DOMContentLoaded", function () {
        wireTabs();
    wireAddBtn();
    wireSearch();
    wireMdForm();
    wireEmpForm();
    renderMD();
        });

    // ✅ Tabs click
    function wireTabs() {
        document.querySelectorAll("#mdTabs .nav-link").forEach(tab => {
            tab.addEventListener("click", function (e) {
                e.preventDefault();
                document.querySelectorAll("#mdTabs .nav-link").forEach(x => x.classList.remove("active"));
                this.classList.add("active");

                activeType = this.dataset.type;
                editIndex = null;
                document.getElementById("searchInput").value = "";
                renderMD();
            });
        });
        }

    // ✅ Add button
    function wireAddBtn() {
        document.getElementById("addBtn").addEventListener("click", function () {
            editIndex = null;
            if (activeType === "Employees") {
                document.getElementById("empName").value = "";
                document.getElementById("empEmail").value = "";
                document.getElementById("empRole").value = "";
                document.getElementById("empPhone").value = "";
                empModal.show();
            } else {
                document.getElementById("mdInput").value = "";
                mdModal.show();
            }
        });
        }

    // ✅ Search
    function wireSearch() {
        document.getElementById("searchInput").addEventListener("input", renderMD);
        }

    // ✅ Render MasterData Table
    function renderMD() {
            const body = document.getElementById("tableBody");
    body.innerHTML = "";

    const search = document.getElementById("searchInput").value.toLowerCase();

    // Update counts
    document.getElementById("countEmployees").innerText = masterData.Employees.length;
    document.getElementById("countCompanies").innerText = masterData.Companies.length;
    document.getElementById("countAppTypes").innerText = masterData.AppTypes.length;
    document.getElementById("countStatuses").innerText = masterData.Statuses.length;

    // ✅ Employee table special
    if (activeType === "Employees") {
        document.getElementById("mdTableHead").innerHTML =
        `<tr>
                        <th style="width:5%;">#</th>
                        <th>Employee Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th width="150">Actions</th>
                    </tr>`;

    masterData.Employees
                    .filter(emp =>
    (emp.name || "").toLowerCase().includes(search) ||
    (emp.email || "").toLowerCase().includes(search)
    )
                    .forEach((emp, i) => {
        body.innerHTML += `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${emp.name || ""}</td>
                                <td><a href="mailto:${emp.email || ""}">${emp.email || ""}</a></td>
                                <td>${emp.role || ""}</td>
                                <td>${emp.phone || ""}</td>
                                <td>
                                    <button class="btn btn-info btn-sm me-1" onclick="editEmployee(${i})">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${i})">Delete</button>
                                </td>
                            </tr>`;
                    });

    return;
            }

    // ✅ Generic table for Companies, AppTypes, Statuses
    document.getElementById("mdTableHead").innerHTML =
    `<tr>
        <th style="width:5%;">#</th>
        <th>Name</th>
        <th width="150">Actions</th>
    </tr>`;

    masterData[activeType]
                .filter(x => (x.name || "").toLowerCase().includes(search))
                .forEach((x, i) => {
        body.innerHTML += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${x.name}</td>
                            <td>
                                <button class="btn btn-info btn-sm me-1" onclick="editMD(${i})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteMD(${i})">Delete</button>
                            </td>
                        </tr>`;
                });
        }

    // ✅ Generic edit/delete
    window.editMD = function (i) {
        editIndex = i;
    document.getElementById("mdInput").value = masterData[activeType][i].name;
    mdModal.show();
        };

    window.deleteMD = function (i) {
            if (confirm("Delete?")) {
        masterData[activeType].splice(i, 1);
    saveMD();
    renderMD();
            }
        };

    // ✅ Employee edit/delete
    window.editEmployee = function (i) {
        editIndex = i;
    const emp = masterData.Employees[i];

    document.getElementById("empName").value = emp.name || "";
    document.getElementById("empEmail").value = emp.email || "";
    document.getElementById("empRole").value = emp.role || "";
    document.getElementById("empPhone").value = emp.phone || "";

    empModal.show();
        };

    window.deleteEmployee = function (i) {
            if (confirm("Delete employee?")) {
        masterData.Employees.splice(i, 1);
    saveMD();
    renderMD();
            }
        };

    // ✅ Generic master-data form submit
    function wireMdForm() {
        document.getElementById("mdForm").addEventListener("submit", function (e) {
            e.preventDefault();
            const v = document.getElementById("mdInput").value.trim();
            if (!v) return;

            if (editIndex !== null) masterData[activeType][editIndex].name = v;
            else masterData[activeType].push({ name: v });

            saveMD();
            mdModal.hide();
            renderMD();
        });
        }

    // ✅ Employee form submit
    function wireEmpForm() {
        document.getElementById("empForm").addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("empName").value.trim();
            const email = document.getElementById("empEmail").value.trim();
            const role = document.getElementById("empRole").value.trim();
            const phone = document.getElementById("empPhone").value.trim();

            if (!name) return;

            const payload = { name, email, role, phone };

            if (editIndex !== null) masterData.Employees[editIndex] = payload;
            else masterData.Employees.push(payload);

            saveMD();
            empModal.hide();
            renderMD();
        });
        