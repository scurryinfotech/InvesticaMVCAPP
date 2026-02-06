// Frontsheet.js - Complete CRUD with Person Management and Checkboxes
let currentFrontsheetId = null;
let persons = [];
let editing = false;
let isNew = false; // true when creating a new frontsheet

// snapshot to restore if user cancels edit
let frontsheetSnapshot = null;
// cached companies list for lookup
let companiesList = [];

const FIELD_IDS = [
    'fs_crn', 'fs_name_input', 'fs_address', 'fs_phone', 'fs_email', 'fs_cin',
    'fs_entitytype', 'fs_incop', 'fs_business', 'fs_epan',
    'fs_dob', 'fs_gender', 'fs_father', 'fs_marital',
    'fs_area', 'fs_ward', 'fs_zone', 'fs_product',
    'fs_electric', 'fs_proptax', 'fs_sqft', 'fs_otherdoc',
    'fs_source', 'fs_sourcedby', 'fs_crosssell', 'fs_crossdetails',
    'fs_login', 'fs_password', 'fs_details', 'fs_comments',
    'fs_docname', 'fs_docsign'
];

const CHECKBOX_IDS = [
    'cb_pan', 'cb_aadhar', 'cb_entity', 'cb_addr', 'cb_bank', 'cb_photo', 'cb_shop', 'cb_mda'
];

// small helper to read API props regardless of PascalCase / camelCase
function getProp(obj, propName) {
    if (!obj) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, propName)) return obj[propName];
    const camel = propName.charAt(0).toLowerCase() + propName.slice(1);
    if (Object.prototype.hasOwnProperty.call(obj, camel)) return obj[camel];
    const lower = propName.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(obj, lower)) return obj[lower];
    return undefined;
}

// UI references
const personsContainer = document.getElementById('personsContainer');
const addPersonBtn = document.getElementById('addPerson');
const personFormHolder = document.getElementById('personFormHolder');
const editBtn = document.getElementById('editBtn');
const sampleBtn = document.getElementById('sampleBtn');
const cancelBtn = document.getElementById('cancelEditBtn');

// Reusable helper: populate searchable dropdown wrapper
function populateSearchableDropdown(wrapperSelector, items, placeholder) {
    const $wrapper = $(wrapperSelector);
    const $input = $wrapper.find('.searchable-input');
    const $list = $wrapper.find('.searchable-dropdown-list');
    const $hiddenValue = $wrapper.find('input[type="hidden"]');

    $input.attr('placeholder', placeholder || '');

    $list.empty();
    items.forEach(item => {
        const value = item.id ?? item.Id ?? item.ID ?? item;
        const text = item.name ?? item.Name ?? item;
        const li = $('<li class="list-group-item list-group-item-action" />')
            .text(text)
            .attr('data-value', value)
            .data('value', value);
        $list.append(li);
    });

    $list.off('click').on('click', 'li', function () {
        const $li = $(this);
        const selectedValue = $li.data('value');
        const selectedText = $li.text();
        $input.val(selectedText);
        $hiddenValue.val(selectedValue).trigger('change');
        $list.hide();

        // frontsheet selector
        if ($hiddenValue.attr('id') === 'frontsheetSelector' && selectedValue) {
            loadFrontsheetById(Number(selectedValue));
        }

        // inline entity name select: set value on fs_name_input
        if ($hiddenValue.attr('id') === 'companySelector' && selectedValue) {
            $('#fs_name_input').val(selectedText);
        }
    });

    $input.on('input', function () {
        const q = $(this).val().toLowerCase();
        $list.find('li').each(function () {
            const t = $(this).text().toLowerCase();
            $(this).toggle(t.indexOf(q) !== -1);
        });
        $list.show();
    });

    $input.on('focus click', function (e) {
        e.stopPropagation();
        $('.searchable-dropdown-list').not($list).hide();
        $list.show();
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.searchable-dropdown-wrapper').length) {
            $list.hide();
        }
    });
}

// Initialize frontsheet + entitytype dropdowns on page load
function loadFrontsheetDropdowns() {
    $.ajax({
        url: '/Frontsheet/dropdowns',
        type: 'GET',
        success: function (response) {
            const fsItems = response.frontsheets || [];
            const etItems = response.entityTypes || [];
            const cmpItems = response.companies || [];

            companiesList = cmpItems;

            // populate frontsheet searchable wrapper
            populateSearchableDropdown('#frontsheetSelector-wrapper', fsItems, '-- Select Frontsheet --');

            // populate entity type wrapper
            populateSearchableDropdown('#fs_entitytype-wrapper', etItems, 'Select entity type');

            // populate inline entity-name wrapper (fs_name-wrapper) with companies
            populateSearchableDropdown('#fs_name-wrapper', cmpItems, '-- Select or type entity name --');

            const savedId = localStorage.getItem('currentFrontsheetId');
            if (savedId) {
                $('#frontsheetSelector').val(savedId);
                const selected = fsItems.find(f => String(f.id) === String(savedId));
                if (selected) $('#frontsheetSearch').val(selected.name);
            }
        },
        error: function (xhr, status, err) {
            console.error('Failed to load frontsheet dropdowns', err);
        }
    });
}

// Load all Frontsheets on page load
$(document).ready(function () {
    loadFrontsheetDropdowns();
    loadFrontsheetData();
    initializeEventHandlers();
});

// Initialize Event Handlers
function initializeEventHandlers() {
    $("#editBtn").on("click", toggleEditMode);
    $("#createNewFrontsheet").on("click", createNewFrontsheet);
    $("#deleteFrontsheet").on("click", deleteFrontsheet);
    $("#sampleBtn").on("click", fillDemo);
    $("#printBtn").on("click", printFrontsheet);

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            cancelEditMode();
        });
    }

    $("#frontsheetSelector").on("change", function () {
        const selected = $(this).val();
        const id = selected ? parseInt(selected, 10) : NaN;
        if (!isNaN(id)) {
            loadFrontsheetById(id);
        }
    });

    if (addPersonBtn) {
        addPersonBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            openPersonForm(null);
        });
    }
}

// ===== PERSON MANAGEMENT =====
// (unchanged code)...
// ... (keep same person functions)
function renderPersons() { /* unchanged */ }
function createPersonField(label, value, idx, type) { /* unchanged */ }
function onRemovePerson(e) { /* unchanged */ }
function openPersonForm(idx = null) { /* unchanged */ }
function createFormColumn(label, type, value, placeholder, rows = null) { /* unchanged */ }
function closePersonForm() { /* unchanged */ }

// JSON load helpers (unchanged skeleton)
function loadFrontsheetList() { /* unchanged */ }
function populateFrontsheetDropdown(frontsheets) { /* unchanged */ }

function loadFrontsheetById(id) {
    if (typeof id !== 'number' || isNaN(id)) {
        console.error('Invalid frontsheet ID:', id);
        return;
    }

    $.ajax({
        url: `/Frontsheet/${id}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
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
            showNotification('Failed to load frontsheet data', 'error');
        }
    });
}

function loadFrontsheetData() {
    const urlParams = new URLSearchParams(window.location.search);
    const frontsheetId = urlParams.get('id') || localStorage.getItem('currentFrontsheetId');

    if (frontsheetId) {
        loadFrontsheetById(parseInt(frontsheetId));
    } else {
        persons = [{ name: '', address: '', pan: '', aadhar: '' }];
        renderPersons();
    }
}

function populateFrontsheetForm(data) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = (val !== undefined && val !== null && String(val).trim() !== '') ? val : '—';
    };

    const setCheckbox = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!val;
    };

    // Basic fields
    set('fs_crn', getProp(data, 'CRNNo'));
    $('#fs_name_input').val(getProp(data, 'EntityName') ?? '—');
    set('fs_address', getProp(data, 'Address'));
    set('fs_phone', getProp(data, 'Phone'));
    set('fs_email', getProp(data, 'Email'));
    set('fs_cin', getProp(data, 'CINNumber'));

    // Entity type etc.
    set('fs_entitytype', getProp(data, 'EntityType'));
    set('fs_incop', getProp(data, 'DateOfIncorporation'));
    set('fs_epan', getProp(data, 'EntityPan'));
    set('fs_business', getProp(data, 'NatureOfBusiness'));

    // Personal details
    set('fs_dob', getProp(data, 'DOB'));
    set('fs_gender', getProp(data, 'Gender'));
    set('fs_father', getProp(data, 'FatherMotherSpouseName'));
    set('fs_marital', getProp(data, 'MaritalStatus'));

    // Location
    set('fs_area', getProp(data, 'Area'));
    set('fs_ward', getProp(data, 'Ward'));
    set('fs_zone', getProp(data, 'Zone'));
    set('fs_product', getProp(data, 'ProductServiceSold'));

    // Additional
    set('fs_electric', getProp(data, 'ElectricBillNo'));
    set('fs_proptax', getProp(data, 'PropertyTaxNo'));
    set('fs_sqft', getProp(data, 'SqFt'));
    set('fs_otherdoc', getProp(data, 'OtherDetails'));

    set('fs_source', getProp(data, 'ClientSource'));
    set('fs_sourcedby', getProp(data, 'SourcedByEmpId'));

    set('fs_crosssell', getProp(data, 'CrossSell'));
    set('fs_crossdetails', getProp(data, 'CrossSellDetails'));

    set('fs_comments', getProp(data, 'Comments'));
    set('fs_login', getProp(data, 'Login'));
    set('fs_password', getProp(data, 'Password'));
    set('fs_details', getProp(data, 'InternalDetails'));

    set('fs_docname', getProp(data, 'ScannedByName'));
    set('fs_docsign', getProp(data, 'ScannedBySign'));

    // Checkboxes
    setCheckbox('cb_pan', getProp(data, 'DocPAN'));
    setCheckbox('cb_aadhar', getProp(data, 'DocAadhar'));
    setCheckbox('cb_entity', getProp(data, 'DocEntity'));
    setCheckbox('cb_addr', getProp(data, 'DocAddress'));
    setCheckbox('cb_bank', getProp(data, 'DocBank'));
    setCheckbox('cb_photo', getProp(data, 'DocPhoto'));
    setCheckbox('cb_shop', getProp(data, 'DocShop'));
    setCheckbox('cb_mda', getProp(data, 'DocMDA'));

    // Persons
    const personsRaw = getProp(data, 'Persons') ?? getProp(data, 'persons');
    if (Array.isArray(personsRaw) && personsRaw.length > 0) {
        persons = personsRaw.map(p => ({
            name: (p.Name ?? p.name) || '',
            address: (p.Address ?? p.address) || '',
            pan: (p.PAN ?? p.pan) || '',
            aadhar: (p.Aadhar ?? p.aadhar) || ''
        }));
    } else {
        persons = [{ name: '', address: '', pan: '', aadhar: '' }];
    }

    // Set companyId hidden (if provided)
    const companyId = getProp(data, 'CompanyId') ?? getProp(data, 'companyId');
    if (companyId) {
        $('#companySelector').val(companyId);
        const c = companiesList.find(x => String(x.id) === String(companyId));
        if (c) {
            $('#fs_name_input').val(c.name);
        }
    } else {
        $('#companySelector').val('');
    }

    renderPersons();
}

function toggleEditMode() {
    // if entering edit mode for existing record, capture snapshot
    if (!editing && currentFrontsheetId) {
        captureSnapshot();
    }

    editing = !editing;

    if (editing) {
        setContentEditableForAll(true);
        $("#editBtn").text("Save Form").css("background", "#28a745");
        if (cancelBtn) $(cancelBtn).show();
    } else {
        // Validate before save
        if (!validateBeforeSave()) {
            // keep user in edit mode to fix
            editing = true;
            setContentEditableForAll(true);
            $("#editBtn").text("Save Form").css("background", "#28a745");
            if (cancelBtn) $(cancelBtn).show();
            return;
        }

        const formData = collectFormData();
        saveFrontsheet(formData);
    }
}

function setContentEditableForAll(state) {
    // static fields (contenteditable)
    FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // for the inline name input use value, not contentEditable
            if (id === 'fs_name_input') return;
            el.contentEditable = state ? 'true' : 'false';
        }
    });

    // checkboxes
    CHECKBOX_IDS.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) cb.disabled = !state;
    });

    // entity type display input readonly toggle
    $('#fs_entitytype_display').prop('readonly', !state);
    // fs_name inline input readonly toggle
    $('#fs_name_input').prop('readonly', !state);

    // visual styling to indicate editable state (kept minimal)
    const allEditable = document.querySelectorAll('#frontsheet .value, #frontsheet .small-value, #frontsheet .details');
    allEditable.forEach(el => {
        if (state) {
            el.style.outline = '2px dashed #0f1445';
            el.style.background = '#fffef0';
        } else {
            el.style.outline = 'none';
            el.style.background = '';
        }
    });

    // person remove buttons visibility
    const remBtns = document.querySelectorAll('.remove-person-btn');
    remBtns.forEach(b => b.style.visibility = state ? 'visible' : 'hidden');
}

function validateBeforeSave() {
    const entityName = ($('#fs_name_input').val() || '').trim();
    const address = ($('#fs_address').text() || '').trim();

    if (!entityName || entityName === '—') {
        showNotification('Entity / Company Name is required before saving.', 'warning');
        return false;
    }
    if (!address || address === '—') {
        showNotification('Address is required before saving.', 'warning');
        return false;
    }
    return true;
}

function collectFormData() {
    const get = (id) => {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : '';
    };

    const getCheckbox = (id) => {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    };

    const selectedCompanyId = $('#companySelector').val();
    const companyIdVal = selectedCompanyId ? parseInt(selectedCompanyId) : null;
    const entityNameFromInput = $('#fs_name_input').val() || get('fs_name');

    const personsData = persons
        .filter(p => p.name && p.name !== '—')
        .map((p, idx) => ({
            Name: p.name,
            Address: p.address,
            PAN: p.pan,
            Aadhar: p.aadhar,
            DisplayOrder: idx
        }));

    return {
        Id: currentFrontsheetId || 0,
        CompanyId: companyIdVal,
        CRNNo: get('fs_crn'),
        EntityName: entityNameFromInput,
        Address: get('fs_address',
        Phone: get('fs_phone',
        Email: get('fs_email',
        CINNumber: get('fs_cin',
        EntityType: $('#fs_entitytype_display').val() || get('fs_entitytype',
        DateOfIncorporation: get('fs_incop' || null,
        EntityPan: get('fs_epan',
        NatureOfBusiness: get('fs_business',
        DOB: get('fs_dob' || null,
        Gender: get('fs_gender',
        FatherMotherSpouseName: get('fs_father',
        MaritalStatus: get('fs_marital',
        Area: get('fs_area',
        Ward: get('fs_ward',
        Zone: get('fs_zone',
        ProductServiceSold: get('fs_product',
        ElectricBillNo: get('fs_electric',
        PropertyTaxNo: get('fs_proptax',
        SqFt: get('fs_sqft',
        OtherDetails: get('fs_otherdoc',
        ClientSource: get('fs_source',
        SourcedByEmpId: get('fs_sourcedby' ? parseInt(get('fs_sourcedby' : null,
        DocPAN: getCheckbox('cb_pan',
        DocAadhar: getCheckbox('cb_aadhar',
        DocEntity: getCheckbox('cb_entity',
        DocAddress: getCheckbox('cb_addr',
        DocBank: getCheckbox('cb_bank',
        DocPhoto: getCheckbox('cb_photo',
        DocShop: getCheckbox('cb_shop',
        DocMDA: getCheckbox('cb_mda',
        CrossSell: get('fs_crosssell',
        CrossSellDetails: get('fs_crossdetails',
        Comments: get('fs_comments',
        Login: get('fs_login',
        Password: get('fs_password',
        InternalDetails: get('fs_details',
        ScannedByName: get('fs_docname',
        ScannedBySign: get('fs_docsign',
        Persons: personsData
    };
}

function saveFrontsheet(data) {
    const url = data.Id > 0 ? `/Frontsheet/${data.Id}` : '/Frontsheet/Create';
    const method = data.Id > 0 ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                const returnedId = (response.data && (response.data.Id ?? response.data.id)) ?? null;
                if (!currentFrontsheetId && returnedId) {
                    currentFrontsheetId = returnedId;
                    localStorage.setItem('currentFrontsheetId', currentFrontsheetId);
                }

                setContentEditableForAll(false);
                editing = false;
                isNew = false;
                frontsheetSnapshot = null;
                if (cancelBtn) $(cancelBtn).hide();
                $("#editBtn").text("Edit Form").css("background", "#0f1445");

                loadFrontsheetList();
                showNotification('Frontsheet saved successfully!', 'success');
            } else {
                const msg = response.message || 'Error saving frontsheet';
                showNotification(msg, 'error');
                console.error('saveFrontsheet failure (server returned success=false):', response);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error saving frontsheet:', status, error, xhr.responseText);
            try {
                const body = JSON.parse(xhr.responseText);
                if (body && (body.message || body.errors)) {
                    const serverMsg = body.message || JSON.stringify(body.errors);
                    showNotification('Save failed: ' + serverMsg, 'error');
                } else {
                    showNotification('Failed to save frontsheet: ' + (xhr.statusText || error), 'error');
                }
            } catch (e) {
                showNotification('Failed to save frontsheet: ' + (xhr.statusText || error), 'error');
            }
        }
    });
}

function createNewFrontsheet() {
    if (!confirm('Create a new frontsheet? Unsaved changes will be lost.')) return;

    isNew = true;
    currentFrontsheetId = null;
    localStorage.removeItem('currentFrontsheetId');
    $("#frontsheetSelector").val('');
    clearForm();
    persons = [{ name: '', address: '', pan: '', aadhar: '' }];
    renderPersons();

    // enter edit mode with Save + Discard visible
    editing = true;
    setContentEditableForAll(true);
    $("#editBtn").text("Save Form").css("background", "#28a745");
    if (cancelBtn) $(cancelBtn).show();
}

function clearForm() {
    FIELD_IDS.forEach(id => {
        if (id === 'fs_name_input') {
            $('#fs_name_input').val('');
            return;
        }
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
    });
    CHECKBOX_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });
    $('#companySelector').val('');
    $('#fs_entitytype_display').val('');
}

function deleteFrontsheet() { /* unchanged */ }

function fillDemo() { /* unchanged; keep same demo data */ }

function printFrontsheet() { /* unchanged */ }

function showNotification(message, type) {
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    } else {
        alert(message);
    }
}

window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (editing) {
            const formData = collectFormData();
            saveFrontsheet(formData);
        }
    }
});

// --- Snapshot helpers so Discard can restore previous non-editable state
function captureSnapshot() {
    const snapshot = {
        fields: {},
        checkboxes: {},
        persons: JSON.parse(JSON.stringify(persons || [])),
        companySelector: $('#companySelector').val() || '',
        fsNameInput: $('#fs_name_input').val() || '',
        entityTypeDisplay: $('#fs_entitytype_display').val() || ''
    };

    FIELD_IDS.forEach(id => {
        if (id === 'fs_name_input') {
            snapshot.fields[id] = $('#fs_name_input').val() || null;
            return;
        }
        const el = document.getElementById(id);
        snapshot.fields[id] = el ? el.textContent : null;
    });

    CHECKBOX_IDS.forEach(id => {
        const cb = document.getElementById(id);
        snapshot.checkboxes[id] = cb ? cb.checked : false;
    });

    frontsheetSnapshot = snapshot;
}

function restoreSnapshot() {
    if (!frontsheetSnapshot) return;

    const snapshot = frontsheetSnapshot;

    FIELD_IDS.forEach(id => {
        if (id === 'fs_name_input') {
            $('#fs_name_input').val(snapshot.fields[id] || '');
            return;
        }
        const el = document.getElementById(id);
        if (el && snapshot.fields.hasOwnProperty(id)) el.textContent = snapshot.fields[id];
    });

    CHECKBOX_IDS.forEach(id => {
        const cb = document.getElementById(id);
        if (cb && snapshot.checkboxes.hasOwnProperty(id)) cb.checked = snapshot.checkboxes[id];
    });

    persons = JSON.parse(JSON.stringify(snapshot.persons || []));
    renderPersons();

    $('#companySelector').val(snapshot.companySelector || '');
    $('#fs_entitytype_display').val(snapshot.entityTypeDisplay || '');
}

function cancelEditMode() {
    if (!editing) return;

    if (isNew) {
        // discard new: clear and exit edit mode
        clearForm();
        isNew = false;
    } else {
        // restore prior values for existing record
        restoreSnapshot();
    }

    setContentEditableForAll(false);
    editing = false;
    frontsheetSnapshot = null;
    $("#editBtn").text("Edit Form").css("background", "#0f1445");
    if (cancelBtn) $(cancelBtn).hide();
}

// Ensure this file is loaded after DOM or placed in bundle
document.addEventListener('click', function (e) {
  // matches button with class add-person or id addPersonBtn
  const btn = e.target.closest('.add-person, #addPersonBtn');
  if (!btn) return;
  e.preventDefault();

  // call add-person logic
  // example: append a new person form row
  const list = document.querySelector('#personsList');
  if (!list) return console.warn('personsList not found');
  const newRow = document.createElement('div');
  newRow.className = 'person-row';
  newRow.innerHTML = `
    <input name="Persons[].Name" placeholder="Name" />
    <input name="Persons[].DOB" placeholder="DOB" />
    <button type="button" class="remove-person">Remove</button>
  `;
  list.appendChild(newRow);
});