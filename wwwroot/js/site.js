    const dashboard = document.getElementById("dashboard");
    const loader = document.getElementById("loader");
    // initial tabs NodeList (used for binding earlier)
    const tabs = document.querySelectorAll('.tab');
    const tabsBar = document.querySelector('.tabs');

        // Save original tab texts so we can restore later when exiting wizard
        const _originalTabsState = Array.from(tabsBar.querySelectorAll('.tab')).map(el => ({
        text: el.textContent,
    display: el.style.display || ''
        }));

    function clearCards() {
        dashboard.innerHTML = '';
        }
    function logout() {
        // remember where to return after login
        sessionStorage.setItem('postLoginRedirect', 'InvesticaDashboard.html');
    // optionally clear any client-side session flags here (e.g. sessionStorage.removeItem('loggedIn'))
    window.location.href = 'login.html';
        }

    // wire the header button (defensive if placed before script)
    document.addEventListener('DOMContentLoaded', function () {
            const btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', logout);
        });
    function replaceTabsLabels(labels = [], activeLabel = '') {
            const tabEls = Array.from(tabsBar.querySelectorAll('.tab'));
    for (let i = 0; i < labels.length; i++) {
                if (tabEls[i]) {
        tabEls[i].style.display = '';
    tabEls[i].textContent = labels[i];
                } else {
                    const div = document.createElement('div');
    div.className = 'tab';
    div.textContent = labels[i];
    div.addEventListener('click', function () {
                        const prev = document.querySelector('.tab.active');
    if (prev) prev.classList.remove('active');
    this.classList.add('active');
    const tabName = this.textContent.trim();
    applyTabState(tabName);
    showEmptyCards(tabName);
                    });
    tabsBar.appendChild(div);
    tabEls.push(div);
                }
            }
    // Hide any extra tabs that remain
    for (let j = labels.length; j < tabEls.length; j++) {
        tabEls[j].style.display = 'none';
            }

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (activeLabel) {
                const a = Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim() === activeLabel);
    if (a) a.classList.add('active');
            }
        }

    function restoreOriginalTabs() {
            const tabEls = Array.from(tabsBar.querySelectorAll('.tab'));
    for (let i = 0; i < _originalTabsState.length; i++) {
                if (tabEls[i]) {
        tabEls[i].textContent = _originalTabsState[i].text;
    tabEls[i].style.display = _originalTabsState[i].display || '';
                }
            }
    // if there are more DOM tabs than original, show them (or leave hidden)
    for (let j = _originalTabsState.length; j < tabEls.length; j++) {
        tabEls[j].style.display = 'none';
            }
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const dash = Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim().toLowerCase() === 'dashboard');
    if (dash) dash.classList.add('active');
        }

    function showDashboardView() {
        dashboard.innerHTML = `
                                              <div class="card p-4">
                                                <h3 class="fw-bold">Dashboard</h3>
                                                <p class="text-muted">Welcome to the CRM Dashboard. You can create tickets from here.</p>
                                                <div class="card p-4 bg-light">
                                                  <h4 class="fw-bold mb-3">Generate / Search Ticket</h4>
                                                  <label>Search Ticket Number</label>
                                                  <input class="form-control mb-3" placeholder="Enter existing ticket number">
                                                  <button class="btn btn-warning mb-4">Search</button>
                                                  <label>Select Company</label>
                                                  <select class="form-select mb-3"><option>XYZ Industries</option></select>
                                                  <button class="btn btn-warning" onclick="showPage(2)">Next</button>
                                                </div>
                                              </div>`;
        }

    // MASTER DATA logic
    const STORAGE_KEY = "MASTER_DATA_V1";
    let activeType = "Companies";
    let editIndex = null;

        // Load + normalize masterData from localStorage so missing keys won't be undefined
        let masterData = (() => {
            const raw = localStorage.getItem(STORAGE_KEY);
    let parsed = null;
    try {parsed = raw ? JSON.parse(raw) : null; } catch (e) {parsed = null; }
    const defaults = {Employees: [], Companies: [], AppTypes: [], Statuses: [] };
    const md = Object.assign({ }, defaults, parsed || { });
            // Ensure each expected key is an array
            Object.keys(defaults).forEach(k => { if (!Array.isArray(md[k])) md[k] = []; });
    return md;
        })();

    function saveMD() {localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData)); }

    function showMasterData() {
        dashboard.innerHTML = `
                                <div class="card p-4">
                                  <h4 class="fw-bold mb-3">Master Data Management</h4>
                                  <p class="text-muted">You can manage companies, licenses, employees and status from here.</p>
                                  <ul class="nav nav-tabs mb-3" id="mdTabs">
                                    <li class="nav-item"><a class="nav-link active" data-type="Employees" href="#">Employees <span class="badge badge-count ms-1" id="countEmployees">0</span></a></li>
                                    <li class="nav-item"><a class="nav-link" data-type="Companies" href="#">Companies <span class="badge badge-count ms-1" id="countCompanies">0</span></a></li>
                                    <li class="nav-item"><a class="nav-link" data-type="AppTypes" href="#">License Types <span class="badge badge-count ms-1" id="countAppTypes">0</span></a></li>
                                    <li class="nav-item"><a class="nav-link" data-type="Statuses" href="#">Statuses <span class="badge badge-count ms-1" id="countStatuses">0</span></a></li>
                                  </ul>

                                  <div class="d-flex justify-content-between mb-3">
                                    <button class="btn btn-success btn-sm" id="addBtn">➕ Add</button>
                                    <input class="form-control form-control-sm search-box" id="searchInput" placeholder="🔍 Search">
                                  </div>

                                  <table class="table table-bordered">
                                    <thead><tr id="mdTableHead"><th>#</th><th>Name</th><th width="150">Actions</th></tr></thead>
                                    <tbody id="tableBody"></tbody>
                                  </table>
                                </div>`;

    initMD();
        }

    function initMD() {
            // ensure activeType reflects selected nav (default Companies if not set)
            const activeNav = document.querySelector("#mdTabs .nav-link.active");
    activeType = activeNav ? activeNav.dataset.type || "Companies" : activeType;

    renderMD();

            document.querySelectorAll("#mdTabs .nav-link").forEach(tab => {
        tab.onclick = e => {
            e.preventDefault();
            const prev = document.querySelector("#mdTabs .active");
            if (prev) prev.classList.remove("active");
            tab.classList.add("active");
            activeType = tab.dataset.type;
            editIndex = null;
            renderMD();
        };
            });

    const addBtn = document.getElementById('addBtn');
    const searchInput = document.getElementById('searchInput');

            addBtn.onclick = () => {
        editIndex = null;
    if (activeType === 'Employees') {
        // clear employee modal inputs
        document.getElementById('empName').value = '';
    document.getElementById('empEmail').value = '';
    document.getElementById('empRole').value = '';
    document.getElementById('empPhone').value = '';
    empModal.show();
                } else {
        document.getElementById('mdInput').value = '';
    mdModal.show();
                }
            };
    searchInput.oninput = renderMD;
        }

    function renderMD() {
            const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    tableBody.innerHTML = "";
    const s = (searchInput && searchInput.value ? searchInput.value.toLowerCase() : "");

    // Employees special table
    if (activeType === 'Employees') {
        // set header
        document.getElementById('mdTableHead').innerHTML = `<tr><th style="width:5%;">#</th><th>Employee Name</th><th>Email</th><th>Role</th><th>Phone</th><th width="150">Actions</th></tr>`;
                masterData.Employees.filter(emp => (emp.name || '').toLowerCase().includes(s) || (emp.email || '').toLowerCase().includes(s))
                    .forEach((emp, i) => {
        tableBody.innerHTML += `
                                        <tr>
                                          <td>${i + 1}</td>
                                          <td>${emp.name || ''}</td>
                                          <td><a href="mailto:${emp.email}">${emp.email || ''}</a></td>
                                          <td>${emp.role || ''}</td>
                                          <td>${emp.phone || ''}</td>
                                          <td>
                                            <button class="btn btn-info btn-sm me-1" onclick="editEmployee(${i})">Edit</button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${i})">Delete</button>
                                          </td>
                                        </tr>`;
                    });
    document.getElementById('countEmployees').innerText = masterData.Employees.length;
    // update other counts
    document.getElementById('countCompanies').innerText = masterData.Companies.length;
    document.getElementById('countAppTypes').innerText = masterData.AppTypes.length;
    document.getElementById('countStatuses').innerText = masterData.Statuses.length;
    return;
            }

    // Generic items (name only)
    document.getElementById('mdTableHead').innerHTML = `<tr><th>#</th><th>Name</th><th width="150">Actions</th></tr>`;
            masterData[activeType].filter(x => (x.name || '').toLowerCase().includes(s))
                .forEach((x, i) => {
        tableBody.innerHTML += `
                                        <tr>
                                          <td>${i + 1}</td><td>${x.name}</td>
                                          <td>
                                            <button class="btn btn-info btn-sm me-1" onclick="editMD(${i})">Edit</button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteMD(${i})">Delete</button>
                                          </td>
                                        </tr>`;
                });
    document.getElementById('countEmployees').innerText = masterData.Employees.length;
    document.getElementById('countCompanies').innerText = masterData.Companies.length;
    document.getElementById('countAppTypes').innerText = masterData.AppTypes.length;
    document.getElementById('countStatuses').innerText = masterData.Statuses.length;
        }

    // Generic edit/delete for name-only master data
    function editMD(i) {
        editIndex = i;
    document.getElementById('mdInput').value = masterData[activeType][i].name;
    mdModal.show();
        }

    function deleteMD(i) { if (confirm("Delete?")) {masterData[activeType].splice(i, 1); saveMD(); renderMD(); } }

    // Employee specific functions
    function editEmployee(i) {
        editIndex = i;
    const emp = masterData.Employees[i];
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empEmail').value = emp.email || '';
    document.getElementById('empRole').value = emp.role || '';
    document.getElementById('empPhone').value = emp.phone || '';
    empModal.show();
        }

    function deleteEmployee(i) { if (confirm("Delete employee?")) {masterData.Employees.splice(i, 1); saveMD(); renderMD(); } }

    // SAFE: wire generic md form
    function wireMdForm() {
            const mdFormEl = document.getElementById('mdForm');
    if (!mdFormEl) return;
    mdFormEl.onsubmit = function (e) {
        e.preventDefault();
    const mdInputEl = document.getElementById('mdInput');
    const v = (mdInputEl && mdInputEl.value) ? mdInputEl.value.trim() : '';
    if (!v) return;
    if (editIndex !== null) masterData[activeType][editIndex].name = v;
    else masterData[activeType].push({name: v });
    saveMD();
    const modalEl = document.getElementById('mdModal');
    if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    bsModal.hide();
                }
    renderMD();
            };
        }

    // SAFE: wire employee form
    function wireEmpForm() {
            const empFormEl = document.getElementById('empForm');
    if (!empFormEl) return;
    empFormEl.onsubmit = function (e) {
        e.preventDefault();
    const name = (document.getElementById('empName').value || '').trim();
    const email = (document.getElementById('empEmail').value || '').trim();
    const role = (document.getElementById('empRole').value || '').trim();
    const phone = (document.getElementById('empPhone').value || '').trim();
    if (!name) return;
    const payload = {name, email, role, phone};
    if (editIndex !== null) {
        masterData.Employees[editIndex] = payload;
                } else {
        masterData.Employees.push(payload);
                }
    saveMD();
    const empModalEl = document.getElementById('empModal');
    if (empModalEl) {
                    const bs = bootstrap.Modal.getInstance(empModalEl) || new bootstrap.Modal(empModalEl);
    bs.hide();
                }
    renderMD();
            };
        }

    // modal instances
    const mdModalEl = document.getElementById("mdModal");
    const mdModal = mdModalEl ? new bootstrap.Modal(mdModalEl) : null;
    const empModalEl = document.getElementById("empModal");
    const empModal = empModalEl ? new bootstrap.Modal(empModalEl) : null;

    // initial wiring
    wireMdForm();
    wireEmpForm();

    // re-wire when modals shown (defensive)
    if (mdModalEl) mdModalEl.addEventListener('shown.bs.modal', wireMdForm);
    if (empModalEl) empModalEl.addEventListener('shown.bs.modal', wireEmpForm);

    function showEmptyCards(tabName) {
            // Integrate: Dashboard and Master Data renderers
            if (tabName.toLowerCase() === 'dashboard') {
        loader.style.display = "none";
    showDashboardView();
    return;
            }
    if (tabName.toLowerCase() === 'master data') {
        loader.style.display = "none";
    showMasterData();
    return;
            }

    clearCards();
    loader.style.display = "none";

    // Handle Links tab with table data
    if (tabName.toLowerCase() === 'links') {
                const card = document.createElement("div");
    card.className = "card p-4";

    const shopData = [
    {srNo: 1, state: "MAHARASHTRA (MUMBAI)", url: "https://portal.mcgm.gov.in/irj/portal/anonymous/qlsaeoService" },
    {srNo: 2, state: "REST OF MAHARASHTRA", url: "https://maitri.mahsonline.gov.in/Login/Logni" },
    {srNo: 3, state: "KARNATAKA", url: "http://164.100.133.176/ekarnika/Static/Home.aspx" },
    {srNo: 4, state: "DELHI", url: "http://labourcis.nic.in/" },
    {srNo: 5, state: "MADHYA PRADESH", url: "http://www.labour.mp.gov.in/Esr/public/Establishment_Apply.aspx" },
    {srNo: 6, state: "ANDHRA PRADESH", url: "https://ineap.meeseva.gov.in/CitizenPortal/UserInterface/Citizen/CitizenHome" },
    {srNo: 7, state: "WEST BENGAL", url: "https://wbshopsonline.gov.in/#" },
    {srNo: 8, state: "KERALA", url: "https://lcas.lc.kerala.gov.in/office/registration/onlinemain_online_pay.php" },
    {srNo: 9, state: "TAMIL NADU", url: "https://labour.tn.gov.in/services/users/login" },
    {srNo: 10, state: "GUJARAT", url: "OFFLINE" }
    ];

    const tradeData = [
    {srNo: 1, name: "NAVI MUMBAI MUNICIPAL CORPORATION", url: "https://www.nmmc.gov.in/" },
    {srNo: 2, name: "THANE MUNICIPAL CORPORATION", url: "https://thanecity.gov.in/tmc/CitizenHome.html" },
    {srNo: 3, name: "KALYAN-DOMBIVALI MUNICIPAL CORPORATION", url: "https://kdmc.gov.in/kdmc/CitizenHome.html" },
    {srNo: 4, name: "MUMBAI MUNICIPAL CORPORATION", url: "https://mcgm.gov.in/" }
    ];

    let tableHtml = `<div style='max-height: 50vh; overflow-y: auto; padding-right: 10px;'>
        <h5 style='color: #0f1445; font-weight: 700; position: sticky; top: 0; background: #fff; padding: 10px 0; margin-bottom: 15px; z-index: 5;'>SHOP CATEGORY LINKS</h5>
        <table class='table table-bordered table-hover'>
            <thead class='table-dark' style='position: sticky; top: 45px;'>
                <tr><th style='width: 40%;'>STATE</th><th style='width: 60%;'>URL</th></tr>
            </thead>
            <tbody>`;

                shopData.forEach(row => {
                    const isOffline = row.url === 'OFFLINE';
                tableHtml += `<tr><td>${row.state}</td><td>${isOffline ? '<span style="color: red; font-weight: bold;">OFFLINE</span>' : `<a href='${row.url}' target='_blank' style='color: #0066cc;'>${row.url}</a>`}</td></tr>`;
                });

                tableHtml += `</tbody></table></div>`;
    tableHtml += `<div style='max-height: 50vh; overflow-y: auto; padding-right: 10px; margin-top: 20px;'>
        <h5 style='color: #0f1445; font-weight: 700; position: sticky; top: 0; background: #fff; padding: 10px 0; margin-bottom: 15px; z-index: 5;'>TRADE CATEGORY LINKS</h5>
        <table class='table table-bordered table-hover'>
            <thead class='table-dark' style='position: sticky; top: 45px;'>
                <tr><th style='width: 10%;'>SR NO</th><th style='width: 45%;'>CORPORATION</th><th style='width: 45%;'>WEBSITE</th></tr>
            </thead>
            <tbody>`;

                tradeData.forEach(row => {
                    tableHtml += `<tr><td>${row.srNo}</td><td>${row.name}</td><td><a href='${row.url}' target='_blank' style='color: #0066cc;'>${row.url}</a></td></tr>`;
                });

                tableHtml += `</tbody></table></div>`;
    card.innerHTML = tableHtml;
    dashboard.appendChild(card);
    return;
            }

    // Handle Renewals tab
    if (tabName.toLowerCase() === 'renewals') {
                const card = document.createElement("div");
    card.className = "card p-4";

    const renewalsData = [
    {srNo: 1, licenseType: "SHOP LICENSE", location: "KOLKATA", company: "CUREFOODS INDIA PVT. LTD", currentExpiry: "15-Mar-2025", renewalDueDate: "15-Feb-2025", status: "URGENT" },
    {srNo: 2, licenseType: "SHOP LICENSE", location: "MUMBAI", company: "INVESTIRE LEX & AUDIRE", currentExpiry: "20-Apr-2025", renewalDueDate: "20-Mar-2025", status: "URGENT" },
    {srNo: 3, licenseType: "TRADE LICENSE", location: "BANGALORE", company: "TECH SOLUTIONS PVT. LTD", currentExpiry: "10-May-2025", renewalDueDate: "10-Apr-2025", status: "URGENT" },
    {srNo: 4, licenseType: "SHOP LICENSE", location: "DELHI", company: "APEX RETAIL CORP", currentExpiry: "25-Jun-2025", renewalDueDate: "25-May-2025", status: "DUE SOON" },
    {srNo: 5, licenseType: "TRADE LICENSE", location: "PUNE", company: "BUSINESS VENTURES INC", currentExpiry: "08-Jul-2025", renewalDueDate: "08-Jun-2025", status: "DUE SOON" },
    {srNo: 6, licenseType: "SHOP LICENSE", location: "NAVI MUMBAI", company: "COMMERCE SOLUTIONS LTD", currentExpiry: "12-Aug-2025", renewalDueDate: "12-Jul-2025", status: "DUE SOON" },
    {srNo: 7, licenseType: "TRADE LICENSE", location: "AHMEDABAD", company: "TRADE PARTNERS GROUP", currentExpiry: "30-Aug-2025", renewalDueDate: "30-Jul-2025", status: "DUE SOON" },
    {srNo: 8, licenseType: "SHOP LICENSE", location: "HYDERABAD", company: "SOUTH INDIA RETAIL", currentExpiry: "15-Sep-2025", renewalDueDate: "15-Aug-2025", status: "PENDING" },
    {srNo: 9, licenseType: "TRADE LICENSE", location: "CHENNAI", company: "COASTAL BUSINESS LTD", currentExpiry: "22-Oct-2025", renewalDueDate: "22-Sep-2025", status: "PENDING" },
    {srNo: 10, licenseType: "SHOP LICENSE", location: "JAIPUR", company: "NORTH INDIA COMMERCE", currentExpiry: "05-Nov-2025", renewalDueDate: "05-Oct-2025", status: "PENDING" },
    {srNo: 11, licenseType: "TRADE LICENSE", location: "LUCKNOW", company: "EASTERN TRADE CORP", currentExpiry: "18-Dec-2025", renewalDueDate: "18-Nov-2025", status: "PENDING" },
    {srNo: 12, licenseType: "SHOP LICENSE", location: "SURAT", company: "WESTERN COMMERCE PVT", currentExpiry: "25-Jan-2026", renewalDueDate: "25-Dec-2025", status: "PENDING" }
    ];

    let renewalHtml = `
    <div style='margin-bottom: 20px; padding: 15px; background:#f8f9fa; border-radius: 8px;'>
        <h6 style='color: #0f1445; font-weight: 700; margin-bottom: 15px;'>FILTER RENEWALS</h6>
        <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;'>
            <div>
                <label style='font-size: 11px; font-weight: bold; color: #666; margin-bottom: 5px; display: block;'>LICENSE TYPE</label>
                <select id='filter_licenseType' class='form-select form-select-sm' style='font-size: 0.9em;'>
                    <option value=''>All License Types</option>
                    <option value='SHOP LICENSE'>Shop License</option>
                    <option value='TRADE LICENSE'>Trade License</option>
                </select>
            </div>
            <div>
                <label style='font-size: 11px; font-weight: bold; color: #666; margin-bottom: 5px; display: block;'>LOCATION</label>
                <select id='filter_location' class='form-select form-select-sm' style='font-size: 0.9em;'>
                    <option value=''>All Locations</option>
                    <option value='KOLKATA'>Kolkata</option>
                    <option value='MUMBAI'>Mumbai</option>
                    <option value='BANGALORE'>Bangalore</option>
                    <option value='DELHI'>Delhi</option>
                    <option value='PUNE'>Pune</option>
                    <option value='NAVI MUMBAI'>Navi Mumbai</option>
                    <option value='AHMEDABAD'>Ahmedabad</option>
                    <option value='HYDERABAD'>Hyderabad</option>
                    <option value='CHENNAI'>Chennai</option>
                    <option value='JAIPUR'>Jaipur</option>
                    <option value='LUCKNOW'>Lucknow</option>
                    <option value='SURAT'>Surat</option>
                </select>
            </div>
            <div>
                <label style='font-size: 11px; font-weight: bold; color: #666; margin-bottom: 5px; display: block;'>COMPANY NAME</label>
                <input type='text' id='filter_company' class='form-control form-control-sm' placeholder='Search company...' style='font-size: 0.9em;'>
            </div>
            <div>
                <label style='font-size: 11px; font-weight: bold; color: #666; margin-bottom: 5px; display: block;'>STATUS</label>
                <select id='filter_status' class='form-select form-select-sm' style='font-size: 0.9em;'>
                    <option value=''>All Status</option>
                    <option value='URGENT'>Urgent</option>
                    <option value='DUE SOON'>Due Soon</option>
                    <option value='PENDING'>Pending</option>
                </select>
            </div>
            <div style='align-self: flex-end;'>
                <button id='resetFilters' class='btn btn-sm btn-warning w-100' style='background: #f78812; border: none; color: white; font-weight: bold; font-size: 0.9em;'>Reset Filters</button>
            </div>
        </div>
    </div>

    <div style='max-height: 100vh; overflow-y: auto; padding-right: 10px;'>
        <h5 style='color: #0f1445; font-weight: 700; position: sticky; top: 0; background: #fff; padding: 10px 0; margin-bottom: 15px; z-index: 5;'>UPCOMING RENEWALS</h5>
        <table class='table table-bordered table-hover' id='renewalsTable'>
            <thead class='table-dark' style='position: sticky; top: 45px;'>
                <tr>
                    <th style='width: 5%;'>SR NO</th>
                    <th style='width: 15%;'>LICENSE TYPE</th>
                    <th style='width: 15%;'>LOCATION</th>
                    <th style='width: 25%;'>COMPANY NAME</th>
                    <th style='width: 12%;'>CURRENT EXPIRY</th>
                    <th style='width: 12%;'>RENEWAL DUE DATE</th>
                    <th style='width: 12%;'>STATUS</th>
                </tr>
            </thead>
            <tbody id='renewalsTableBody'></tbody>
        </table>
    </div>
    `;
    card.innerHTML = renewalHtml;
    dashboard.appendChild(card);

                // Populate renewals table
                setTimeout(() => {
                    const tableBody = document.getElementById('renewalsTableBody');
                    renewalsData.forEach(row => {
        let statusColor = '#198754';
    let statusBg = '#d1e7dd';

    if (row.status === 'URGENT') {
        statusColor = '#dc3545';
    statusBg = '#f8d7da';
                        } else if (row.status === 'DUE SOON') {
        statusColor = '#ff9800';
    statusBg = '#fff3cd';
                        }

    const tr = document.createElement('tr');
    tr.className = 'renewal-row';
    tr.setAttribute('data-license', row.licenseType);
    tr.setAttribute('data-location', row.location);
    tr.setAttribute('data-company', row.company.toUpperCase());
    tr.setAttribute('data-status', row.status);
    tr.innerHTML = `
    <td>${row.srNo}</td>
    <td>${row.licenseType}</td>
    <td><strong>${row.location}</strong></td>
    <td>${row.company}</td>
    <td>${row.currentExpiry}</td>
    <td><strong>${row.renewalDueDate}</strong></td>
    <td><span style='background-color: ${statusBg}; color: ${statusColor}; padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85em;'>${row.status}</span></td>
    `;
    tableBody.appendChild(tr);
                    });

    // Filter functionality
    const filterLicenseType = document.getElementById('filter_licenseType');
    const filterLocation = document.getElementById('filter_location');
    const filterCompany = document.getElementById('filter_company');
    const filterStatus = document.getElementById('filter_status');
    const resetBtn = document.getElementById('resetFilters');
    const renewalRows = document.querySelectorAll('.renewal-row');

    function applyFilters() {
                        const licenseVal = filterLicenseType.value.toUpperCase();
    const locationVal = filterLocation.value.toUpperCase();
    const companyVal = filterCompany.value.toUpperCase();
    const statusVal = filterStatus.value.toUpperCase();

                        renewalRows.forEach(row => {
                            const license = row.getAttribute('data-license').toUpperCase();
    const location = row.getAttribute('data-location').toUpperCase();
    const company = row.getAttribute('data-company').toUpperCase();
    const status = row.getAttribute('data-status').toUpperCase();

    let show = true;

    if (licenseVal && !license.includes(licenseVal)) show = false;
    if (locationVal && !location.includes(locationVal)) show = false;
    if (companyVal && !company.includes(companyVal)) show = false;
    if (statusVal && !status.includes(statusVal)) show = false;

    row.style.display = show ? '' : 'none';
                        });
                    }

    filterLicenseType.addEventListener('change', applyFilters);
    filterLocation.addEventListener('change', applyFilters);
    filterCompany.addEventListener('input', applyFilters);
    filterStatus.addEventListener('change', applyFilters);

    resetBtn.addEventListener('click', function () {
        filterLicenseType.value = '';
    filterLocation.value = '';
    filterCompany.value = '';
    filterStatus.value = '';
                        renewalRows.forEach(row => row.style.display = '');
                    });
                }, 150);

    return;
            }

    // Handle single Frontsheet
    if (tabName.toLowerCase() === 'frontsheet') {
                const card = document.createElement("div");
    card.className = "card p-0";
    const frontsheetId = `frontsheet_${Date.now()}`;
    card.innerHTML = `
    <div style='background:#fff; padding:0; font-family:Arial, sans-serif; line-height:1.4; font-size:12px;'>
        <!-- HEADER -->
        <div style='background:#fff; padding:15px; border-bottom:2px solid #0f1445; display:flex; justify-content:space-between; align-items:center;'>
            <div style='flex:1;'>
                <div style='background:#ff69b4; padding:8px 12px; border-radius:8px; display:inline-block; font-weight:bold; color:#000;'>INVESTICA</div>
                <div style='margin-top:5px; font-size:10px; color:#666;'>For New Client Acquisition / Existing Client Update</div>
            </div>
            <div style='text-align:center; font-size:14px; font-weight:bold; color:#0f1445;'>INVESTICA</div>
            <div style='text-align:right;'>
                <div style='font-size:10px; font-weight:bold;'>CRN NO:</div>
                <div style='border:1px solid #333; padding:4px 8px; min-width:80px; text-align:center;'></div>
            </div>
        </div>

        <!-- FORM TITLE -->
        <div style='text-align:center; padding:10px; background:#f8f9fa; border-bottom:1px solid #ddd; font-weight:bold; font-size:11px;'>
            FOR NEW CLIENT ACQUISITION / EXISTING CLIENT UPDATE APPLICATION FORM
        </div>

        <!-- FORM CONTENT -->
        <div style='padding:15px;'>
            <!-- Row 1: NAME / ENTITY NAME -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>NAME / ENTITY NAME:</div>
                <div id='${frontsheetId}_name' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>AANSWR FASHION PRIVATE LIMITED CO</div>
            </div>

            <!-- Row 2: ADDRESS -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>ADDRESS:</div>
                <div id='${frontsheetId}_address' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>SECTOR-19, VASHI, NAVI MUMBAI</div>
            </div>

            <!-- Row 3: Contact & Email -->
            <div style='display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;'>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>CONTACT DETAILS: PHONE/ MOB:</div>
                    <div id='${frontsheetId}_phone' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>8657075171</div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>E-MAIL ID:</div>
                    <div id='${frontsheetId}_email' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>clientcompliance@gmail.com</div>
                </div>
            </div>

            <!-- Row 4: Individual/Promoter Details -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>INDIVIDUAL/PROMOTER/PARTNER/DIRECTOR/HUF NAME & ADDRESS(s):</div>
                <div id='${frontsheetId}_director' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>MR. DHRUV RAVINDRAKUMAR TOSHNIVAL, RA, MARVIEW BUILDING, ALTAMOUNT ROAD CUMBALLA HILL, MUMBAI - 400026</div>
            </div>

            <!-- Row 5: Entity Type & PAN -->
            <div style='display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;'>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>ENTITY TYPE:</div>
                    <div id='${frontsheetId}_entitytype' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>PRIVATE LTD CO</div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>PAN & AADHAR:</div>
                    <div id='${frontsheetId}_pan' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>AUZPT9293H</div>
                </div>
            </div>

            <!-- Row 6: Nature of Business -->
            <div style='display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;'>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>NATURE OF BUSINESS:</div>
                    <div id='${frontsheetId}_business' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>RETAIL TRADING</div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>ENTITY PAN:</div>
                    <div id='${frontsheetId}_epan' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>AATCA0564H</div>
                </div>
            </div>

            <!-- Row 7: DOB/Gender/Marital -->
            <div style='display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;'>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>DOB:</div>
                    <div id='${frontsheetId}_dob' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>07-04-1991</div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>GENDER:</div>
                    <div id='${frontsheetId}_gender' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>M</div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>MARITAL STATUS:</div>
                    <div id='${frontsheetId}_marital' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>MARRIED</div>
                </div>
            </div>

            <!-- Row 8: Family Details -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>FATHER'S NAME / MOTHER'S NAME / SPOUSE NAME:</div>
                <div id='${frontsheetId}_family' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>MR. RAVINDRAKUMAR TOSHNIVAL</div>
            </div>

            <!-- Row 9: Location Details -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>ENTITY LOCATION :-</div>
                <div style='display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:6px;'>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>AREA:</div>
                        <div id='${frontsheetId}_area' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'>SECTOR-19</div>
                    </div>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>WARD:</div>
                        <div id='${frontsheetId}_ward' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'>VASHI</div>
                    </div>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>ZONE:</div>
                        <div id='${frontsheetId}_zone' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'>NAVI MUMBAI</div>
                    </div>
                </div>
            </div>

            <!-- Row 10: Product/Service -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>PRODUCT / SERVICE SOLD:</div>
                <div id='${frontsheetId}_product' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'>LLC, GMST, FLC, SIGNAGE</div>
            </div>

            <!-- Row 11: Documents -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>DOCUMENTS PYC SUBMITTED:</div>
                <div style='display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;'>
                    <div style='display:flex; gap:10px;'>
                        <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>PAN</span></label>
                        <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>AADHAR</span></label>
                    </div>
                    <div style='display:flex; gap:10px;'>
                        <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>ADDRESS PROOF</span></label>
                        <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>BANK DETAILS</span></label>
                    </div>
                </div>
            </div>

            <!-- Row 12: Photography -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>PHOTOGRAPH / SHOP PHOTO / MDA/COI/AOA/PART. DEED:</div>
                <div style='display:flex; gap:20px; margin-top:6px;'>
                    <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>PHOTOGRAPH</span></label>
                    <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox'> <span style='font-size:10px;'>SHOP PHOTO</span></label>
                    <label style='display:flex; align-items:center; gap:5px;'><input type='checkbox' checked> <span style='font-size:10px;'>MDA/COI/AOA/PART. DEED</span></label>
                </div>
            </div>

            <!-- Row 13: Client Source & Sourced By -->
            <div style='display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;'>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>CLIENT SOURCE:</div>
                    <div id='${frontsheetId}_source' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'></div>
                </div>
                <div style='border:1px solid #000; padding:8px;'>
                    <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>SOURCED BY ALONG WITH EMP. ID:</div>
                    <div id='${frontsheetId}_sourcedby' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:20px;'></div>
                </div>
            </div>

            <!-- Row 14: Comments -->
            <div style='border:1px solid #000; margin-bottom:10px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>COMMENTS/REMARKS/ADDITIONAL INFO:</div>
                <div id='${frontsheetId}_comments' style='padding:6px; border:1px solid #ccc; background:#fff; min-height:30px;'></div>
            </div>

            <!-- Row 15: Other Internal Details -->
            <div style='border:1px solid #000; margin-bottom:15px; padding:8px;'>
                <div style='font-weight:bold; font-size:10px; background:#f0f0f0; padding:4px; margin-bottom:4px;'>OTHER INTERNAL DETAILS:</div>
                <div style='display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px;'>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>LOGIN:</div>
                        <div id='${frontsheetId}_login' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'></div>
                    </div>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>PASSWORD:</div>
                        <div id='${frontsheetId}_password' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'></div>
                    </div>
                </div>
                <div style='margin-top:6px;'>
                    <div style='font-size:9px; font-weight:bold;'>DETAILS:</div>
                    <div id='${frontsheetId}_details' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:40px;'></div>
                </div>
            </div>

            <!-- SIGNATURE SECTION -->
            <div style='border-top:2px solid #0f1445; padding-top:15px; margin-top:15px;'>
                <div style='display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:30px;'>
                    <div style='text-align:center;'>
                        <div style='border-bottom:1px solid #000; height:50px; margin-bottom:8px;'></div>
                        <div style='font-weight:bold; font-size:11px;'>APPLICANT SIGNATURE</div>
                        <div style='font-size:9px; color:#666;'>WITH STAMP / SEAL</div>
                    </div>
                    <div style='text-align:center;'>
                        <div style='border-bottom:1px solid #000; height:50px; margin-bottom:8px;'></div>
                        <div style='font-weight:bold; font-size:11px;'>INVESTICA OFFICER SIGN</div>
                        <div style='font-size:9px; color:#666;'>ALL DOCUMENTS ARE VERIFIED<br />WITH ORIGINAL</div>
                    </div>
                </div>
            </div>

            <!-- DOCUMENT VERIFICATION -->
            <div style='margin-top:20px; padding:10px; background:#f8f9fa; border:1px solid #ddd; border-radius:4px;'>
                <div style='font-weight:bold; font-size:10px; color:#0f1445; margin-bottom:8px;'>DOCUMENT SCANNED, UPLOADED, BACKED UP BY :-</div>
                <div style='display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:8px;'>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>NAME:</div>
                        <div id='${frontsheetId}_docname' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'></div>
                    </div>
                    <div>
                        <div style='font-size:9px; font-weight:bold;'>SIGN:</div>
                        <div id='${frontsheetId}_docsign' style='padding:4px; border:1px solid #ccc; background:#fff; min-height:18px;'></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- BUTTONS -->
        <div style='margin-top:20px; padding:15px; border-top:2px solid #0f1445; display:flex; gap:10px; justify-content:flex-start; background:#f8f9fa;'>
            <button class='btn btn-primary frontsheet-edit-btn' data-frontsheet='${frontsheetId}' style='background:#0f1445; border:none; padding:10px 20px; font-size:13px; font-weight:bold; cursor:pointer;'>Edit Form</button>
            <button class='btn btn-secondary' onclick='window.print()' style='background:#6c757d; border:none; padding:10px 20px; font-size:13px; font-weight:bold; color:#fff; cursor:pointer;'>Print</button>
        </div>
    </div>
    `;
    dashboard.appendChild(card);
    return;
            }

    // Handle single Invoice
    if (tabName.toLowerCase() === 'invoice') {
                const card = document.createElement("div");
    card.className = "card p-4";
    const invoiceId = `invoice_${Date.now()}`;
    card.innerHTML = `
    <div style='background:#fff; padding:30px; font-family:Arial, sans-serif; line-height:1.6; max-width:900px;'>
        <div style='display:flex; justify-content:space-between; margin-bottom:30px; border-bottom:2px solid #0f1445; padding-bottom:15px;'>
            <div>
                <div style='font-size:18px; font-weight:bold; color:#0f1445;'>INVOICE TO:</div>
                <div style='font-size:13px; margin-top:5px; color:#333;'>
                    <div><strong>CUREFOODS INDIA PVT. LTD</strong></div>
                    <div>RAJARKHAT</div>
                    <div>KOLKATA, WEST BENGAL</div>
                    <div style='margin-top:8px;'><strong>GSTIN:</strong> 19AAJCC0315JJZ</div>
                </div>
            </div>
            <div style='text-align:right;'>
                <div style='font-size:18px; font-weight:bold; color:#0f1445;'>INVOICE FROM:</div>
                <div style='font-size:13px; margin-top:5px; color:#333;'>
                    <div><strong>INVESTIRE LEX & AUDIRE (OPC) PVT. LTD.</strong></div>
                    <div>SECTOR-19, VASHI</div>
                    <div>NAVI MUMBAI MAHARASHTRA</div>
                    <div style='margin-top:8px;'><strong>GSTIN:</strong> 27AAGCIT23R1Z</div>
                </div>
            </div>
        </div>

        <div style='text-align:center; margin-bottom:20px;'>
            <div style='font-size:16px; font-weight:bold; color:#0f1445;'>INVOICE NUMBER: KOL/SER/590</div>
            <div style='font-size:12px; color:#666; margin-top:5px;'>Date: 09th June, 2025</div>
        </div>

        <table style='width:100%; border-collapse:collapse; margin-bottom:20px;'>
            <thead>
                <tr style='background:#0f1445; color:#fff;'>
                    <th style='border:1px solid #0f1445; padding:12px; text-align:left; font-weight:bold;'>PARTICULARS</th>
                    <th style='border:1px solid #0f1445; padding:12px; text-align:right; font-weight:bold; width:140px;'>GROSS AMOUNT Rs.</th>
                    <th style='border:1px solid #0f1445; padding:12px; text-align:right; font-weight:bold; width:140px;'>NET AMOUNT Rs.</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style='border:1px solid #ddd; padding:12px;'><strong>BUSINESS COMPLIANCE | SHOPS & FSTB RENEWAL | SERVICE CHARGES | KOLKATA</strong></td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'></td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'></td>
                </tr>
                <tr style='background:#f8f9fa;'>
                    <td style='border:1px solid #ddd; padding:12px;'>BALLYGUNGE | APPROVAL DATE: 06/03/2025</td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'>3500.00</td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'>3500.00</td>
                </tr>
                <tr>
                    <td style='border:1px solid #ddd; padding:12px; font-weight:bold;'>SUB TOTAL</td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'></td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'><strong>3500.00</strong></td>
                </tr>
                <tr style='background:#f8f9fa;'>
                    <td style='border:1px solid #ddd; padding:12px; font-weight:bold;'>IGST 18%</td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'>630.00</td>
                    <td style='border:1px solid #ddd; padding:12px; text-align:right;'>630.00</td>
                </tr>
                <tr style='background:#0f1445; color:#fff;'>
                    <td style='border:1px solid #0f1445; padding:12px; font-weight:bold;'>NET TOTAL: FOUR THOUSAND ONE HUNDRED & THIRTY ONLY.</td>
                    <td style='border:1px solid #0f1445; padding:12px; text-align:right;'></td>
                    <td style='border:1px solid #0f1445; padding:12px; text-align:right; font-weight:bold;'>4130.00</td>
                </tr>
            </tbody>
        </table>

        <div style='margin-top:30px; display:flex; gap:10px; justify-content:flex-start;'>
            <button class='btn btn-primary invoice-edit-btn' data-invoice='${invoiceId}' style='background:#0f1445; border:none; padding:8px 16px; font-size:14px;'>Edit</button>
            <button class='btn btn-secondary' onclick='window.print()' style='background:#6c757d; border:none; padding:8px 16px; font-size:14px; color:#fff;'>Print</button>
        </div>
    </div>
    `;
    dashboard.appendChild(card);
    return;
            }

    // Handle Ticket Details with multiple cards
    for (let i = 0; i < 3; i++) {
                const card = document.createElement("div");
    card.className = "card p-4";
    const cid = `card${i}_${Date.now()}`;
    card.innerHTML = `
    <div class='container-fluid' style='height:100%;'>
        <div class='row g-3' style='height:100%;'>
            <div class='col-md-3' style='display:flex; flex-direction:column; height:100%;'>
                <div>
                    <div id='${cid}_status' class='rounded border p-2 text-center fw-bold mb-3'>STATUS</div>
                    <div id='${cid}_license' class='rounded border p-2 text-center fw-bold mb-3'>License Type</div>
                    <div id='${cid}_tracking' class='rounded border p-2 text-center fw-bold mb-3'>Tracking No</div>
                </div>
                <div style='margin-top:auto;'>
                    <div class='d-flex' style='gap:8px;'>
                        <button class='btn btn-outline-dark btn-sm rounded-pill' style='min-width:70px; padding:6px 10px; font-size:0.9rem;'>More</button>
                        <button class='btn btn-outline-dark btn-sm rounded-pill edit-btn' data-card='${cid}' style='min-width:70px; padding:6px 10px; font-size:0.9rem;'>Edit</button>
                        <button class='btn btn-outline-dark btn-sm rounded-pill' style='min-width:70px; padding:6px 10px; font-size:0.9rem;'>Attachments</button>
                    </div>
                </div>
            </div>
            <div class='col-md-5'>
                <div id='${cid}_company' class='rounded border p-2 text-center fw-bold mb-3'>Company Name</div>
                <div id='${cid}_address' class='rounded border p-3 fw-bold mb-3'>Address of company/stores</div>
                <div>
                    <label class='fw-bold mb-2' style='font-size: 0.9em;'>Add Note</label>
                    <textarea id='${cid}_noteInput' class='form-control mb-2' rows='2' placeholder='Enter your note here...' style='font-size: 0.85em;'></textarea>
                    <button class='btn btn-sm btn-primary w-100 mb-2' id='${cid}_noteBtn' style='background:#0f1445; border:none;'>Add Note</button>
                    <div id='${cid}_notes' class='rounded border p-2' style='background:#f8f9fa; max-height: 100px; overflow-y: auto; min-height: 60px;'>
                        <small style='color: #666;'>Notes will appear here</small>
                    </div>
                </div>
            </div>
            <div class='col-md-4' style='display:flex; flex-direction:column; height:100%;'>
                <div id='${cid}_employee' class='rounded border p-2 text-center fw-bold mb-3'>Employee Name - Date</div>
                <div id='${cid}_validity' class='rounded border p-2 text-center fw-bold mb-3'>Date of Validity</div>
                <div id='${cid}_desc' class='rounded border p-3 fw-bold' style='flex:1; min-height:245px; white-space:pre-line; overflow-y:auto; background:#f8f9fa;'>Description</div>
            </div>
        </div>
    </div>
    `;
    dashboard.appendChild(card);
            }

    // Frontsheet edit functionality
    if (tabName.toLowerCase() === 'frontsheet') {
        setTimeout(() => {
            const frontsheetEditBtn = document.querySelector('.frontsheet-edit-btn');
            if (frontsheetEditBtn) {
                frontsheetEditBtn.addEventListener('click', function () {
                    const frontsheetId = this.getAttribute('data-frontsheet');
                    const isEditing = this.textContent.includes('Save');

                    const fieldIds = [
                        `${frontsheetId}_name`, `${frontsheetId}_address`, `${frontsheetId}_phone`,
                        `${frontsheetId}_email`, `${frontsheetId}_director`, `${frontsheetId}_entitytype`,
                        `${frontsheetId}_pan`, `${frontsheetId}_business`, `${frontsheetId}_epan`,
                        `${frontsheetId}_dob`, `${frontsheetId}_gender`, `${frontsheetId}_marital`,
                        `${frontsheetId}_family`, `${frontsheetId}_area`, `${frontsheetId}_ward`,
                        `${frontsheetId}_zone`, `${frontsheetId}_product`, `${frontsheetId}_source`,
                        `${frontsheetId}_sourcedby`, `${frontsheetId}_comments`, `${frontsheetId}_login`,
                        `${frontsheetId}_password`, `${frontsheetId}_details`, `${frontsheetId}_docname`,
                        `${frontsheetId}_docsign`
                    ];

                    if (!isEditing) {
                        this._prevVals = {};
                        fieldIds.forEach(fid => {
                            const el = document.getElementById(fid);
                            if (el) {
                                const val = el.innerText.replace(/\n/g, ' ');
                                this._prevVals[fid] = val;
                                el.innerHTML = `<input class='form-control' value='${val.replace(/'/g, "&apos;")}' style='padding:6px; border:1px solid #999;'>`;
                                el.style.padding = '0';
                            }
                        });
                        this.textContent = 'Save Form';
                        this.style.background = '#28a745';
                    } else {
                        fieldIds.forEach(fid => {
                            const el = document.getElementById(fid);
                            if (el && el.querySelector('input')) {
                                const val = el.querySelector('input').value;
                                el.innerHTML = val;
                                el.style.padding = '6px';
                            }
                        });
                        this.textContent = 'Edit Form';
                        this.style.background = '#0f1445';
                    }
                });
            }
        }, 150);
            }

    // Edit and note functionality
    if (tabName === 'TICKETS') {
        setTimeout(() => {
            const editBtns = dashboard.querySelectorAll('.edit-btn');
            editBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const cid = btn.getAttribute('data-card');
                    const isEditing = btn.textContent === 'Save';
                    const fields = [
                        { id: `${cid}_status`, label: 'STATUS' },
                        { id: `${cid}_license`, label: 'License Type' },
                        { id: `${cid}_tracking`, label: 'Tracking No' },
                        { id: `${cid}_company`, label: 'Company Name' },
                        { id: `${cid}_address`, label: 'Address' },
                        { id: `${cid}_employee`, label: 'Employee Name' },
                        { id: `${cid}_validity`, label: 'Validity' },
                        { id: `${cid}_desc`, label: 'Description' }
                    ];

                    if (!isEditing) {
                        btn._prevVals = {};
                        fields.forEach(f => {
                            const el = document.getElementById(f.id);
                            let val = el.innerText.replace(/\n/g, ' ');
                            btn._prevVals[f.id] = val;
                            if (f.id.endsWith('_desc') || f.id.endsWith('_address')) {
                                el.innerHTML = `<textarea class='form-control' rows='3'>${val}</textarea>`;
                            } else {
                                el.innerHTML = `<input class='form-control' value='${val}'>`;
                            }
                        });
                        btn.textContent = 'Save';
                    } else {
                        fields.forEach(f => {
                            const el = document.getElementById(f.id);
                            let val;
                            if (f.id.endsWith('_desc') || f.id.endsWith('_address')) {
                                val = el.querySelector('textarea').value;
                                el.innerHTML = val.replace(/\n/g, '<br>');
                            } else {
                                val = el.querySelector('input').value;
                                el.innerHTML = val;
                            }
                        });
                        btn.textContent = 'Edit';
                    }
                });
            });

            // Note functionality
            const noteButtons = dashboard.querySelectorAll('[id$="_noteBtn"]');
            noteButtons.forEach(noteBtn => {
                noteBtn.addEventListener('click', function () {
                    const cid = noteBtn.id.replace('_noteBtn', '');
                    const noteInput = document.getElementById(`${cid}_noteInput`);
                    const notesContainer = document.getElementById(`${cid}_notes`);
                    const noteText = noteInput.value.trim();

                    if (noteText) {
                        const now = new Date();
                        const timeStr = now.toLocaleString();
                        const noteHtml = document.createElement('div');
                        noteHtml.style.cssText = 'border-bottom: 1px solid #ddd; padding: 8px 0; font-size: 0.85em; line-height: 1.4;';
                        noteHtml.innerHTML = `<strong style='color: #0f1445;'>${timeStr}</strong><br><span style='color: #333;'>${noteText.replace(/\n/g, '<br>')}</span>`;

                        if (notesContainer.innerHTML.includes('Notes will appear here')) {
                            notesContainer.innerHTML = '';
                        }

                        notesContainer.insertBefore(noteHtml, notesContainer.firstChild);
                        noteInput.value = '';
                    }
                });
            });
        }, 150);
            }
        }

        // Unified tab click handling that maps wizard tabs to wizard pages when wizard is active
        tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const prev = document.querySelector('.tab.active');
            if (prev) prev.classList.remove('active');

            this.classList.add('active');
            const tabName = this.textContent.trim();

            const rightPanel = document.querySelector('.right-panel');
            const tabsBar = document.querySelector('.tabs');
            const wizardActive = rightPanel.classList.contains('wizard-active');

            // If wizard active -> interpret tabs as wizard steps
            if (wizardActive) {
                if (tabName === 'Dashboard') {
                    // go back to dashboard view
                    showPage(0);
                    return;
                }
                if (tabName === 'Companies') {
                    showPage(2); // Company Info page
                    return;
                }
                // Accept the new wizard label
                if (tabName === 'Frontsheet & Invoice' || tabName === 'Frontsheet / Invoice' || tabName.indexOf('Frontsheet') === 0) {
                    showPage(3); // Frontsheet & Invoice Details page
                    return;
                }
                if (tabName === 'Summary') {
                    showPage(4); // Summary page
                    return;
                }
                // fallthrough to default if label doesn't match
            }

            // Non-wizard behavior (original)
            document.getElementById('frontsheetFilters').style.display = (tabName === 'Frontsheet') ? '' : 'none';
            document.getElementById('invoiceFilters').style.display = (tabName === 'Invoice') ? '' : 'none';
            document.getElementById('detailsFilters').style.display = (tabName === 'TICKETS') ? '' : 'none';
            document.getElementById('applyResetFilters').style.display = ((tabName === 'Links') || (tabName === 'Renewals') || (tabName === 'Dashboard') || (tabName === 'Master Data')) ? 'none' : '';

            const leftPanelHiddenTabs = ['Links', 'Renewals', 'Dashboard', 'Master Data'];
            document.querySelector('.left-panel').style.display = leftPanelHiddenTabs.includes(tabName) ? 'none' : '';

            if (leftPanelHiddenTabs.includes(tabName)) {
                rightPanel.classList.add('full-width');
                tabsBar.classList.add('full-width');
            } else {
                rightPanel.classList.remove('full-width');
                tabsBar.classList.remove('full-width');
            }

            showEmptyCards(tabName);
        });
        });

    // Filter button functionality
    const submitBtn = document.getElementById('submitFilterBtn');
    const clearBtn = document.getElementById('clearFilterBtn');

    submitBtn.addEventListener('click', function () {
            const frontsheetCompany = document.getElementById('frontsheetCompany').value;
    const frontsheetDate = document.getElementById('frontsheetDate').value;
    const frontsheetLocation = document.getElementById('frontsheetLocation').value;
    console.log('Filters submitted:', {company: frontsheetCompany, date: frontsheetDate, location: frontsheetLocation });
    alert('Filters Applied!\nCompany: ' + (frontsheetCompany || 'All') + '\nDate: ' + (frontsheetDate || 'All') + '\nLocation: ' + (frontsheetLocation || 'All'));
        });

    clearBtn.addEventListener('click', function () {
        document.getElementById('frontsheetCompany').value = '';
    document.getElementById('frontsheetDate').value = '';
    document.getElementById('frontsheetLocation').value = '';
    document.getElementById('invoiceDate').value = '';
    document.getElementById('invoiceNumber').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('companyName').value = '';
    document.getElementById('location').value = '';
    document.getElementById('licenseType').value = '';
    document.getElementById('status').value = '';
    document.getElementById('trackingNumber').value = '';
    console.log('All filters cleared');
        });

    document.getElementById('invoiceFilters').style.display = 'none';
    document.getElementById('frontsheetFilters').style.display = 'none';
    document.getElementById('detailsFilters').style.display = '';

    // Apply UI state (filters, left-panel visibility, full-width) for a tab name
    function applyTabState(tabName) {
        document.getElementById('frontsheetFilters').style.display = (tabName === 'Frontsheet') ? '' : 'none';
    document.getElementById('invoiceFilters').style.display = (tabName === 'Invoice') ? '' : 'none';
    document.getElementById('detailsFilters').style.display = (tabName === 'TICKETS') ? '' : 'none';

    const hideLeftFor = ['Links', 'Renewals', 'Dashboard', 'Master Data'];
    document.getElementById('applyResetFilters').style.display = (hideLeftFor.includes(tabName)) ? 'none' : '';
    document.querySelector('.left-panel').style.display = hideLeftFor.includes(tabName) ? 'none' : '';

    const rightPanel = document.querySelector('.right-panel');
    const tabsBar = document.querySelector('.tabs');
    if (hideLeftFor.includes(tabName)) {
        rightPanel.classList.add('full-width');
    tabsBar.classList.add('full-width');
            } else {
        rightPanel.classList.remove('full-width');
    tabsBar.classList.remove('full-width');
            }
        }

    // Determine initial tab from the DOM (the one with .tab.active). If none, default to "Dashboard".
    const initialTabEl = document.querySelector('.tab.active');
    const initialTab = initialTabEl ? initialTabEl.textContent.trim() : 'Dashboard';

    // Apply UI state and render corresponding view on load
    applyTabState(initialTab);
    showEmptyCards(initialTab);

    // Wizard helpers (pages use data-page values: 2,3,4)
    const pages = document.querySelectorAll('.page');
    function showPage(index) {
            // pages NodeList is available
            const rightPanel = document.querySelector('.right-panel');

    // index === 0 -> restore dashboard view
    if (index === 0) {
        // hide wizard pages
        pages.forEach(p => p.classList.remove('active'));
    // show dashboard content (do not recreate it; use current view logic)
    dashboard.style.display = '';
    // mark tabs and layout back to dashboard state
    rightPanel.classList.remove('wizard-active');
    // restore original tab labels and visibility
    restoreOriginalTabs();

    const currentActiveTab = document.querySelector('.tab.active');
    if (currentActiveTab) currentActiveTab.classList.remove('active');
                const dashTab = Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim().toLowerCase() === 'dashboard');
    if (dashTab) dashTab.classList.add('active');
    applyTabState('Dashboard');
    showEmptyCards('Dashboard');
    return;
            }

    // If starting the wizard (clicked Next on Dashboard -> page 2), swap tabs immediately
    if (String(index) === '2') {
        // Change tabs now so user sees wizard-oriented tabs when entering Company Info
        replaceTabsLabels(['Dashboard', 'Companies', 'Frontsheet & Invoice', 'Summary'], 'Companies');

    // Hide left panel and expand right panel for wizard flow
    document.querySelector('.left-panel').style.display = 'none';
    document.querySelector('.right-panel').classList.add('full-width');
    document.querySelector('.tabs').classList.add('full-width');

    // mark wizard-active so CSS keeps tabs above pages
    rightPanel.classList.add('wizard-active');
            }

            // Showing a wizard page: hide dashboard but keep DOM and event handlers intact
            pages.forEach(p => {
                if (String(p.dataset.page) === String(index)) p.classList.add('active');
    else p.classList.remove('active');
            });

    // hide dashboard visually (don't remove its content)
    dashboard.style.display = 'none';

            // Ensure tab selection reflects current wizard page.
            // Clear any active classes first and then set the correct one for the page.
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    if (String(index) === '2') {
                const companiesTab = Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim() === 'Companies');
    if (companiesTab) companiesTab.classList.add('active');
            } else if (String(index) === '3') {
                const licenseTab = Array.from(document.querySelectorAll('.tab')).find(t => {
                    const txt = t.textContent.trim();
    return txt === 'Frontsheet & Invoice' || txt === 'Frontsheet / Invoice' || txt.indexOf('Frontsheet') === 0;
                });
    if (licenseTab) licenseTab.classList.add('active');
    // populate page 3 display fields whenever page 3 is shown
    setTimeout(populateFrontsheetInvoiceFields, 0);
            } else if (String(index) === '4') {
                const summaryTab = Array.from(document.querySelectorAll('.tab')).find(t => t.textContent.trim() === 'Summary');
    if (summaryTab) summaryTab.classList.add('active');
            }
        }
    function goDashboard() {
        showPage(0);
        }

    function goToTickets() {
            const rightPanel = document.querySelector('.right-panel');

    // If wizard active, restore original tabs/layout first
    if (rightPanel.classList.contains('wizard-active')) {
        rightPanel.classList.remove('wizard-active');
    restoreOriginalTabs();
            }

            // Ensure any wizard pages are hidden and dashboard area is visible
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    dashboard.style.display = ''; // make sure dashboard container is shown

            // Clear any existing .active and set TICKETS tab active
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const ticketsTab = Array.from(document.querySelectorAll('.tab'))
                .find(t => t.textContent.trim().toUpperCase() === 'TICKETS');

    // Apply UI state and render tickets view
    if (ticketsTab) {
        ticketsTab.classList.add('active');
            }
    applyTabState('TICKETS');
    showEmptyCards('TICKETS');
        }

    // New: populate display-only fields in Page 3 (Frontsheet & Invoice) from available sources
    function populateFrontsheetInvoiceFields() {
            // prefer left-panel companyName if provided
            const leftCompany = (document.getElementById('companyName') && document.getElementById('companyName').value) ? document.getElementById('companyName').value.trim() : '';
    const company = leftCompany || ''; // fallback empty

    // address comes from company info textarea on page 2 (id 'address')
    const addressEl = document.getElementById('address');
    const address = addressEl ? (addressEl.value || '').trim() : '';

    // license and status from page 2 selects (companyLicenseType, companyStatus)
    const licenseEl = document.getElementById('companyLicenseType');
    const statusEl = document.getElementById('companyStatus');
    const license = licenseEl ? (licenseEl.value || licenseEl.options[licenseEl.selectedIndex]?.text || '') : '';
    const status = statusEl ? (statusEl.value || statusEl.options[statusEl.selectedIndex]?.text || '') : '';

    // contact/email - try left-panel filters (frontsheetPhone not present) -> fallback blank
    const phone = (document.getElementById('frontsheetLocation') && document.getElementById('frontsheetLocation').value) ? '' : ''; // no direct phone field in left-panel
    const email = ''; // no reliable source in current wizard UI

    // GSTIN / PAN / entity / product - try to read from masterData.Companies first (if stored with extra fields)
    let gstin = '';
    let pan = '';
    let entityType = '';
    let product = '';
    let locationText = '';

            // If masterData.Companies contains richer objects, try to fetch first company matching name
            if (masterData && Array.isArray(masterData.Companies) && masterData.Companies.length > 0) {
        // attempt match by name
        let match = null;
    if (company) {
        match = masterData.Companies.find(c => (c.name || '').toLowerCase() === company.toLowerCase());
                }
    // fallback to first company if no match
    match = match || masterData.Companies[0];
    if (match) {
        // support optional fields if present
        gstin = match.gstin || match.GSTIN || '';
    pan = match.pan || match.PAN || '';
    entityType = match.entityType || '';
    product = match.product || match.services || '';
    locationText = match.location || '';
                }
            }

            // populate display fields (page 3)
            const setText = (id, txt) => {
                const el = document.getElementById(id);
    if (el) el.textContent = txt || '—';
            };

    setText('fs_company', company || (leftCompany ? leftCompany : '—'));
    setText('fs_address', address || '—');
    setText('fs_phone', phone || '—');
    setText('fs_email', email || '—');
    setText('fs_gstin', gstin || '—');
    setText('fs_pan', pan || '—');
    setText('fs_entity', entityType || '—');
    setText('fs_product', product || '—');
    setText('fs_location', locationText || '—');
    setText('fs_license', license || '—');
    setText('fs_status', status || '—');

    // also set summary values so Next (Summary) is prefilled
    document.getElementById('sCompany').textContent = company || '';
    document.getElementById('sAddress').textContent = address || '';
    document.getElementById('sLicense').textContent = license || '';
    document.getElementById('sStatus').textContent = status || '';

            // pick an employee if available in masterData.Employees
            const emp = (masterData && Array.isArray(masterData.Employees) && masterData.Employees.length > 0) ? masterData.Employees[0].name : '';
    document.getElementById('fs_employee')?.textContent && (document.getElementById('fs_employee').textContent = emp || '—');
    document.getElementById('sEmployee').textContent = emp || '';
        }

    function fillSummary() {
            // gather values from company / license pages and page 3 display values
            const company = (document.getElementById('fs_company') && document.getElementById('fs_company').textContent) ? document.getElementById('fs_company').textContent : (document.getElementById('companyName') ? document.getElementById('companyName').value : '');
    const address = (document.getElementById('fs_address') && document.getElementById('fs_address').textContent) ? document.getElementById('fs_address').textContent : (document.getElementById('address') ? document.getElementById('address').value : '');
    const license = (document.getElementById('fs_license') && document.getElementById('fs_license').textContent) ? document.getElementById('fs_license').textContent : (document.getElementById('companyLicenseType') ? (document.getElementById('companyLicenseType').value || document.getElementById('companyLicenseType').options[document.getElementById('companyLicenseType').selectedIndex]?.text) : '');
    const status = (document.getElementById('fs_status') && document.getElementById('fs_status').textContent) ? document.getElementById('fs_status').textContent : (document.getElementById('companyStatus') ? (document.getElementById('companyStatus').value || document.getElementById('companyStatus').options[document.getElementById('companyStatus').selectedIndex]?.text) : '');
    const employee = (document.getElementById('sEmployee') && document.getElementById('sEmployee').textContent) ? document.getElementById('sEmployee').textContent : ((masterData && masterData.Employees && masterData.Employees[0]) ? masterData.Employees[0].name : '');

    document.getElementById('sCompany').textContent = company || '';
    document.getElementById('sAddress').textContent = address || '';
    document.getElementById('sLicense').textContent = license || '';
    document.getElementById('sStatus').textContent = status || '';
    document.getElementById('sEmployee').textContent = employee || '';
        }
