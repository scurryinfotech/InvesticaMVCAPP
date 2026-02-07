$(document).ready(function () {

    const API_BASE = "";
    let deleteTargetId = 0;
    let dropdownData = null;

    loadRenewals();
    setTimeout(loadDropdowns, 0);

    // Event Listeners - ADD month and year filters
    $('#filter_company-wrapper input[type="hidden"], #filter_code-wrapper input[type="hidden"], #filter_license-wrapper input[type="hidden"], #filter_location-wrapper input[type="hidden"], #filter_month-wrapper input[type="hidden"], #filter_year-wrapper input[type="hidden"]').on('change', applyFilters);
    $('#filter_status').on('change', applyFilters);
    $("#btnResetFilters").on("click", resetFilters);
    $("#btnAddNew").on("click", () => openModal());
    $("#btnSave").on("click", saveRenewal);
    $("#btnConfirmDelete").on("click", confirmDelete);

    // Delegated events for dynamic rows
    $("#renewalsBody").on("click", ".btn-edit", function () {
        const id = $(this).closest("tr").data("id");
        openModal(id);
    });

    $("#renewalsBody").on("click", ".btn-delete", function () {
        deleteTargetId = $(this).closest("tr").data("id");
        $("#deleteModal").modal("show");
    });

    // ═══════════════════════════════════════════════════════════
    //  LOAD DROPDOWNS
    // ═══════════════════════════════════════════════════════════
    function loadDropdowns() {
        $.ajax({
            url: API_BASE + "/renewals/dropdowns",
            type: "GET",
            success: function (data) {
                dropdownData = data;
                debugger
                // Populate Modal Company Dropdown (searchable)
                populateSearchableDropdown(
                    '#modalCompanyId-wrapper',
                    data.companies,
                    '-- Select Company --',
                    false
                );

                // Populate Modal License Type Dropdown (searchable)
                populateSearchableDropdown(
                    '#modalLicenseTypeId-wrapper',
                    data.licenseTypes,
                    '-- Select License Type --',
                    false
                );

                populateSearchableDropdown(
                    '#filter_code-wrapper',
                    data.code,
                    'All Codes',
                    false
                );

                // Populate Filter Company Dropdown (searchable)
                populateSearchableDropdown(
                    '#filter_company-wrapper',
                    data.companies,
                    'All Companies',
                    false
                );

                // Populate Filter License Type Dropdown (searchable)
                populateSearchableDropdown(
                    '#filter_license-wrapper',
                    data.licenseTypes,
                    'All License Types',
                    false
                );

                // Populate Filter Location Dropdown (searchable)
                populateSearchableDropdown(
                    '#filter_location-wrapper',
                    data.locations.map(loc => ({ id: loc.toUpperCase(), name: loc })),
                    'All Locations',
                    false
                );

                // NEW: Populate Month Filter (multi-select)
                const months = [
                    { id: '1', name: 'January' },
                    { id: '2', name: 'February' },
                    { id: '3', name: 'March' },
                    { id: '4', name: 'April' },
                    { id: '5', name: 'May' },
                    { id: '6', name: 'June' },
                    { id: '7', name: 'July' },
                    { id: '8', name: 'August' },
                    { id: '9', name: 'September' },
                    { id: '10', name: 'October' },
                    { id: '11', name: 'November' },
                    { id: '12', name: 'December' }
                ];
                populateSearchableDropdown(
                    '#filter_month-wrapper',
                    months,
                    'All Months (select multiple)',
                    true
                );

                // NEW: Populate Year Filter (multi-select)
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let i = currentYear - 2; i <= currentYear + 5; i++) {
                    years.push({ id: i.toString(), name: i.toString() });
                }
                populateSearchableDropdown(
                    '#filter_year-wrapper',
                    years,
                    'All Years (select multiple)',
                    true
                );

                // Initialize searchable dropdowns after populating
                initializeSearchableDropdowns();
            },
            error: function () {
                showToast("Failed to load dropdown data", "danger");
            }
        });
    }

    function initializeSearchableDropdowns() {
        $('.searchable-input').each(function () {
            const $input = $(this);
            const $list = $input.siblings('.searchable-dropdown-list');
            const $hiddenValue = $input.siblings('input[type="hidden"]');
            const isMultiSelect = $input.hasClass('multi-select');

            $input.on('focus click', function (e) {
                e.stopPropagation();
                $('.searchable-dropdown-list').not($list).hide();

                if (!isMultiSelect) {
                    if ($input.val() && $hiddenValue.val()) {
                        $input.val('');
                    }
                }

                $list.show();
                $list.find('li').not('.no-results').show();
                $list.find('.no-results').remove();
            });

            $input.on('input', function () {
                const searchValue = $(this).val().toLowerCase();
                let visibleCount = 0;

                if (isMultiSelect) {
                    const parts = searchValue.split(',');
                    const lastPart = parts[parts.length - 1].trim();

                    $list.find('li').not('.no-results').each(function () {
                        const text = $(this).text().toLowerCase();
                        const matches = text.includes(lastPart);
                        $(this).toggle(matches);
                        if (matches) visibleCount++;
                    });
                } else {
                    $list.find('li').not('.no-results').each(function () {
                        const text = $(this).text().toLowerCase();
                        const matches = text.includes(searchValue);
                        $(this).toggle(matches);
                        if (matches) visibleCount++;
                    });
                }

                $list.find('.no-results').remove();
                if (visibleCount === 0 && searchValue !== '') {
                    $list.append('<li class="no-results">No results found</li>');
                }

                $list.show();
            });

            $input.on('keydown', function (e) {
                const $visibleItems = $list.find('li:visible').not('.no-results');
                const $active = $list.find('li.active');
                let $next;

                if (e.keyCode === 40) { // Down arrow
                    e.preventDefault();
                    if ($active.length === 0) {
                        $next = $visibleItems.first();
                    } else {
                        $next = $active.removeClass('active').nextAll('li:visible').not('.no-results').first();
                        if ($next.length === 0) $next = $visibleItems.first();
                    }
                } else if (e.keyCode === 38) { // Up arrow
                    e.preventDefault();
                    if ($active.length === 0) {
                        $next = $visibleItems.last();
                    } else {
                        $next = $active.removeClass('active').prevAll('li:visible').not('.no-results').first();
                        if ($next.length === 0) $next = $visibleItems.last();
                    }
                } else if (e.keyCode === 13) { // Enter
                    e.preventDefault();
                    if ($active.length > 0) {
                        $active.click();
                    }
                    return;
                } else if (e.keyCode === 27) { // Escape
                    $list.hide();
                    $input.blur();
                    return;
                }

                if ($next && $next.length > 0) {
                    $next.addClass('active');
                    const listTop = $list.scrollTop();
                    const listHeight = $list.height();
                    const itemTop = $next.position().top;
                    const itemHeight = $next.outerHeight();

                    if (itemTop < 0) {
                        $list.scrollTop(listTop + itemTop);
                    } else if (itemTop + itemHeight > listHeight) {
                        $list.scrollTop(listTop + itemTop + itemHeight - listHeight);
                    }
                }
            });

            $list.on('mouseenter', 'li', function () {
                $list.find('li.active').removeClass('active');
            });
        });

        // Handle item selection
        // inside initializeSearchableDropdowns() — update the click handler to log selected values
        $(document).on('click', '.searchable-dropdown-list li', function () {
            if ($(this).hasClass('no-results')) return;

            const $item = $(this);
            const $list = $item.parent();
            const $wrapper = $list.parent();
            const $input = $wrapper.find('.searchable-input');
            const $hiddenValue = $wrapper.find('input[type="hidden"]');
            const isMultiSelect = $input.hasClass('multi-select');

            const selectedValueRaw = $item.data('value');
            const selectedValue = selectedValueRaw;
            const selectedValueStr = String(selectedValue);
            const selectedText = $item.text();

            if (isMultiSelect) {
                // Normalize current values into an array of strings (non-empty)
                let currentValues = ($hiddenValue.val() || '').toString().split(',').map(s => s.trim()).filter(s => s);
                let currentTexts = $input.val() ? $input.val().split(', ').filter(t => t.trim()) : [];

                if (currentValues.includes(selectedValueStr)) {
                    currentValues = currentValues.filter(v => v !== selectedValueStr);
                    currentTexts = currentTexts.filter(t => t !== selectedText);
                } else {
                    currentValues.push(selectedValueStr);
                    currentTexts.push(selectedText);
                }

                $input.val(currentTexts.join(', '));

                // Set hidden input reliably (jQuery + DOM property + attribute) then keep dropdown open
                const joined = currentValues.join(',');
                $hiddenValue.val(joined);
                if ($hiddenValue[0]) $hiddenValue[0].value = joined;
                $hiddenValue.attr('value', joined);
                $list.show();
            } else {
                $input.val(selectedText);

                // Set hidden input reliably (jQuery + DOM property + attribute)
                $hiddenValue.val(selectedValueStr);
                if ($hiddenValue[0]) $hiddenValue[0].value = selectedValueStr;
                $hiddenValue.attr('value', selectedValueStr);

                $list.hide();
            }

            // Debug: log selection so you can inspect values in DevTools
            console.log('searchable selection:', {
                wrapper: $wrapper.attr('id'),
                selectedValue: selectedValueStr,
                selectedText,
                hiddenValueVal: $hiddenValue.val(),
                hiddenValueAttr: $hiddenValue.attr('value')
            });

            // Trigger change event for filters
            $hiddenValue.trigger('change');
        });

        // Hide dropdowns on outside click
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.searchable-dropdown-wrapper').length) {
                $('.searchable-dropdown-list').hide();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  LOAD RENEWALS
    // ═══════════════════════════════════════════════════════════
    function loadRenewals() {
        $.ajax({
            url: API_BASE + "/renewals",
            type: "GET",
            success: function (renewals) {
                renderTable(renewals);
            },
            error: function () {
                showToast("Failed to load renewals", "danger");
                $("#renewalsBody").html('<tr><td colspan="11" class="text-center text-danger">Failed to load data</td></tr>');
            }
        });
    }


    function renderTable(renewals) {
        const tbody = $("#renewalsBody");
        tbody.empty();

        if (!renewals || renewals.length === 0) {
            tbody.append('<tr><td colspan="11" class="text-center text-muted">No records found.</td></tr>');
            return;
        }

        renewals.forEach((item, index) => {
            const badge = getStatusBadge(item.status);
            const daysUntilExpiry = Number(item.daysUntilExpiry) || 0;
            const daysLeft = daysUntilExpiry >= 0 ? daysUntilExpiry : 0;
            const daysSinceExpiry = daysUntilExpiry < 0 ? Math.abs(daysUntilExpiry) : 0;
            const daysDisplay = daysSinceExpiry > 0
                ? `<span class="text-danger">-${daysSinceExpiry}</span>`
                : `<span>${daysLeft}</span>`;

            // Extract month and year from expiry date and make them safe strings
            let expiryMonth = "";
            let expiryYear = "";
            if (item.expiryDate) {
                const expiryDate = new Date(item.expiryDate);
                if (!isNaN(expiryDate.getTime())) {
                    expiryMonth = String(expiryDate.getMonth() + 1); // "1" - "12"
                    expiryYear = String(expiryDate.getFullYear());
                }
            }

            tbody.append(`
            <tr data-id="${item.id}"
                data-company="${item.companyId}"
                data-code="${item.unikey}" 
                data-license="${item.licenseTypeId}"
                data-location="${item.cityState ? item.cityState.toUpperCase() : ''}"
                data-status="${item.status || ''}"
                data-month="${expiryMonth}"
                data-year="${expiryYear}">
                <td>${index + 1}</td>
                <td style="text-wrap: nowrap;">${item.unikey}</td>
                <td style="text-wrap:wrap;">${item.companyName}</td>
                <td>${item.licenseType}</td>
                <td>${item.cityState}</td>
                <td style="text-wrap: wrap;">${item.address}</td>
                <td style="text-wrap: wrap;">${item.expiryDateFormatted}</td>
                <td class="text-center">${daysDisplay}</td>
                <td>${badge}</td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm btn-edit me-1" title="Edit" aria-label="Edit">
                        <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                        <span class="d-none d-md-inline">Edit</span>
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" title="Delete" aria-label="Delete">
                        <i class="fas fa-trash-alt" aria-hidden="true"></i>
                        <span class="d-none d-md-inline">Delete</span>
                    </button>
                </td>       
                <td>${item.remarks}</td>
            </tr>
        `);
        });
    }

    function getStatusBadge(status) {
        const badges = {
            "EXPIRED": "bg-secondary text-white",
            "URGENT": "bg-danger text-white",
            "DUE SOON": "bg-warning text-dark",
            "PENDING": "bg-info text-dark"
        };
        const cls = badges[status] || "bg-secondary";
        return `<span class="badge ${cls}">${status}</span>`;
    }

    function applyFilters() {
        const companyCode = $('#filter_code-wrapper input[type="hidden"]').val() || "";
        const companyFilter = $('#filter_company-wrapper input[type="hidden"]').val() || "";
        const licenseFilter = $('#filter_license-wrapper input[type="hidden"]').val() || "";
        const locationFilter = ($('#filter_location-wrapper input[type="hidden"]').val() || "").toUpperCase();
        const statusFilter = $('#filter_status').val() || "";

        const monthFilter = $('#filter_month-wrapper input[type="hidden"]').val() || "";
        const yearFilter = $('#filter_year-wrapper input[type="hidden"]').val() || "";

        const selectedMonths = monthFilter ? monthFilter.split(',').map(m => m.trim()) : [];
        const selectedYears = yearFilter ? yearFilter.split(',').map(y => y.trim()) : [];

        debugger

        // Debugging helper - remove or comment out in production
        console.log('applyFilters()', {
            companyFilter, companyCode, licenseFilter, locationFilter, statusFilter, selectedMonths, selectedYears
        });

        $("#renewalsBody tr").each(function () {
            const $row = $(this);
            let show = true;

            if (companyFilter && $row.data("company").toString() !== companyFilter.toString()) {
                show = false;
            }
            if (companyCode && $row.data("code").toString() !== companyCode.toString()) {
                show = false;
            }
            if (licenseFilter && $row.data("license").toString() !== licenseFilter.toString()) {
                show = false;
            }
            if (locationFilter && $row.data("location").indexOf(locationFilter) === -1) {
                show = false;
            }
            if (statusFilter && $row.data("status") !== statusFilter) {
                show = false;
            }

            if (selectedMonths.length > 0) {
                const rowMonth = $row.data("month").toString();
                if (!selectedMonths.includes(rowMonth)) {
                    show = false;
                }
            }

            if (selectedYears.length > 0) {
                const rowYear = $row.data("year").toString();
                if (!selectedYears.includes(rowYear)) {
                    show = false;
                }
            }

            $row.toggle(show);
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  RESET FILTERS
    // ═══════════════════════════════════════════════════════════
    function resetFilters() {
        // Clear searchable controls
        $('.searchable-input').val('');
        $('.searchable-dropdown-wrapper input[type="hidden"]').val('');

        // Reset regular selects
        $("#filter_status").val("");

        // Hide dropdown lists and remove no-results
        $('.searchable-dropdown-list').hide().find('.no-results').remove();

        // Trigger change
        $('.searchable-dropdown-wrapper input[type="hidden"]').trigger('change');

        // Show all rows
        $("#renewalsBody tr").show();
    }

    // ═══════════════════════════════════════════════════════════
    //  OPEN MODAL
    // ═══════════════════════════════════════════════════════════
    function openModal(id) {
        $("#modalAlert").addClass("d-none").text("");

        if (!id) {
            $("#renewalId").val(0);
            $("#renewalModalLabel").text("Add New Renewal");
            $("#btnSave").text("Create");
            clearModalFields();
            $("#renewalModal").modal("show");
        } else {
            $.ajax({
                url: API_BASE + "/renewal/" + id,
                type: "GET",
                success: function (item) {
                    $("#renewalId").val(item.id);
                    $("#renewalModalLabel").text("Edit Renewal");
                    $("#btnSave").text("Update");
                    $("#modalUnikey").val(item.unikey || "");

                    // Set searchable dropdowns
                    setSearchableDropdownValue('#modalCompanyId-wrapper', item.companyId, item.companyName);
                    setSearchableDropdownValue('#modalLicenseTypeId-wrapper', item.licenseTypeId, item.licenseType);

                    $("#modalCityState").val(item.cityState);
                    $("#modalAddress").val(item.address);
                    $("#modalExpiryDate").val(dateToInputFormat(item.expiryDate));
                    $("#modalRemarks").val(item.remarks || "");

                    $("#renewalModal").modal("show");
                },
                error: function () {
                    showToast("Failed to load renewal details", "danger");
                }
            });
        }
    }

    // Helper function to set searchable dropdown value
    function setSearchableDropdownValue(wrapperSelector, value, text) {
        const $wrapper = $(wrapperSelector);
        $wrapper.find('.searchable-input').val(text);
        $wrapper.find('input[type="hidden"]').val(value);
    }

    // ═══════════════════════════════════════════════════════════
    //  CLEAR MODAL FIELDS
    // ═══════════════════════════════════════════════════════════
    function clearModalFields() {
        $('#modalCompanyId-wrapper .searchable-input').val('');
        $('#modalLicenseTypeId-wrapper .searchable-input').val('');
        $("#modalCompanyId, #modalLicenseTypeId").val("");
        $("#modalCityState, #modalAddress, #modalExpiryDate, #modalRemarks").val("");
        $("#modalUnikey").val("");
    }

    // ═══════════════════════════════════════════════════════════
    //  DATE TO INPUT FORMAT
    // ═══════════════════════════════════════════════════════════
    function dateToInputFormat(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = ("0" + (d.getMonth() + 1)).slice(-2);
        const day = ("0" + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    // ═══════════════════════════════════════════════════════════
    //  SAVE RENEWAL
    // ═══════════════════════════════════════════════════════════
    function saveRenewal() {
        const id = Number($("#renewalId").val()) || 0;
        const companyId = Number($("#modalCompanyId").val()) || 0;
        const licenseTypeId = Number($("#modalLicenseTypeId").val()) || 0;
        const cityState = $("#modalCityState").val().trim();
        const address = $("#modalAddress").val().trim();
        const expiryDateRaw = $("#modalExpiryDate").val().trim();
        const remarks = $("#modalRemarks").val().trim();

        const errors = [];
        if (!companyId) errors.push("Please select a Company.");
        if (!licenseTypeId) errors.push("Please select a License Type.");
        if (!cityState) errors.push("Please enter City / State.");
        if (!address) errors.push("Please enter Address.");
        if (!expiryDateRaw) errors.push("Please select an Expiry Date.");

        if (errors.length > 0) {
            $("#modalAlert").removeClass("d-none").html(errors.join("<br>"));
            return;
        }

        $("#modalAlert").addClass("d-none");

        const expiryIso = expiryDateRaw + "T00:00:00";
        const body = {
            companyId,
            licenseTypeId,
            cityState,
            address,
            expiryDate: expiryIso,
            remarks,
            isActive: true,
            unikey: ($("#modalUnikey").length ? $("#modalUnikey").val() : "")
        };

        const url = id === 0 ? API_BASE + "/renewal" : API_BASE + "/renewal/" + id;
        const method = id === 0 ? "POST" : "PUT";

        $("#btnSave").prop("disabled", true);

        $.ajax({
            url,
            type: method,
            contentType: "application/json",
            data: JSON.stringify(body),
            success: function (response) {
                $("#renewalModal").modal("hide");
                showToast(id === 0 ? "Renewal created successfully!" : "Renewal updated successfully!", "success");
                loadRenewals();
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.message || xhr.statusText || "Operation failed";
                $("#modalAlert").removeClass("d-none").text(msg);
                showToast(msg, "danger");
            },
            complete: function () {
                $("#btnSave").prop("disabled", false);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  CONFIRM DELETE
    // ═══════════════════════════════════════════════════════════
    function confirmDelete() {
        $.ajax({
            url: API_BASE + "/renewal/" + deleteTargetId,
            type: "DELETE",
            success: function () {
                $("#deleteModal").modal("hide");
                showToast("Renewal deleted successfully!", "success");
                loadRenewals();
            },
            error: function () {
                $("#deleteModal").modal("hide");
                showToast("Failed to delete renewal", "danger");
            }
        });
    }

    function populateSearchableDropdown(wrapperSelector, items, placeholder, isMultiSelect) {
        debugger
        const $wrapper = $(wrapperSelector);
        const $input = $wrapper.find('.searchable-input');
        const $list = $wrapper.find('.searchable-dropdown-list');
        const $hiddenValue = $wrapper.find('input[type="hidden"]');

        // Add multi-select class if needed
        if (isMultiSelect) {
            $input.addClass('multi-select');
        }

        $input.attr('placeholder', placeholder);
        $list.empty();

        items.forEach(item => {
            const value = item.id || item;
            const text = item.name || item;
            $list.append(`<li data-value="${value}">${text}</li>`);
        });

        $input.val('');
        $hiddenValue.val('');
    }

    // ═══════════════════════════════════════════════════════════
    //  SHOW TOAST
    // ═══════════════════════════════════════════════════════════
    function showToast(message, type) {
        const cId = "toastContainer";
        if ($("#" + cId).length === 0) {
            $("body").append(`<div id="${cId}" class="toast-container position-fixed top-0 end-0 p-3" style="z-index:1100;"></div>`);
        }

        const id = "toast_" + Date.now();
        $("#" + cId).append(`
            <div id="${id}" class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `);

        setTimeout(() => $("#" + id).remove(), 3500);
    }

});