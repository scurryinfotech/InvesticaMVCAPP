$(document).ready(function () {

    const API_BASE = "";
    let deleteTargetId = 0;
    let dropdownData = null;


    loadDropdowns();
    loadRenewals();

    // Event Listeners
    $("#filter_company, #filter_license, #filter_location, #filter_status").on("change", applyFilters);
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

                // Populate Company Dropdown
                let companyHtml = '<option value="">-- Select Company --</option>';
                data.companies.forEach(c => {
                    companyHtml += `<option value="${c.id}">${c.name}</option>`;
                });
                $("#modalCompanyId").html(companyHtml);

                // Populate License Type Dropdown
                let licenseHtml = '<option value="">-- Select License Type --</option>';
                data.licenseTypes.forEach(lt => {
                    licenseHtml += `<option value="${lt.id}">${lt.name}</option>`;
                });
                $("#modalLicenseTypeId").html(licenseHtml);

                // Populate Filter Dropdowns
                let filterCompanyHtml = '<option value="">All Companies</option>';
                data.companies.forEach(c => {
                    filterCompanyHtml += `<option value="${c.id}">${c.name}</option>`;
                });
                $("#filter_company").html(filterCompanyHtml);

                let filterLicenseHtml = '<option value="">All License Types</option>';
                data.licenseTypes.forEach(lt => {
                    filterLicenseHtml += `<option value="${lt.id}">${lt.name}</option>`;
                });
                $("#filter_license").html(filterLicenseHtml);

                let filterLocationHtml = '<option value="">All Locations</option>';
                data.locations.forEach(loc => {
                    filterLocationHtml += `<option value="${loc.toUpperCase()}">${loc}</option>`;
                });
                $("#filter_location").html(filterLocationHtml);
            },
            error: function () {
                showToast("Failed to load dropdown data", "danger");
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
                $("#renewalsBody").html('<tr><td colspan="9" class="text-center text-danger">Failed to load data</td></tr>');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  RENDER TABLE
    // ═══════════════════════════════════════════════════════════
    function renderTable(renewals) {
        const tbody = $("#renewalsBody");
        tbody.empty();

        if (!renewals || renewals.length === 0) {
            tbody.append('<tr><td colspan="9" class="text-center text-muted">No records found.</td></tr>');
            return;
        }

        renewals.forEach((item, index) => {
            const badge = getStatusBadge(item.status);
            const daysLeft = item.daysUntilExpiry >= 0 ? item.daysUntilExpiry : 0;

            tbody.append(`
                <tr data-id="${item.id}"
                    data-company="${item.companyId}"
                    data-license="${item.licenseTypeId}"
                    data-location="${item.cityState.toUpperCase()}"
                    data-status="${item.status}">
                    <td>${index + 1}</td>
                    <td>${item.unikey}</td>
                    <td>${item.companyName}</td>
                    
                    <td>${item.licenseType}</td>
                    <td>${item.cityState}</td>
                    <td>${item.address}</td>
                    <td>${item.expiryDateFormatted}</td>
                    <td class="text-center">${daysLeft}</td>
                    <td>${badge}</td>
                    // inside renderTable(...) replace button HTML so icons have accessible fallback
<td class="text-center">
    <button class="btn btn-outline-primary btn-sm btn-edit me-1" title="Edit" aria-label="Edit">
        <i class="fas fa-pencil-alt" aria-hidden="true"></i>
        <span class="">Edit</span>
    </button>
    <button class="btn btn-outline-danger btn-sm btn-delete" title="Delete" aria-label="Delete">
        <i class="fas fa-trash-alt" aria-hidden="true"></i>
        <span class="">Delete</span>
    </button>
</td>
                </tr>
            `);
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  GET STATUS BADGE
    // ═══════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════
    //  APPLY FILTERS
    // ═══════════════════════════════════════════════════════════
    function applyFilters() {
        const companyFilter = $("#filter_company").val();
        const licenseFilter = $("#filter_license").val();
        const locationFilter = $("#filter_location").val().toUpperCase();
        const statusFilter = $("#filter_status").val();

        $("#renewalsBody tr").each(function () {
            const $row = $(this);
            let show = true;

            if (companyFilter && $row.data("company") != companyFilter) show = false;
            if (licenseFilter && $row.data("license") != licenseFilter) show = false;
            if (locationFilter && $row.data("location").indexOf(locationFilter) === -1) show = false;
            if (statusFilter && $row.data("status") !== statusFilter) show = false;

            $row.toggle(show);
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  RESET FILTERS
    // ═══════════════════════════════════════════════════════════
    function resetFilters() {
        $("#filter_company, #filter_license, #filter_location, #filter_status").val("");
        $("#renewalsBody tr").show();
    }

    // ═══════════════════════════════════════════════════════════
    //  OPEN MODAL
    // ═══════════════════════════════════════════════════════════
    function openModal(id) {
        $("#modalAlert").addClass("d-none").text("");

        if (!id) {
            // ADD MODE
            $("#renewalId").val(0);
            $("#renewalModalLabel").text("Add New Renewal");
            $("#btnSave").text("Create");
            clearModalFields();
            $("#renewalModal").modal("show");
        } else {
            // EDIT MODE
            $.ajax({
                url: API_BASE + "/renewal/" + id,
                type: "GET",
                success: function (item) {
                    $("#renewalId").val(item.id);
                    $("#renewalModalLabel").text("Edit Renewal");
                    $("#btnSave").text("Update");
                    $("#modalUnikey").val(item.unikey || "");
                    $("#modalCompanyId").val(item.companyId);
                    $("#modalLicenseTypeId").val(item.licenseTypeId);
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

    // ═══════════════════════════════════════════════════════════
    //  CLEAR MODAL FIELDS
    // ═══════════════════════════════════════════════════════════
    function clearModalFields() {
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

        // Validation
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
        console.log(body);

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