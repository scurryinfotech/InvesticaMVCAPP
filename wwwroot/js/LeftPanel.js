$(document).ready(function () {


    initializeSearchableDropdowns();

    // Load data
    loadCompanies();
    loadLocations();
    loadLicenseTypes();
    loadStatuses();


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

                if (e.keyCode === 40) { 
                    e.preventDefault();
                    if ($active.length === 0) {
                        $next = $visibleItems.first();
                    } else {
                        $next = $active.removeClass('active').nextAll('li:visible').not('.no-results').first();
                        if ($next.length === 0) $next = $visibleItems.first();
                    }
                } else if (e.keyCode === 38) { 
                    e.preventDefault();
                    if ($active.length === 0) {
                        $next = $visibleItems.last();
                    } else {
                        $next = $active.removeClass('active').prevAll('li:visible').not('.no-results').first();
                        if ($next.length === 0) $next = $visibleItems.last();
                    }
                } else if (e.keyCode === 13) { 
                    e.preventDefault();
                    if ($active.length > 0) {
                        $active.click();
                    }
                    return;
                } else if (e.keyCode === 27) { 
                    $list.hide();
                    $input.blur();
                    return;
                } else if (e.keyCode === 8 && isMultiSelect) { 
                    const currentVal = $input.val();
                    if (currentVal.endsWith(', ') || currentVal.endsWith(',')) {
                        e.preventDefault();
                        handleMultiSelectBackspace($input, $hiddenValue);
                    }
                }

                if ($next && $next.length > 0) {
                    $next.addClass('active');
                    // Scroll into view
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
        $(document).on('click', '.searchable-dropdown-list li', function () {
            if ($(this).hasClass('no-results')) return;

            const $item = $(this);
            const $list = $item.parent();
            const $wrapper = $list.parent();
            const $input = $wrapper.find('.searchable-input');
            const $hiddenValue = $wrapper.find('input[type="hidden"]');
            const isMultiSelect = $input.hasClass('multi-select');

            const selectedValue = $item.data('value');
            const selectedText = $item.text();

            if (isMultiSelect) {
                handleMultiSelectAdd($input, $hiddenValue, selectedValue, selectedText, $item);
            } else {
                $input.val(selectedText);
                $hiddenValue.val(selectedValue);
                $list.hide();
            }
        });

        // Hide dropdowns on outside click
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.searchable-dropdown-wrapper').length) {
                $('.searchable-dropdown-list').hide();
            }
        });
    }

    function handleMultiSelectAdd($input, $hiddenValue, selectedValue, selectedText, $item) {
        // Get current values
        let currentValues = $hiddenValue.val() ? $hiddenValue.val().split(',') : [];
        let currentTexts = $input.val() ? $input.val().split(', ').filter(t => t.trim() !== '') : [];

        
        if (currentValues.includes(String(selectedValue))) {
            // Deselect if already selected
            currentValues = currentValues.filter(v => v !== String(selectedValue));
            currentTexts = currentTexts.filter(t => t !== selectedText);
            $item.removeClass('selected');
        } else {
            // Add new selection
            currentValues.push(String(selectedValue));
            currentTexts.push(selectedText);
            $item.addClass('selected');
        }

        // Update values
        $hiddenValue.val(currentValues.join(','));
        $input.val(currentTexts.join(', '));

        const $list = $item.parent();
        $list.find('li').not('.no-results').show();
        $list.find('.no-results').remove();
    }


    function handleMultiSelectBackspace($input, $hiddenValue) {
        let currentValues = $hiddenValue.val() ? $hiddenValue.val().split(',') : [];
        let currentTexts = $input.val() ? $input.val().split(', ').filter(t => t.trim() !== '') : [];

        if (currentValues.length > 0) {
            const removedValue = currentValues.pop();
            const removedText = currentTexts.pop();

            $hiddenValue.val(currentValues.join(','));
            $input.val(currentTexts.length > 0 ? currentTexts.join(', ') + ', ' : '');

            const $list = $input.siblings('.searchable-dropdown-list');
            $list.find(`li[data-value="${removedValue}"]`).removeClass('selected');
        }
    }

    
    function populateSearchableDropdown(selector, data, valueField, textField) {
        const $input = $(selector);
        const $list = $input.siblings('.searchable-dropdown-list');
        const isMultiSelect = $input.hasClass('multi-select');

        $list.empty();

        $.each(data, function (_, item) {
            const value = item[valueField];
            const text = item[textField];

            const $li = $('<li>', {
                'data-value': value,
                text: text
            });

            if (isMultiSelect) {
                $li.addClass('multi-select-item');
            }

            $list.append($li);
        });

        if (isMultiSelect) {
            updateMultiSelectVisualState($input);
        }
    }


    function updateMultiSelectVisualState($input) {
        const $hiddenValue = $input.siblings('input[type="hidden"]');
        const $list = $input.siblings('.searchable-dropdown-list');
        const selectedValues = $hiddenValue.val() ? $hiddenValue.val().split(',') : [];

        $list.find('li').each(function () {
            const $item = $(this);
            const itemValue = String($item.data('value'));

            if (selectedValues.includes(itemValue)) {
                $item.addClass('selected');
            } else {
                $item.removeClass('selected');
            }
        });
    }

  
    function loadCompanies() {
        $.ajax({
            url: '/companies',
            type: 'GET',
            data: { page: 1, pageSize: 1000 },
            success: function (response) {
                populateSearchableDropdown('#companyName', response, 'id', 'companyName');
                populateSearchableDropdown('#frontsheetCompany', response, 'id', 'companyName');
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

                populateSearchableDropdown('#location', locationData, 'id', 'name');
                populateSearchableDropdown('#frontsheetLocation', locationData, 'id', 'name');
            },
            error: function (xhr, status, error) {
                showNotification('Error loading locations', 'error');
            }
        });
    }

   
    function loadLicenseTypes() {
        $.ajax({
            url: '/licensetypes',
            type: 'GET',
            success: function (response) {
                populateSearchableDropdown('#licenseType', response, 'id', 'appTypeName');
            },
            error: function () {
                showNotification('Error loading license types', 'error');
            }
        });
    }

    function loadStatuses() {
        $.ajax({
            url: '/statuses',
            type: 'GET',
            success: function (response) {
                populateSearchableDropdown('#status', response, 'id', 'statusName');
            },
            error: function () {
                showNotification('Error loading statuses', 'error');
            }
        });
    }

   
    function removeEmptyFilters(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== null && v !== '')
        );
    }

    $('#submitBtn').on('click', function (e) {
        e.preventDefault();

        let filters = {
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            companyId: $('#companyNameValue').val(), 
            location: $('#locationValue').val(),
            licenseType: $('#licenseTypeValue').val(),
            status: $('#statusValue').val(),
            trackingNumber: $('#trackingNumber').val(),
            frontsheetDate: $('#frontsheetDate').val(),
            frontsheetCompany: $('#frontsheetCompanyValue').val(),
            frontsheetLocation: $('#frontsheetLocationValue').val(),
            invoiceDate: $('#invoiceDate').val(),
            invoiceNumber: $('#invoiceNumber').val()
        };

        filters = removeEmptyFilters(filters);
        applyFilters(filters);
    });


    function applyFilters(filters) {
      
        const processedFilters = {};

        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'string' && value.includes(',')) {
                processedFilters[key] = value.split(',').map(v => v.trim());
               
            } else {
                processedFilters[key] = value;
            }
        }


        $.ajax({
            url: '/tickets/filter',
            type: 'GET',
            data: processedFilters,
            traditional: true, 
            success: function (response) {
                console.log('Filtered data:', response);
                showNotification('Filters applied successfully', 'success');
            },
            error: function (xhr, status, error) {
                console.error('Failed to apply filters:', status, error, xhr.responseText);
                showNotification('Failed to apply filters', 'error');
            }
        });
    }

   
    $('#clearBtn').on('click', function (e) {
        e.preventDefault();

        $('#filterForm')[0].reset();

        $('.searchable-input').val('');
        $('input[type="hidden"]').val('');

        $('.searchable-dropdown-list li').removeClass('selected');

    });

    
    function showNotification(message, type) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }

});