/* MasterData.js - jQuery/AJAX version */

$(document).ready(function () {
    'use strict';

    let roles = [];
    let rolesMap = {};
    let modal;

    // Initialize
    modal = new bootstrap.Modal('#masterModal');
    bindEvents();
    reloadAll();

    // Event bindings
    function bindEvents() {
        $('#btnAddEmployee').on('click', function () {
            openCreate('employee');
        });
        $('#btnAddCompany').on('click', function () {
            openCreate('company');
        });
        $('#btnAddLicense').on('click', function () {
            openCreate('license');
        });
        $('#btnAddStatus').on('click', function () {
            openCreate('status');
        });

        $('#searchEmployees').on('input', function () {
            filterTable('#tblEmployees tbody', $(this).val());
        });
        $('#searchCompanies').on('input', function () {
            filterTable('#tblCompanies tbody', $(this).val());
        });
        $('#searchLicenses').on('input', function () {
            filterTable('#tblLicenses tbody', $(this).val());
        });
        $('#searchStatuses').on('input', function () {
            filterTable('#tblStatuses tbody', $(this).val());
        });

        $('#masterForm').on('submit', handleFormSubmit);
    }

    // Load functions
    function loadRoles() {
        return $.ajax({
            url: '/roles',
            method: 'GET',
            success: function (data) {
                roles = Array.isArray(data) ? data : [];
                rolesMap = {};
                $.each(roles, function (index, role) {
                    rolesMap[role.id] = role.name;
                });
            },
            error: function () {
                showAlert('Failed to load roles', 'danger');
            }
        });
    }

    function loadEmployees() {
        $.ajax({
            url: '/employees',
            method: 'GET',
            success: function (data) {
                renderTable('#tblEmployees tbody', data, 'employee');
                $('#count-employees').text(data.length);
            },
            error: function () {
                showAlert('Failed to load employees', 'danger');
            }
        });
    }

    function loadCompanies() {
        $.ajax({
            url: '/companies',
            method: 'GET',
            success: function (data) {
                renderTable('#tblCompanies tbody', data, 'company');
                $('#count-companies').text(data.length);
            },
            error: function () {
                showAlert('Failed to load companies', 'danger');
            }
        });
    }

    function loadLicenses() {
        $.ajax({
            url: '/licensetypes',
            method: 'GET',
            success: function (data) {
                renderTable('#tblLicenses tbody', data, 'license');
                $('#count-licenses').text(data.length);
            },
            error: function () {
                showAlert('Failed to load licenses', 'danger');
            }
        });
    }

    function loadStatuses() {
        $.ajax({
            url: '/statuses',
            method: 'GET',
            success: function (data) {
                renderTable('#tblStatuses tbody', data, 'status');
                $('#count-statuses').text(data.length);
            },
            error: function () {
                showAlert('Failed to load statuses', 'danger');
            }
        });
    }

    // Render table
    function renderTable(selector, items, type) {
        var $tbody = $(selector);
        $tbody.empty();

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
            var roleLabel = rolesMap[item.role] || item.role || '';
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.name || '') + '</td>' +
                '<td>' + escapeHtml(item.email || '') + '</td>' +
                '<td>' + escapeHtml(roleLabel) + '</td>' +
                '<td>' + (item.isActive ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        }
        else if (type === 'company') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.companyName || '') + '</td>' +
                '<td>' + (item.isActive ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        }
        else if (type === 'license') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.appTypeName || '') + '</td>' +
                '<td>' + (item.isActive ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        }
        else if (type === 'status') {
            return '<td>' + index + '</td>' +
                '<td>' + escapeHtml(item.statusName || '') + '</td>' +
                '<td>' + (item.isActive ? 'Yes' : 'No') + '</td>' +
                '<td>' + actions + '</td>';
        }
    }

    // Filter table
    function filterTable(selector, term) {
        term = (term || '').toLowerCase();
        $(selector).find('tr').each(function () {
            var text = $(this).text().toLowerCase();
            if (text.indexOf(term) >= 0) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Modal operations
    function openCreate(type) {
        $('#entityType').val(type);
        $('#entityId').val('');
        $('#modalTitle').text('Add ' + capitalize(type));
        $('#modalBodyContent').html(getFormHtml(type, {}));
        modal.show();
    }

    function openEdit(type, id) {
        var url = '';
        if (type === 'employee') url = '/employees/' + id;
        else if (type === 'company') url = '/companies/' + id;
        else if (type === 'license') url = '/licensetypes/' + id;
        else if (type === 'status') url = '/statuses/' + id;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                debugger
                $('#entityType').val(type);
                $('#entityId').val(data.id);
                $('#modalTitle').text('Edit ' + capitalize(type));
                $('#modalBodyContent').html(getFormHtml(type, data));
                modal.show();
            },
            error: function () {
                showAlert('Failed to load item', 'danger');
            }
        });
    }

    function confirmDelete(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        deleteEntity(type, id);
    }

    function deleteEntity(type, id) {
        var url = '';
        if (type === 'employee') url = '/employees/' + id;
        else if (type === 'company') url = '/companies/' + id;
        else if (type === 'license') url = '/licensetypes/' + id;
        else if (type === 'status') url = '/statuses/' + id;

        $.ajax({
            url: url,
            method: 'DELETE',
            success: function () {
                showAlert('Deleted successfully', 'success');
                reloadAll();
            },
            error: function () {
                showAlert('Delete failed', 'danger');
            }
        });
    }

    // Form submit
    function handleFormSubmit(e) {
        e.preventDefault();

        var type = $('#entityType').val();
        var id = $('#entityId').val();
        var formData = $('#masterForm').serializeArray();
        var obj = {};

        $.each(formData, function (index, field) {
            obj[field.name] = field.value;
        });

        if ($('input[name="isActive"]').length) {
            obj.isActive = $('input[name="isActive"]').is(':checked');
        }

        if (obj.role !== undefined && obj.role !== '') {
            obj.role = parseInt(obj.role, 10);
        }

        if (obj.documentId !== undefined && obj.documentId !== '') {
            obj.documentId = parseInt(obj.documentId, 10);
        }

        var url = '';
        var method = '';

        if (id) {
            method = 'PUT';
            if (type === 'employee') url = '/employees/' + id;
            else if (type === 'company') url = '/companies/' + id;
            else if (type === 'license') url = '/licensetypes/' + id;
            else if (type === 'status') url = '/statuses/' + id;
        } else {
            method = 'POST';
            if (type === 'employee') url = '/employees';
            else if (type === 'company') url = '/companies';
            else if (type === 'license') url = '/licensetypes';
            else if (type === 'status') url = '/statuses';
        }

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(obj),
            success: function () {
                showAlert(id ? 'Updated successfully' : 'Created successfully', 'success');
                modal.hide();
                reloadAll();
            },
            error: function () {
                showAlert(id ? 'Update failed' : 'Create failed', 'danger');
            }
        });
    }

    // Form HTML generation
    function getFormHtml(type, data) {
        data = data || {};

        if (type === 'employee') {
            var roleOptions = '';
            $.each(roles, function (index, role) {
                var selected = role.id === data.role ? 'selected' : '';
                roleOptions += '<option value="' + role.id + '" ' + selected + '>' + escapeHtml(role.name) + '</option>';
            });

            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3">' +
                '<label class="form-label">Name</label>' +
                '<input name="name" class="form-control" value="' + escapeHtml(data.name || '') + '" required />' +
                '</div>' +
                '<div class="mb-3">' +
                '<label class="form-label">Email</label>' +
                '<input name="email" type="email" class="form-control" value="' + escapeHtml(data.email || '') + '" />' +
                '</div>' +
                '<div class="mb-3">' +
                '<label class="form-label">Role</label>' +
                '<select name="role" class="form-select">' +
                '<option value="">-- Select role --</option>' +
                roleOptions +
                '</select>' +
                '</div>' +
                '<div class="form-check">' +
                '<input name="isActive" class="form-check-input" type="checkbox" id="isActive" ' + (data.isActive ? 'checked' : '') + '>' +
                '<label class="form-check-label" for="isActive">Is Active</label>' +
                '</div>';
        }
        else if (type === 'company') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3">' +
                '<label class="form-label">Company Name</label>' +
                '<input name="companyName" class="form-control" value="' + escapeHtml(data.companyName || '') + '" required />' +
                '</div>' +
                '<div class="mb-3">' +
                '<label class="form-label">Document Id</label>' +
                '<input name="documentId" type="number" class="form-control" value="' + (data.documentId || '') + '" />' +
                '</div>' +
                '<div class="form-check">' +
                '<input name="isActive" class="form-check-input" type="checkbox" ' + (data.isActive ? 'checked' : '') + '>' +
                '<label class="form-check-label">Is Active</label>' +
                '</div>';
        }
        else if (type === 'license') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3">' +
                '<label class="form-label">App Type Name</label>' +
                '<input name="appTypeName" class="form-control" value="' + escapeHtml(data.appTypeName || '') + '" required />' +
                '</div>' +
                '<div class="form-check">' +
                '<input name="isActive" class="form-check-input" type="checkbox" ' + (data.isActive ? 'checked' : '') + '>' +
                '<label class="form-check-label">Is Active</label>' +
                '</div>';
        }
        else if (type === 'status') {
            return '<input type="hidden" name="unikey" value="' + escapeHtml(data.unikey || '') + '" />' +
                '<div class="mb-3">' +
                '<label class="form-label">Status Name</label>' +
                '<input name="statusName" class="form-control" value="' + escapeHtml(data.statusName || '') + '" required />' +
                '</div>' +
                '<div class="form-check">' +
                '<input name="isActive" class="form-check-input" type="checkbox" ' + (data.isActive ? 'checked' : '') + '>' +
                '<label class="form-check-label">Is Active</label>' +
                '</div>';
        }
        else {
            return '<div>Unknown form</div>';
        }
    }

    // Utilities
    function escapeHtml(s) {
        if (!s) return '';
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return String(s).replace(/[&<>"'`=\/]/g, function (c) {
            return map[c];
        });
    }
    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function showAlert(msg, type) {
        var $alert = $('<div>')
            .addClass('alert alert-' + type + ' position-fixed top-0 end-0 m-3')
            .css('z-index', 1080)
            .text(msg);

        $('body').append($alert);
        setTimeout(function () {
            $alert.remove();
        }, 3500);
    }

    function reloadAll() {
        loadRoles().done(function () {
            loadEmployees();
            loadCompanies();
            loadLicenses();
            loadStatuses();
        });
    }

});