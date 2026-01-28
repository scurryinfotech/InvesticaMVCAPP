$(document).ready(function () {

    const apiBaseUrl = '';

    loadCompanies();
    // loadLocations();
    loadLicenseTypes();
    loadStatuses();


    // Load Companies
    function loadCompanies() {
        $.ajax({
            url: '/companies',
            type: 'GET',
            data: { page: 1, pageSize: 1000 },
            success: function (response) {
                populateDropdown('#companyName', response, 'id', 'companyName');
                populateDropdown('#frontsheetCompany', response, 'id', 'companyName');
            },
            error: function () {
                showNotification('Error loading companies', 'error');
            }
        });
    }

    function loadLocations() {
        $.ajax({
            url: '/companies',
            type: 'GET',
            data: { page: 1, pageSize: 1000 },
            success: function (response) {
                const locations = [...new Set(response.map(item => item.location))].filter(Boolean);
                const locationData = locations.map(loc => ({ id: loc, name: loc }));

                populateDropdown('#location', locationData, 'id', 'name');
                populateDropdown('#frontsheetLocation', locationData, 'id', 'name');
            },
            error: function (xhr, status, error) {
                console.error('Error loading locations:', error);
                showNotification('Error loading locations', 'error');
            }
        });
    }

    // Load License Types
    function loadLicenseTypes() {
        $.ajax({
            url: '/licensetypes',
            type: 'GET',
            success: function (response) {
                populateDropdown('#licenseType', response, 'id', 'appTypeName');
            },
            error: function () {
                showNotification('Error loading license types', 'error');
            }
        });
    }

    // Load Statuses
    function loadStatuses() {
        $.ajax({
            url: '/statuses',
            type: 'GET',
            success: function (response) {
                populateDropdown('#status', response, 'id', 'statusName');
            },
            error: function () {
                showNotification('Error loading statuses', 'error');
            }
        });
    }

    // Populate dropdown helper function
    function populateDropdown(selector, data, valueField, textField) {
        const $dropdown = $(selector);
        const placeholder = $dropdown.find('option:first').text() || '';

        // Clear existing options
        $dropdown.empty();
        $dropdown.append(`<option value="">${placeholder}</option>`);

        // Add new options
        $.each(data, function (_, item) {
            $dropdown.append(
                $('<option>', {
                    value: item[valueField],
                    text: item[textField]
                })
            );
        });

        // Refresh Select2 safely
        if ($dropdown.hasClass('select2-hidden-accessible')) {
            $dropdown.trigger('change');
        }
    }

    // Submit button handler
    $('#submitBtn').on('click', function (e) {
        e.preventDefault();

        const filters = {
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            companyName: $('#companyName').val(),
            location: $('#location').val(),
            licenseType: $('#licenseType').val(),
            status: $('#status').val(),
            trackingNumber: $('#trackingNumber').val(),
            frontsheetDate: $('#frontsheetDate').val(),
            frontsheetCompany: $('#frontsheetCompany').val(),
            frontsheetLocation: $('#frontsheetLocation').val(),
            invoiceDate: $('#invoiceDate').val(),
            invoiceNumber: $('#invoiceNumber').val()
        };

        applyFilters(filters);
    });

    $('#clearBtn').on('click', function (e) {
        e.preventDefault();

        // Clear all input fields
        $('#filterForm')[0].reset();

        // Clear Select2 dropdowns
        $('.searchable-dropdown').val(null).trigger('change');
    });

});
