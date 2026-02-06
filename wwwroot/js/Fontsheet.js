// Frontsheet.js - Complete CRUD with Person Management and Checkboxes

let currentFrontsheetId = null;
let persons = [];
let editing = false;

const FIELD_IDS = [
    'fs_crn', 'fs_name', 'fs_address', 'fs_phone', 'fs_email', 'fs_cin',
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
    // direct
    if (Object.prototype.hasOwnProperty.call(obj, propName)) return obj[propName];
    // camelCase fallback (e.g. CRNNo -> crnNo)
    const camel = propName.charAt(0).toLowerCase() + propName.slice(1);
    if (Object.prototype.hasOwnProperty.call(obj, camel)) return obj[camel];
    // all lowercase fallback (rare)
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

// Load all Frontsheets on page load
$(document).ready(function () {
    loadFrontsheetList();
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

    // Frontsheet Selector Change Event
    $("#frontsheetSelector").on("change", function () {
        const selected = $(this).val();
        const id = selected ? parseInt(selected, 10) : NaN;
        if (!isNaN(id)) {
            loadFrontsheetById(id);
        }
    });

    // Person management
    if (addPersonBtn) {
        addPersonBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            openPersonForm(null);
        });
    }
}

// ===== PERSON MANAGEMENT =====

function renderPersons() {
    if (!personsContainer) return;
    personsContainer.innerHTML = '';
    if (!Array.isArray(persons) || persons.length === 0) {
        persons = [{ name: '', address: '', pan: '', aadhar: '' }];
    }

    persons.forEach((p, idx) => {
        const column = document.createElement('div');
        column.className = 'person-column';
        column.setAttribute('data-i', idx);

        // Header
        const header = document.createElement('div');
        header.className = 'person-column-header';

        const numberLabel = document.createElement('div');
        numberLabel.className = 'person-number';
        numberLabel.textContent = `Person ${idx + 1}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-person-btn';
        removeBtn.dataset.i = idx;
        removeBtn.title = 'Remove';
        removeBtn.innerHTML = '✕';
        removeBtn.addEventListener('click', onRemovePerson);

        header.appendChild(numberLabel);
        header.appendChild(removeBtn);
        column.appendChild(header);

        // Name & Designation
        const nameField = createPersonField('NAME & DESIGNATION:', p.name || '—', idx, 'name');
        column.appendChild(nameField);

        // Address
        const addrField = createPersonField('ADDRESS:', p.address || '—', idx, 'address');
        column.appendChild(addrField);

        // PAN
        const panField = createPersonField('PAN:', p.pan || '—', idx, 'pan');
        column.appendChild(panField);

        // AADHAR
        const aadharField = createPersonField('AADHAR:', p.aadhar || '—', idx, 'aadhar');
        column.appendChild(aadharField);

        personsContainer.appendChild(column);
    });

    // Update remove button visibility
    const remBtns = document.querySelectorAll('.remove-person-btn');
    remBtns.forEach(b => b.style.visibility = editing ? 'visible' : 'hidden');
}

function createPersonField(label, value, idx, type) {
    const field = document.createElement('div');
    field.className = 'person-field';

    const fieldLabel = document.createElement('div');
    fieldLabel.className = 'muted';
    fieldLabel.textContent = label;

    const fieldValue = document.createElement('div');
    fieldValue.className = `value person-${type}`;
    fieldValue.dataset.i = idx;
    fieldValue.id = `person_${type}_${idx}`;
    fieldValue.contentEditable = 'false';
    fieldValue.textContent = value;

    field.appendChild(fieldLabel);
    field.appendChild(fieldValue);

    return field;
}

function onRemovePerson(e) {
    e.stopPropagation();
    const i = Number(e.currentTarget.dataset.i);
    if (!Number.isInteger(i)) return;
    persons.splice(i, 1);
    if (persons.length === 0) persons = [{ name: '', address: '', pan: '', aadhar: '' }];
    renderPersons();
}

function openPersonForm(idx = null) {
    if (!personFormHolder) return;
    personFormHolder.innerHTML = '';

    const form = document.createElement('div');
    form.className = 'person-inline-form';
    form.id = 'personInlineForm';

    const model = (idx === null) ? { name: '', address: '', pan: '', aadhar: '' } : Object.assign({}, persons[idx]);

    // Name input
    const col1 = createFormColumn('NAME & DESIGNATION:', 'text', model.name || '', 'Full name and designation');
    form.appendChild(col1);

    // Address input
    const col2 = createFormColumn('ADDRESS:', 'textarea', model.address || '', 'Address', 2);
    form.appendChild(col2);

    // PAN input
    const col3 = createFormColumn('PAN:', 'text', model.pan || '', 'PAN (e.g. AAAPL1234C)');
    form.appendChild(col3);

    // Aadhar input
    const col4 = createFormColumn('AADHAR:', 'text', model.aadhar || '', 'Aadhar (XXXX XXXX XXXX)');
    form.appendChild(col4);

    // Actions
    const actionsCol = document.createElement('div');
    actionsCol.className = 'form-col';
    actionsCol.style.flex = '0 0 160px';

    const actionsHolder = document.createElement('div');
    actionsHolder.className = 'form-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save-person';
    saveBtn.textContent = (idx === null) ? 'Save Person' : 'Update Person';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel-person';
    cancelBtn.textContent = 'Cancel';

    actionsHolder.appendChild(saveBtn);
    actionsHolder.appendChild(cancelBtn);
    actionsCol.appendChild(actionsHolder);
    form.appendChild(actionsCol);

    // Save behavior
    saveBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        const inputs = form.querySelectorAll('input, textarea');
        const values = Array.from(inputs).map(i => i.value.trim());

        const personObj = {
            name: values[0] || '',
            address: values[1] || '',
            pan: values[2] || '',
            aadhar: values[3] || ''
        };

        if (idx === null) {
            persons.push(personObj);
        } else {
            persons[idx] = personObj;
        }

        renderPersons();
        closePersonForm();
    });

    // Cancel behavior
    cancelBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closePersonForm();
    });

    personFormHolder.appendChild(form);

    // Focus first input
    setTimeout(() => {
        const firstInput = form.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
    }, 0);
}

function createFormColumn(label, type, value, placeholder, rows = null) {
    const col = document.createElement('div');
    col.className = 'form-col';

    const lbl = document.createElement('div');
    lbl.className = 'muted';
    lbl.textContent = label;

    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = rows || 2;
    } else {
        input = document.createElement('input');
        input.type = type;
    }

    input.value = value;
    input.placeholder = placeholder;

    col.appendChild(lbl);
    col.appendChild(input);

    return col;
}

function closePersonForm() {
    if (!personFormHolder) return;
    personFormHolder.innerHTML = '';
}

// ===== FRONTSHEET CRUD =====

function loadFrontsheetList() {
    $.ajax({
        url: '/Frontsheet/GetAll',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            debugger
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
    }
}

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

    // use getProp to support both camelCase and PascalCase JSON
    set('fs_crn', getProp(data, 'CRNNo'));
    set('fs_name', getProp(data, 'EntityName'));
    set('fs_address', getProp(data, 'Address'));
    set('fs_phone', getProp(data, 'Phone'));
    set('fs_email', getProp(data, 'Email'));
    set('fs_cin', getProp(data, 'CINNumber'));

    set('fs_entitytype', getProp(data, 'EntityType'));
    set('fs_incop', getProp(data, 'DateOfIncorporation'));
    set('fs_epan', getProp(data, 'EntityPan'));
    set('fs_business', getProp(data, 'NatureOfBusiness'));

    set('fs_dob', getProp(data, 'DOB'));
    set('fs_gender', getProp(data, 'Gender'));
    set('fs_father', getProp(data, 'FatherMotherSpouseName'));
    set('fs_marital', getProp(data, 'MaritalStatus'));

    set('fs_area', getProp(data, 'Area'));
    set('fs_ward', getProp(data, 'Ward'));
    set('fs_zone', getProp(data, 'Zone'));
    set('fs_product', getProp(data, 'ProductServiceSold'));

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

    // Set checkboxes
    setCheckbox('cb_pan', getProp(data, 'DocPAN'));
    setCheckbox('cb_aadhar', getProp(data, 'DocAadhar'));
    setCheckbox('cb_entity', getProp(data, 'DocEntity'));
    setCheckbox('cb_addr', getProp(data, 'DocAddress'));
    setCheckbox('cb_bank', getProp(data, 'DocBank'));
    setCheckbox('cb_photo', getProp(data, 'DocPhoto'));
    setCheckbox('cb_shop', getProp(data, 'DocShop'));
    setCheckbox('cb_mda', getProp(data, 'DocMDA'));

    // Load persons (support both Persons and persons)
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

    renderPersons();
}

function toggleEditMode() {
    editing = !editing;

    if (editing) {
        setContentEditableForAll(true);
        $("#editBtn").text("Save Form").css("background", "#28a745");
    } else {
        const formData = collectFormData();
        saveFrontsheet(formData);
    }
}

function setContentEditableForAll(state) {
    // Static fields
    FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.contentEditable = state ? 'true' : 'false';
    });

    // Checkboxes
    CHECKBOX_IDS.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) cb.disabled = !state;
    });

    // Styling
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

    // Person remove buttons
    const remBtns = document.querySelectorAll('.remove-person-btn');
    remBtns.forEach(b => b.style.visibility = state ? 'visible' : 'hidden');
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

    // Collect persons
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
        CompanyId: null, // Set based on your application logic
        CRNNo: get('fs_crn'),
        EntityName: get('fs_name'),
        Address: get('fs_address'),
        Phone: get('fs_phone'),
        Email: get('fs_email'),
        CINNumber: get('fs_cin'),
        EntityType: get('fs_entitytype'),
        DateOfIncorporation: get('fs_incop') || null,
        EntityPan: get('fs_epan'),
        NatureOfBusiness: get('fs_business'),
        DOB: get('fs_dob') || null,
        Gender: get('fs_gender'),
        FatherMotherSpouseName: get('fs_father'),
        MaritalStatus: get('fs_marital'),
        Area: get('fs_area'),
        Ward: get('fs_ward'),
        Zone: get('fs_zone'),
        ProductServiceSold: get('fs_product'),
        ElectricBillNo: get('fs_electric'),
        PropertyTaxNo: get('fs_proptax'),
        SqFt: get('fs_sqft'),
        OtherDetails: get('fs_otherdoc'),
        ClientSource: get('fs_source'),
        SourcedByEmpId: get('fs_sourcedby') ? parseInt(get('fs_sourcedby')) : null,
        DocPAN: getCheckbox('cb_pan'),
        DocAadhar: getCheckbox('cb_aadhar'),
        DocEntity: getCheckbox('cb_entity'),
        DocAddress: getCheckbox('cb_addr'),
        DocBank: getCheckbox('cb_bank'),
        DocPhoto: getCheckbox('cb_photo'),
        DocShop: getCheckbox('cb_shop'),
        DocMDA: getCheckbox('cb_mda'),
        CrossSell: get('fs_crosssell'),
        CrossSellDetails: get('fs_crossdetails'),
        Comments: get('fs_comments'),
        Login: get('fs_login'),
        Password: get('fs_password'),
        InternalDetails: get('fs_details'),
        ScannedByName: get('fs_docname'),
        ScannedBySign: get('fs_docsign'),
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
                // handle both PascalCase and camelCase id
                const returnedId = (response.data && (response.data.Id ?? response.data.id)) ?? null;
                if (!currentFrontsheetId && returnedId) {
                    currentFrontsheetId = returnedId;
                    localStorage.setItem('currentFrontsheetId', currentFrontsheetId);
                }

                setContentEditableForAll(false);
                editing = false;
                $("#editBtn").text("Edit Form").css("background", "#0f1445");

                loadFrontsheetList();
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

function createNewFrontsheet() {
    if (confirm('Are you sure you want to create a new frontsheet? Unsaved changes will be lost.')) {
        currentFrontsheetId = null;
        localStorage.removeItem('currentFrontsheetId');
        $("#frontsheetSelector").val('');
        clearForm();
        persons = [{ name: '', address: '', pan: '', aadhar: '' }];
        renderPersons();
        $("#editBtn").click();
    }
}

function clearForm() {
    FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
    });
    CHECKBOX_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });
}

function deleteFrontsheet() {
    if (!currentFrontsheetId) {
        showNotification('No frontsheet selected to delete', 'warning');
        return;
    }

    if (confirm('Are you sure you want to delete this frontsheet?')) {
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
                    persons = [{ name: '', address: '', pan: '', aadhar: '' }];
                    renderPersons();
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

function fillDemo() {
    const set = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    };

    const setCheckbox = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = val;
    };

    set('fs_crn', 'CRN-2026-00123');
    set('fs_name', 'INVESTICA MARKETING SOLUTIONS LLP');
    set('fs_address', '12/4 Market Rd, Near Station, Mumbai - 400001');
    set('fs_phone', '+91 98765 43210');
    set('fs_email', 'info@investica.in');
    set('fs_cin', 'U74999MH2015PTC123456');

    set('fs_entitytype', 'LLP');
    set('fs_incop', '15-Mar-2015');
    set('fs_epan', 'AAAPL1234C');
    set('fs_business', 'Retail - Electronics');

    persons = [
        {
            name: 'Rohit Kumar — Director',
            address: '12/4 Market Rd, Mumbai - 400001',
            pan: 'AAAPL1234C',
            aadhar: '1234 5678 9012'
        },
        {
            name: 'Asha Sharma — Partner',
            address: '45/7 Beach Road, Mumbai - 400002',
            pan: 'BBBPL5678D',
            aadhar: '9876 5432 1098'
        }
    ];
    renderPersons();

    set('fs_dob', '01-Jan-1980');
    set('fs_gender', 'Male');
    set('fs_father', 'Mr. K. Kumar');
    set('fs_marital', 'Married');
    set('fs_area', 'Andheri');
    set('fs_ward', 'Ward 14');
    set('fs_zone', 'Zone B');
    set('fs_product', 'Mobile Phones, Accessories');

    set('fs_electric', 'EB-987654321');
    set('fs_proptax', 'PT-54321');
    set('fs_sqft', '850');
    set('fs_otherdoc', 'GST: 27AAAPL1234C1Z2');

    set('fs_source', 'Walk-in');
    set('fs_sourcedby', '21');

    set('fs_crosssell', 'Yes');
    set('fs_crossdetails', 'EMI & Extended Warranty');
    set('fs_comments', 'Preferred contact after 5pm. VIP customer.');
    set('fs_login', 'investica_abc');
    set('fs_password', 'pass@123');
    set('fs_details', 'Onboarded Mumbai branch, KYC verified 10-Feb-2026');
    set('fs_docname', 'Rahul - Ops');
    set('fs_docsign', 'R.K.');

    setCheckbox('cb_pan', true);
    setCheckbox('cb_aadhar', true);
    setCheckbox('cb_addr', true);
    setCheckbox('cb_bank', true);
    setCheckbox('cb_photo', true);
    setCheckbox('cb_mda', true);

    setContentEditableForAll(false);
    editing = false;
    $("#editBtn").text('Edit Form');
}

function printFrontsheet() {
    const wasEditing = editing;

    if (editing) {
        setContentEditableForAll(false);
        editing = false;
        $("#editBtn").text("Edit Form").css("background", "#0f1445");
    }

    const allEditable = document.querySelectorAll('#frontsheet .value, #frontsheet .small-value, #frontsheet .details');
    allEditable.forEach(el => {
        el.style.outline = 'none';
        el.style.background = '';
    });

    const remBtns = document.querySelectorAll('.remove-person-btn');
    remBtns.forEach(b => b.style.visibility = 'hidden');

    setTimeout(function () {
        window.print();

        if (wasEditing) {
            setTimeout(function () {
                setContentEditableForAll(true);
                editing = true;
                $("#editBtn").text("Save Form").css("background", "#28a745");
            }, 100);
        }
    }, 100);
}

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