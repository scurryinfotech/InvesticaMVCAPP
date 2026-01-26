/* MasterData.js
   Shows role names in the UI while backend works with role IDs.
   Uses /roles to populate a role dropdown and a role-id -> name map.
*/

(() => {
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const showAlert = (msg, type = 'success') => {
        const el = document.createElement('div');
        el.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        el.style.zIndex = 1080;
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    };

    const API = {
        employees: '/employees',
        companies: '/companies',
        licenses: '/licensetypes',
        statuses: '/statuses',
        roles: '/roles' // NEW
    };

    const tblEmployees = qs('#tblEmployees tbody');
    const tblCompanies = qs('#tblCompanies tbody');
    const tblLicenses = qs('#tblLicenses tbody');
    const tblStatuses = qs('#tblStatuses tbody');

    const counts = {
        employees: qs('#count-employees'),
        companies: qs('#count-companies'),
        licenses: qs('#count-licenses'),
        statuses: qs('#count-statuses')
    };

    const modalEl = qs('#masterModal');
    let modal;
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.bootstrap) {
            console.warn('Bootstrap not found. Modal functionality may not work.');
        } else {
            modal = new bootstrap.Modal(modalEl);
        }
    });

    const modalTitle = qs('#modalTitle');
    const modalBodyContent = qs('#modalBodyContent');
    const masterForm = qs('#masterForm');

    // Roles cache
    let roles = [];
    let rolesMap = {}; // id -> name

    async function loadRoles() {
        const res = await fetch(API.roles);
        const data = await res.json();
        roles = Array.isArray(data) ? data : [];
        rolesMap = {};
        roles.forEach(r => rolesMap[r.id] = r.name);
    }

    async function loadEmployees() {
        const res = await fetch(API.employees);
        const data = await res.json();
        renderTable(tblEmployees, data, 'employee');
        counts.employees.textContent = data.length;
    }

    async function loadCompanies() {
        const res = await fetch(API.companies);
        const data = await res.json();
        renderTable(tblCompanies, data, 'company');
        counts.companies.textContent = data.length;
    }

    async function loadLicenses() {
        const res = await fetch(API.licenses);
        const data = await res.json();
        renderTable(tblLicenses, data, 'license');
        counts.licenses.textContent = data.length;
    }

    async function loadStatuses() {
        const res = await fetch(API.statuses);
        const data = await res.json();
        renderTable(tblStatuses, data, 'status');
        counts.statuses.textContent = data.length;
    }

    function renderTable(tbody, items, type) {
        tbody.innerHTML = '';
        items.forEach((it, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = getRowHtml(it, idx + 1, type);
            tbody.appendChild(tr);

            const btnEdit = tr.querySelector('.btn-edit');
            const btnDel = tr.querySelector('.btn-delete');
            if (btnEdit) btnEdit.addEventListener('click', () => openEdit(type, it.id));
            if (btnDel) btnDel.addEventListener('click', () => confirmDelete(type, it.id));
        });
    }

    function getRowHtml(item, index, type) {
        switch (type) {
            case 'employee':
                // show role name via rolesMap, fall back to id if missing
                const roleLabel = rolesMap[item.role] ?? item.role ?? '';
                return `
                    <td>${index}</td>
                    <td>${escapeHtml(item.name || '')}</td>
                    <td>${escapeHtml(item.email || '')}</td>
                    <td>${escapeHtml(roleLabel)}</td>
                    <td>${item.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete ms-1">Delete</button>
                    </td>`;
            case 'company':
                return `
                    <td>${index}</td>
                    <td>${escapeHtml(item.companyName || '')}</td>
                    <td>${item.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete ms-1">Delete</button>
                    </td>`;
            case 'license':
                return `
                    <td>${index}</td>
                    <td>${escapeHtml(item.appTypeName || '')}</td>
                    <td>${item.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete ms-1">Delete</button>
                    </td>`;
            case 'status':
                return `
                    <td>${index}</td>
                    <td>${escapeHtml(item.statusName || '')}</td>
                    <td>${item.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete ms-1">Delete</button>
                    </td>`;
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        return s.toString().replace(/[&<>"'`=\/]/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            }[c];
        });
    }

    qs('#btnAddEmployee').addEventListener('click', () => openCreate('employee'));
    qs('#btnAddCompany').addEventListener('click', () => openCreate('company'));
    qs('#btnAddLicense').addEventListener('click', () => openCreate('license'));
    qs('#btnAddStatus').addEventListener('click', () => openCreate('status'));

    qs('#searchEmployees').addEventListener('input', e => filterTable(tblEmployees, e.target.value));
    qs('#searchCompanies').addEventListener('input', e => filterTable(tblCompanies, e.target.value));
    qs('#searchLicenses').addEventListener('input', e => filterTable(tblLicenses, e.target.value));
    qs('#searchStatuses').addEventListener('input', e => filterTable(tblStatuses, e.target.value));

    function filterTable(tbody, term) {
        term = (term || '').toLowerCase();
        qsa('tr', tbody).forEach(tr => {
            const text = tr.textContent.toLowerCase();
            tr.style.display = text.indexOf(term) >= 0 ? '' : 'none';
        });
    }

    function openCreate(type) {
        qs('#entityType').value = type;
        qs('#entityId').value = '';
        modalTitle.textContent = `Add ${capitalize(type)}`;
        modalBodyContent.innerHTML = getFormHtml(type, {});
        modal?.show();
    }

    async function openEdit(type, id) {
        try {
            const res = await fetch(getApiForType(type) + '/' + id);
            if (!res.ok) throw new Error('Failed to load item');
            const data = await res.json();
            qs('#entityType').value = type;
            qs('#entityId').value = data.id;
            modalTitle.textContent = `Edit ${capitalize(type)}`;
            modalBodyContent.innerHTML = getFormHtml(type, data);
            modal?.show();
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    }

    function confirmDelete(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        deleteEntity(type, id);
    }

    async function deleteEntity(type, id) {
        try {
            const url = getApiForType(type) + '/' + id;
            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showAlert('Deleted', 'success');
            await reloadAll();
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    }

    masterForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const type = qs('#entityType').value;
        const id = qs('#entityId').value;
        const formData = new FormData(masterForm);
        const obj = {};
        for (const [k, v] of formData.entries()) obj[k] = v === 'on' ? true : v;

        // convert checkbox and numeric role
        if (formData.has('isActive')) obj.isActive = (formData.get('isActive') === 'on' || formData.get('isActive') === 'true');
        if (obj.role !== undefined) obj.role = parseInt(obj.role, 10) || 0;

        try {
            if (id) {
                const res = await fetch(getApiForType(type) + '/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(obj)
                });
                if (!res.ok) throw new Error('Update failed');
                showAlert('Updated', 'success');
            } else {
                const res = await fetch(getApiForType(type), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(obj)
                });
                if (!res.ok) throw new Error('Create failed');
                showAlert('Created', 'success');
            }
            modal?.hide();
            await reloadAll();
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    });

    function getApiForType(type) {
        switch (type) {
            case 'employee': return API.employees;
            case 'company': return API.companies;
            case 'license': return API.licenses;
            case 'status': return API.statuses;
            default: throw new Error('Unknown type');
        }
    }

    function getFormHtml(type, data) {
        data = data || {};
        switch (type) {
            case 'employee':
                // build role select using roles[]; value is role id but UI shows role name
                const roleOptions = roles.map(r => `<option value="${r.id}" ${r.id === data.role ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('');
                return `
                <input type="hidden" name="unikey" value="${escapeHtml(data.unikey || '')}" />
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input name="name" class="form-control" value="${escapeHtml(data.name || '')}" required />
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input name="email" type="email" class="form-control" value="${escapeHtml(data.email || '')}" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select name="role" class="form-select">
                        <option value="">-- Select role --</option>
                        ${roleOptions}
                    </select>
                </div>
                <div class="form-check">
                    <input name="isActive" class="form-check-input" type="checkbox" id="isActive" ${data.isActive ? 'checked' : ''}>
                    <label class="form-check-label" for="isActive">Is Active</label>
                </div>`;
            case 'company':
                return `
                <input type="hidden" name="unikey" value="${escapeHtml(data.unikey || '')}" />
                <div class="mb-3">
                    <label class="form-label">Company Name</label>
                    <input name="companyName" class="form-control" value="${escapeHtml(data.companyName || '')}" required />
                </div>
                <div class="mb-3">
                    <label class="form-label">Document Id</label>
                    <input name="documentId" type="number" class="form-control" value="${data.documentId ?? ''}" />
                </div>
                <div class="form-check">
                    <input name="isActive" class="form-check-input" type="checkbox" ${data.isActive ? 'checked' : ''}>
                    <label class="form-check-label">Is Active</label>
                </div>`;
            case 'license':
                return `
                <input type="hidden" name="unikey" value="${escapeHtml(data.unikey || '')}" />
                <div class="mb-3">
                    <label class="form-label">App Type Name</label>
                    <input name="appTypeName" class="form-control" value="${escapeHtml(data.appTypeName || '')}" required />
                </div>
                <div class="form-check">
                    <input name="isActive" class="form-check-input" type="checkbox" ${data.isActive ? 'checked' : ''}>
                    <label class="form-check-label">Is Active</label>
                </div>`;
            case 'status':
                return `
                <input type="hidden" name="unikey" value="${escapeHtml(data.unikey || '')}" />
                <div class="mb-3">
                    <label class="form-label">Status Name</label>
                    <input name="statusName" class="form-control" value="${escapeHtml(data.statusName || '')}" required />
                </div>
                <div class="form-check">
                    <input name="isActive" class="form-check-input" type="checkbox" ${data.isActive ? 'checked' : ''}>
                    <label class="form-check-label">Is Active</label>
                </div>`;
            default:
                return '<div>Unknown form</div>';
        }
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    async function reloadAll() {
        // roles must be loaded before employees so we can map role id -> name
        await loadRoles();
        await Promise.all([loadEmployees(), loadCompanies(), loadLicenses(), loadStatuses()]);
    }

    document.addEventListener('DOMContentLoaded', reloadAll);
})();