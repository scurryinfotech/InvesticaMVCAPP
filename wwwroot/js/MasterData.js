/* MasterData.js - jQuery/AJAX version (clean, entitytype added) */

$(document).ready(function () {
    'use strict';

    let roles = [];
    let rolesMap = {};
    let modal = new bootstrap.Modal('#masterModal');

    bindEvents();
    reloadAll();

    function bindEvents() {
        $('#btnAddEmployee').on('click', () => openCreate('employee'));
        $('#btnAddCompany').on('click', () => openCreate('company'));
        $('#btnAddLicense').on('click', () => openCreate('license'));
        $('#btnAddStatus').on('click', () => openCreate('status'));
        $('#btnAddEntityType').on('click', () => openCreate('entitytype'));

        $('#searchEmployees').on('input', () => filterTable('#tblEmployees tbody', $('#searchEmployees').val()));
        $('#searchCompanies').on('input', () => filterTable('#tblCompanies tbody', $('#searchCompanies').val()));
        $('#searchLicenses').on('input', () => filterTable('#tblLicenses tbody', $('#searchLicenses').val()));
        $('#searchStatuses').on('input', () => filterTable('#tblStatuses tbody', $('#searchStatuses').val()));
        $('#searchEntityTypes').on('input', () => filterTable('#tblEntityTypes tbody', $('#searchEntityTypes').val()));

        $('#masterForm').on('submit', handleFormSubmit);
    }

    function loadRoles() {
        return $.ajax({
            url: '/roles',
            method: 'GET'
        }).done(function (data) {
            var items = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            roles = items;
            rolesMap = {};
            $.each(roles, function (i, r) { rolesMap[r.id || r.Id] = r.name || r.Name; });
        }).fail(function () { showAlert('Failed to load roles', 'danger'); });
    }

    function loadEmployees() {
        $.ajax({ url: '/employees', method: 'GET' })
            .done(function (data) { var items = Array.isArray(data) ? data : (data && data.data ? data.data : []); renderTable('#tblEmployees tbody', items, 'employee'); $('#count-employees').text(items.length); })
            .fail(function () { showAlert('Failed to load employees', 'danger'); });
    }

    function loadCompanies() {
        $.ajax({ url: '/companies', method: 'GET' })
            .done(function (data) { var items = Array.isArray(data) ? data : (data && data.data ? data.data : []); renderTable('#tblCompanies tbody', items, 'company'); $('#count-companies').text(items.length); })
            .fail(function () { showAlert('Failed to load companies', 'danger'); });
    }

    function loadLicenses() {
        $.ajax({ url: '/licensetypes', method: 'GET' })
            .done(function (data) { var items = Array.isArray(data) ? data : (data && data.data ? data.data : []); renderTable('#tblLicenses tbody', items, 'license'); $('#count-licenses').text(items.length); })
            .fail(function () { showAlert('Failed to load licenses', 'danger'); });
    }

    function loadStatuses() {
        $.ajax({ url: '/statuses', method: 'GET' })
            .done(function (data) { var items = Array.isArray(data) ? data : (data && data.data ? data.data : []); renderTable('#tblStatuses tbody', items, 'status'); $('#count-statuses').text(items.length); })
            .fail(function () { showAlert('Failed to load statuses', 'danger'); });
    }

    function loadEntityTypes() {
        $.ajax({ url: '/entity', method: 'GET' })
            .done(function (data) {
                var items = Array.isArray(data) ? data : (data && data.data ? data.data : []);
                renderTable('#tblEntityTypes tbody', items, 'entitytype');
                $('#count-entitytypes').text(items.length);
            })
            .fail(function () { showAlert('Failed to load entity types', 'danger'); });
    }

    function renderTable(selector, items, type) {
        var $tbody = $(selector);
        $tbody.empty();
        items = items || [];
        $.each(items, function (idx, item) {
            var html = getRowHtml(item, idx + 1, type);
            var $tr = $('<tr>').html(html);

            $tr.find('.btn-edit').on('click', function () {
                const eid = item.id ?? item.Id;
                openEdit(type, eid);
            });
            $tr.find('.btn-delete').on('click', function () {
                const eid = item.id ?? item.Id;
                confirmDelete(type, eid);
            });

            $tbody.append($tr);
        });
    }

    function getRowHtml(item, index, type) {
        var actions = '<button class="btn btn-sm btn-primary btn-edit">Edit</button>' +
            '<button class="btn btn-sm btn-danger btn-delete ms-1">Delete</button>';

        if (type === 'employee') {
            var roleLabel = rolesMap[item.role] || rolesMap[item.Role] || item.role || item.Role || '';
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.name || item.Name || '') + '</td>' +
                '<td>' + escapeHtml(item.email || item.Email || '') + '</td>' +
                '<td>' + escapeHtml(roleLabel) + '</td>' +
                '<td>' + ((item.isActive || item.IsActive) ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        } else if (type === 'company') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.companyName || item.CompanyName || '') + '</td>' +
                '<td>' + ((item.isActive || item.IsActive) ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        } else if (type === 'license') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.appTypeName || item.AppTypeName || '') + '</td>' +
                '<td>' + ((item.isActive || item.IsActive) ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        } else if (type === 'status') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.statusName || item.StatusName || '') + '</td>' +
                '<td>' + ((item.isActive || item.IsActive) ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        } else if (type === 'entitytype') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.name || item.Name || '') + '</td>' +
                '<td>' + ((item.isActive || item.IsActive) ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        } else {
            return '<td colspan="4">Unknown type</td>';
        }
    }

    function filterTable(selector, term) {
        term = (term || '').toLowerCase();
        $(selector).find('tr').each(function () {
            var text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(term) >= 0);
        });
    }

    function openCreate(type) {
        $('#entityType').val(type);
        $('#entityId').val('');
        $('#modalTitle').text('Add ' + capitalize(type));
        $('#modalBodyContent').html(getFormHtml(type, {}));
        modal.show();
    }

    function openEdit(type, id) {
        var url = '/';
        if (type === 'employee') url = '/employees/' + id;
        else if (type === 'company') url = '/companies/' + id;
        else if (type === 'license') url = '/licensetypes/' + id;
        else if (type === 'status') url = '/statuses/' + id;
        else if (type === 'entitytype') url = '/entitytypes/' + id;

        $.ajax({ url: url, method: 'GET' })
            .done(function (data) {
                var item = Array.isArray(data) ? data[0] : (data && data.data ? data.data : data);
                $('#entityType').val(type);
                $('#entityId').val(item.id ?? item.Id);
                $('#modalTitle').text('Edit ' + capitalize(type));
                $('#modalBodyContent').html(getFormHtml(type, item));
                modal.show();
            })
            .fail(function () { showAlert('Failed to load item', 'danger'); });
    }

    function confirmDelete(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        deleteEntity(type, id);
    }

    function deleteEntity(type, id) {
        var url = '/';
        if (type === 'employee') url = '/employees/' + id;
        else if (type === 'company') url = '/companies/' + id;
        else if (type === 'license') url = '/licensetypes/' + id;
        else if (type === 'status') url = '/statuses/' + id;
        else if (type === 'entitytype') url = '/entitytypes/' + id;

        $.ajax({ url: url, method: 'DELETE' })
            .done(function () { showAlert('Deleted successfully', 'success'); reloadAll(); })
            .fail(function () { showAlert('Delete failed', 'danger'); });
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        var type = $('#entityType').val();
        var id = $('#entityId').val();
        var formData = $('#masterForm').serializeArray();
        var obj = {};
        $.each(formData, function (i, field) { obj[field.name] = field.value; });

        if ($('input[name="isActive"]').length) obj.isActive = $('input[name="isActive"]').is(':checked');

        if (obj.role !== undefined && obj.role !== '') obj.role = parseInt(obj.role, 10);
        if (obj.documentId !== undefined && obj.documentId !== '') obj.documentId = parseInt(obj.documentId, 10);

        var url = '/';
        var method = '';

        if (id) {
            method = 'PUT';
            if (type === 'employee') url = '/employees/' + id;
            else if (type === 'company') url = '/companies/' + id;
            else if (type === 'license') url = '/licensetypes/' + id;
            else if (type === 'status') url = '/statuses/' + id;
            else if (type === 'entitytype') url = '/entitytypes/' + id;
        } else {
            method = 'POST';
            if (type === 'employee') url = '/employees';
            else if (type === 'company') url = '/companies';
            else if (type === 'license') url = '/licensetypes';
            else if (type === 'status') url = '/statuses';
            else if (type === 'entitytype') url = '/entitytypes';
        }

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(obj)
        }).done(function () {
            showAlert(id ? 'Updated successfully' : 'Created successfully', 'success');
            modal.hide();
            reloadAll();
        }).fail(function () {
            showAlert(id ? 'Update failed' : 'Create failed', 'danger');
        });
    }

    function getFormHtml(type, data) {
        data = data || {};
        if (type === 'employee') {
            var roleOptions = '<option value="">-- Select role --</option>';
            $.each(roles, function (i, r) {
                var val = r.id ?? r.Id;
                var name = r.name ?? r.Name;
                var selected = (val === (data.role ?? data.Role)) ? 'selected' : '';
                roleOptions += '<option value="' + val + '" ' + selected + '>' + escapeHtml(name) + '</option>';
            });
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3"><label class="form-label">Name</label><input name="name" class="form-control" value="' + escapeHtml(data.name || data.Name || '') + '" required /></div>' +
                '<div class="mb-3"><label class="form-label">Email</label><input name="email" type="email" class="form-control" value="' + escapeHtml(data.email || data.Email || '') + '" /></div>' +
                '<div class="mb-3"><label class="form-label">Role</label><select name="role" class="form-select">' + roleOptions + '</select></div>' +
                '<div class="form-check"><input name="isActive" class="form-check-input" type="checkbox" id="isActive" ' + ((data.isActive || data.IsActive) ? 'checked' : '') + '><label class="form-check-label" for="isActive">Is Active</label></div>';
        } else if (type === 'company') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3"><label class="form-label">Company Name</label><input name="companyName" class="form-control" value="' + escapeHtml(data.companyName || data.CompanyName || '') + '" required /></div>' +
                '<div class="mb-3"><label class="form-label">Document Id</label><input name="documentId" type="number" class="form-control" value="' + (data.documentId || data.DocumentId || '') + '" /></div>' +
                '<div class="form-check"><input name="isActive" class="form-check-input" type="checkbox" ' + ((data.isActive || data.IsActive) ? 'checked' : '') + '><label class="form-check-label">Is Active</label></div>';
        } else if (type === 'license') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3"><label class="form-label">App Type Name</label><input name="appTypeName" class="form-control" value="' + escapeHtml(data.appTypeName || data.AppTypeName || '') + '" required /></div>' +
                '<div class="form-check"><input name="isActive" class="form-check-input" type="checkbox" ' + ((data.isActive || data.IsActive) ? 'checked' : '') + '><label class="form-check-label">Is Active</label></div>';
        } else if (type === 'status') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3"><label class="form-label">Status Name</label><input name="statusName" class="form-control" value="' + escapeHtml(data.statusName || data.StatusName || '') + '" required /></div>' +
                '<div class="form-check"><input name="isActive" class="form-check-input" type="checkbox" ' + ((data.isActive || data.IsActive) ? 'checked' : '') + '><label class="form-check-label">Is Active</label></div>';
        } else if (type === 'entitytype') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3"><label class="form-label">Name</label><input name="name" class="form-control" value="' + escapeHtml(data.name || data.Name || '') + '" required /></div>' +
                '<div class="form-check"><input name="isActive" class="form-check-input" type="checkbox" ' + ((data.isActive || data.IsActive) ? 'checked' : '') + '><label class="form-check-label">Is Active</label></div>';
        } else {
            return '<div>Unknown form</div>';
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
        return String(s).replace(/[&<>"'`=\/]/g, function (c) { return map[c]; });
    }
    function capitalize(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1); }

    function showAlert(msg, type) {
        var $alert = $('<div>').addClass('alert alert-' + type + ' position-fixed top-0 end-0 m-3').css('z-index', 1080).text(msg);
        $('body').append($alert);
        setTimeout(function () { $alert.remove(); }, 3500);
    }

    function reloadAll() {
        loadRoles().done(function () {
            loadEmployees();
            loadCompanies();
            loadLicenses();
            loadStatuses();
            loadEntityTypes();
        }); 
    }
});