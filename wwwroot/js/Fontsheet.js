// Frontsheet.js - Complete CRUD Operations

let currentFrontsheetId = null;

// Load all Frontsheets on page load
$(document).ready(function () {
    loadFrontsheetList();
    loadFrontsheetData();
    initializeEventHandlers();
});

// Initialize Event Handlers            
// Initialize Event Handlers
function initializeEventHandlers() {
    $("#frontsheetEditBtn").on("click", toggleEditMode);
    $("#createNewFrontsheet").on("click", createNewFrontsheet);
    $("#deleteFrontsheet").on("click", deleteFrontsheet);

    // Frontsheet Selector Change Event
    $("#frontsheetSelector").on("change", function () {
        const selected = $(this).val();
        const id = selected ? parseInt(selected, 10) : NaN;
        if (!isNaN(id)) {
            loadFrontsheetById(id);
        } else {
            console.warn('Invalid frontsheet id selected:', selected);
        }
    });
}

// Load Frontsheet List (for dropdown)
function loadFrontsheetList() {
    console.log('Loading frontsheet list...');
    $.ajax({
        url: '/Frontsheet',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('Frontsheet list response:', response);
            if (response.success) {
                debugger
                populateFrontsheetDropdown(response.data);
            } else {
                showNotification('Error loading frontsheets: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading frontsheets:', error);
            console.error('XHR:', xhr);
            showNotification('Failed to load frontsheets', 'error');
        }
    });
}

// Populate Frontsheet Dropdown - robust property names
// Populate Frontsheet Dropdown
function populateFrontsheetDropdown(frontsheets) {
    const dropdown = $("#frontsheetSelector");
    dropdown.empty();
    dropdown.append('<option value="">-- Select Frontsheet --</option>');

    if (frontsheets && frontsheets.length > 0) {
        frontsheets.forEach(fs => {
           
            const idValue = fs.Id ?? fs.id ?? fs.ID ?? "";
            const displayName = fs.EntityName ?? fs.entityName ?? `Frontsheet #${idValue || 'unknown'}`;
            dropdown.append(`<option value="${idValue}">${displayName}</option>`);
        });
    } else {
        console.log('No frontsheets found');
    }
}

// Load Frontsheet by ID
function loadFrontsheetById(id) {
    if (typeof id !== 'number' || isNaN(id)) {
        console.error('loadFrontsheetById called with invalid id:', id);
        return;
    }

    debugger
    $.ajax({
        url: `/Frontsheet/${id}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('Frontsheet data response:', response);
            if (response.success) {
                currentFrontsheetId = id;
                populateFrontsheetForm(response.data);
                localStorage.setItem('currentFrontsheetId', id);
                $("#frontsheetSelector").val(String(id));
            } else {
                showNotification('Error loading frontsheet: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading frontsheet:', error);
            console.error('XHR:', xhr);
            showNotification('Failed to load frontsheet data', 'error');
        }
    });
}

// Load Frontsheet Data (initial load or from localStorage)
function loadFrontsheetData() {
    const urlParams = new URLSearchParams(window.location.search);
    const frontsheetId = urlParams.get('id') || localStorage.getItem('currentFrontsheetId');

    if (frontsheetId) {
        loadFrontsheetById(parseInt(frontsheetId));
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const company = localStorage.getItem("sum_company") || "—";
    const address = localStorage.getItem("sum_address") || "—";

    document.getElementById("fs_name").innerText = company;
    document.getElementById("fs_address").innerText = address;
}

// Populate Frontsheet Form with data
function populateFrontsheetForm(data) {

    // Basic Information
    $("#fs_name").text(data.entityName || "—");
    $("#fs_address").text(data.ctaddress || "—");
    $("#fs_phone").text(data.phone || "—");
    $("#fs_email").text(data.email || "—");

    $("#fs_director").text(data.promoterNameAddress || "—");
    $("#fs_entitytype").text(data.entityType || "—");
    $("#fs_pan").text(data.panAadhar || "—");

    $("#fs_business").text(data.natureOfBusiness || "—");
    $("#fs_epan").text(data.entityPan || "—");

    $("#fs_dob").text(data.dob ? formatDate(data.dob) : "—");
    $("#fs_gender").text(data.gender || "—");
    $("#fs_marital").text(data.maritalStatus || "—");
    $("#fs_family").text(data.fatherMotherSpouseName || "—");

    $("#fs_area").text(data.area || "—");
    $("#fs_ward").text(data.ward || "—");
    $("#fs_zone").text(data.zone || "—");

    $("#fs_product").text(data.productServiceSold || "—");

    $("#fs_source").text(data.clientSource || "—");
    $("#fs_sourcedby").text(data.sourcedByEmpId || "—");

    $("#fs_comments").text(data.comments || "—");
    $("#fs_login").text(data.login || "—");
    $("#fs_password").text(data.password || "—");
    $("#fs_details").text("—"); // no matching field in response

    $("#fs_docname").text("—");
    $("#fs_docsign").text("—");


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
        ModifiedBy: 1
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
    debugger
    console.log('Saving frontsheet:', data);
    const url = data.Id > 0 ? `/Frontsheet/${data.Id}` : '/Frontsheet';
    const method = data.Id > 0 ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            console.log('Save response:', response);
            if (response.success) {
                updateUIAfterSave(ids);

                if (!currentFrontsheetId && response.data && response.data.Id) {
                    currentFrontsheetId = response.data.Id;
                    localStorage.setItem('currentFrontsheetId', currentFrontsheetId);
                }

                loadFrontsheetList(); // Refresh the dropdown
                showNotification('Frontsheet saved successfully!', 'success');
            } else {
                showNotification('Error saving frontsheet: ' + response.message, 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error saving frontsheet:', error);
            console.error('XHR:', xhr);
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
        $("#frontsheetSelector").val('');
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
            url: `/Frontsheet/${currentFrontsheetId}`,
            type: 'DELETE',
            success: function (response) {
                if (response.success) {
                    showNotification('Frontsheet deleted successfully!', 'success');
                    currentFrontsheetId = null;
                    localStorage.removeItem('currentFrontsheetId');
                    clearForm();
                    $("#frontsheetSelector").val('');
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