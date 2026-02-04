// Frontsheet.js - Complete CRUD Operations

let currentFrontsheetId = null;

// Load all Frontsheets on page load
$(document).ready(function () {
    loadFrontsheetList();
    loadFrontsheetData();
    initializeEventHandlers();
});

// Initialize Event Handlers
function initializeEventHandlers() {
    // Edit/Save Button
    $("#frontsheetEditBtn").on("click", toggleEditMode);

    // Create New Frontsheet Button (if you have one)
    $("#createNewFrontsheet").on("click", createNewFrontsheet);

    // Delete Button (if you have one)
    $("#deleteFrontsheet").on("click", deleteFrontsheet);
}

// Load Frontsheet List (for dropdown or selection)
function loadFrontsheetList() {
    $.ajax({
        url: '/Frontsheet/GetAllFrontsheets',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                populateFrontsheetDropdown(response.data);
            } else {
                showNotification('Error loading frontsheets: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading frontsheets:', error);
            showNotification('Failed to load frontsheets', 'error');
        }
    });
}

// Populate Frontsheet Dropdown (if needed)
function populateFrontsheetDropdown(data) {
    const dropdown = $('#frontsheetSelector');
    if (dropdown.length) {
        dropdown.empty();
        dropdown.append('<option value="">Select Frontsheet</option>');
        $.each(data, function (index, item) {
            dropdown.append(`<option value="${item.Id}">${item.EntityName}</option>`);
        });

        dropdown.on('change', function () {
            const id = $(this).val();
            if (id) {
                loadFrontsheetById(id);
            }
        });
    }
}

// Load Frontsheet by ID
function loadFrontsheetById(id) {
    $.ajax({
        url: '/Frontsheet/GetFrontsheetById',
        type: 'GET',
        data: { id: id },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                currentFrontsheetId = id;
                populateFrontsheetForm(response.data);
            } else {
                showNotification('Error loading frontsheet: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading frontsheet:', error);
            showNotification('Failed to load frontsheet data', 'error');
        }
    });
}

// Load Frontsheet Data (initial load or from localStorage)
function loadFrontsheetData() {
    // Check if we have an ID in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const frontsheetId = urlParams.get('id') || localStorage.getItem('currentFrontsheetId');

    if (frontsheetId) {
        loadFrontsheetById(frontsheetId);
    } else {
        // Load from localStorage (wizard data)
        loadFromLocalStorage();
    }
}

// Load from LocalStorage (wizard data)
function loadFromLocalStorage() {
    const company = localStorage.getItem("sum_company") || "—";
    const address = localStorage.getItem("sum_address") || "—";

    document.getElementById("fs_name").innerText = company;
    document.getElementById("fs_address").innerText = address;
}

// Populate Frontsheet Form with data
function populateFrontsheetForm(data) {
    // Basic Information
    $("#fs_name").text(data.EntityName || "—");
    $("#fs_address").text(data.Address || "—");
    $("#fs_phone").text(data.Phone || "—");
    $("#fs_email").text(data.Email || "—");

    // Promoter/Director Information
    $("#fs_director").text(data.PromoterNameAddress || "—");
    $("#fs_entitytype").text(data.EntityType || "—");
    $("#fs_pan").text(data.PanAadhar || "—");

    // Business Information
    $("#fs_business").text(data.NatureOfBusiness || "—");
    $("#fs_epan").text(data.EntityPan || "—");

    // Personal Information
    $("#fs_dob").text(data.DOB ? formatDate(data.DOB) : "—");
    $("#fs_gender").text(data.Gender || "—");
    $("#fs_marital").text(data.MaritalStatus || "—");
    $("#fs_family").text(data.FatherMotherSpouseName || "—");

    // Location Information
    $("#fs_area").text(data.Area || "—");
    $("#fs_ward").text(data.Ward || "—");
    $("#fs_zone").text(data.Zone || "—");

    // Product/Service Information
    $("#fs_product").text(data.ProductServiceSold || "—");

    // Source Information
    $("#fs_source").text(data.ClientSource || "");
    $("#fs_sourcedby").text(data.SourcedByEmpId || "");

    // Additional Information
    $("#fs_comments").text(data.Comments || "");
    $("#fs_login").text(data.Login || "");
    $("#fs_password").text(data.Password || "");
    $("#fs_details").text(data.Details || "");

    // Document verification fields
    $("#fs_docname").text("");
    $("#fs_docsign").text("");
}

// Toggle Edit Mode
function toggleEditMode() {
    const ids = [
        "fs_name", "fs_address", "fs_phone", "fs_email", "fs_director",
        "fs_entitytype", "fs_pan", "fs_business", "fs_epan",
        "fs_dob", "fs_gender", "fs_marital", "fs_family",
        "fs_area", "fs_ward", "fs_zone", "fs_product",
        "fs_source", "fs_sourcedby", "fs_comments",
        "fs_login", "fs_password", "fs_details",
        "fs_docname", "fs_docsign"
    ];

    const isEditing = $(this).text().includes("Save");

    if (!isEditing) {
        // Switch to Edit Mode
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const val = el.innerText.trim();
            el.dataset.old = val;

            // Multi-line fields
            if (["fs_address", "fs_director", "fs_comments", "fs_details"].includes(id)) {
                el.innerHTML = `<textarea class="form-control" rows="3" id="${id}_input">${val === '—' ? '' : val}</textarea>`;
            }
            // Date field
            else if (id === "fs_dob") {
                const dateVal = val === '—' ? '' : formatDateForInput(val);
                el.innerHTML = `<input type="date" class="form-control" id="${id}_input" value="${dateVal}" />`;
            }
            // Gender dropdown
            else if (id === "fs_gender") {
                el.innerHTML = `
                    <select class="form-control" id="${id}_input">
                        <option value="">Select</option>
                        <option value="Male" ${val === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${val === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${val === 'Other' ? 'selected' : ''}>Other</option>
                    </select>`;
            }
            // Marital Status dropdown
            else if (id === "fs_marital") {
                el.innerHTML = `
                    <select class="form-control" id="${id}_input">
                        <option value="">Select</option>
                        <option value="Single" ${val === 'Single' ? 'selected' : ''}>Single</option>
                        <option value="Married" ${val === 'Married' ? 'selected' : ''}>Married</option>
                        <option value="Divorced" ${val === 'Divorced' ? 'selected' : ''}>Divorced</option>
                        <option value="Widowed" ${val === 'Widowed' ? 'selected' : ''}>Widowed</option>
                    </select>`;
            }
            // Regular text fields
            else {
                el.innerHTML = `<input type="text" class="form-control" id="${id}_input" value="${val === '—' ? '' : val}" />`;
            }
        });

        $(this).text("Save Form");
        $(this).css("background", "#28a745");
    } else {
        // Save Mode - Collect data and save
        const formData = collectFormData(ids);
        saveFrontsheet(formData, ids);
    }
}

// Collect Form Data
function collectFormData(ids) {
    const data = {
        Id: currentFrontsheetId || 0,
        EntityName: getFieldValue("fs_name"),
        Address: getFieldValue("fs_address"),
        Phone: getFieldValue("fs_phone"),
        Email: getFieldValue("fs_email"),
        PromoterNameAddress: getFieldValue("fs_director"),
        EntityType: getFieldValue("fs_entitytype"),
        PanAadhar: getFieldValue("fs_pan"),
        NatureOfBusiness: getFieldValue("fs_business"),
        EntityPan: getFieldValue("fs_epan"),
        DOB: getFieldValue("fs_dob") || null,
        Gender: getFieldValue("fs_gender"),
        MaritalStatus: getFieldValue("fs_marital"),
        FatherMotherSpouseName: getFieldValue("fs_family"),
        Area: getFieldValue("fs_area"),
        Ward: getFieldValue("fs_ward"),
        Zone: getFieldValue("fs_zone"),
        ProductServiceSold: getFieldValue("fs_product"),
        ClientSource: getFieldValue("fs_source"),
        SourcedByEmpId: getFieldValue("fs_sourcedby") ? parseInt(getFieldValue("fs_sourcedby")) : null,
        Comments: getFieldValue("fs_comments"),
        Login: getFieldValue("fs_login"),
        Password: getFieldValue("fs_password"),
        ModifiedBy: 1 // As requested, keep ModifiedBy as 1
    };

    return data;
}

// Get Field Value Helper
function getFieldValue(fieldId) {
    const input = $(`#${fieldId}_input`);
    if (input.length) {
        return input.val().trim();
    }
    return "";
}

// Save Frontsheet (Create or Update)
function saveFrontsheet(data, ids) {
    const url = data.Id > 0 ? '/Frontsheet/UpdateFrontsheet' : '/Frontsheet/CreateFrontsheet';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                // Update UI with saved values
                updateUIAfterSave(ids);

                // Update current ID if it was a new record
                if (!currentFrontsheetId && response.data && response.data.Id) {
                    currentFrontsheetId = response.data.Id;
                    localStorage.setItem('currentFrontsheetId', currentFrontsheetId);
                }

                showNotification('Frontsheet saved successfully!', 'success');
            } else {
                showNotification('Error saving frontsheet: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error saving frontsheet:', error);
            showNotification('Failed to save frontsheet', 'error');
        }
    });
}

// Update UI After Save
function updateUIAfterSave(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const input = el.querySelector("input");
        const textarea = el.querySelector("textarea");
        const select = el.querySelector("select");

        let value = "";
        if (input) value = input.value || "—";
        else if (textarea) value = textarea.value || "—";
        else if (select) value = select.options[select.selectedIndex].text || "—";

        el.innerHTML = value;
    });

    $("#frontsheetEditBtn").text("Edit Form");
    $("#frontsheetEditBtn").css("background", "#0f1445");
}

// Create New Frontsheet
function createNewFrontsheet() {
    if (confirm('Are you sure you want to create a new frontsheet? Unsaved changes will be lost.')) {
        currentFrontsheetId = null;
        localStorage.removeItem('currentFrontsheetId');
        clearForm();
        $("#frontsheetEditBtn").click();
    }
}

function clearForm() {
    const ids = [
        "fs_name", "fs_address", "fs_phone", "fs_email", "fs_director",
        "fs_entitytype", "fs_pan", "fs_business", "fs_epan",
        "fs_dob", "fs_gender", "fs_marital", "fs_family",
        "fs_area", "fs_ward", "fs_zone", "fs_product",
        "fs_source", "fs_sourcedby", "fs_comments",
        "fs_login", "fs_password", "fs_details",
        "fs_docname", "fs_docsign"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "—";
    });
}

function deleteFrontsheet() {
    if (!currentFrontsheetId) {
        showNotification('No frontsheet selected to delete', 'warning');
        return;
    }

    if (confirm('Are you sure you want to delete this frontsheet? This action cannot be undone.')) {
        $.ajax({
            url: '/Frontsheet/DeleteFrontsheet',
            type: 'POST',
            data: { id: currentFrontsheetId },
            success: function (response) {
                if (response.success) {
                    showNotification('Frontsheet deleted successfully!', 'success');
                    currentFrontsheetId = null;
                    localStorage.removeItem('currentFrontsheetId');
                    clearForm();
                    loadFrontsheetList();
                } else {
                    showNotification('Error deleting frontsheet: ' + response.message, 'error');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error deleting frontsheet:', error);
                showNotification('Failed to delete frontsheet', 'error');
            }
        });
    }
}

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateForInput(dateString) {
    if (!dateString || dateString === "—") return "";

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return "";
}

function showNotification(message, type) {
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    } else {
        alert(message);
    }
}

function printFrontsheet() {
    window.print();
}