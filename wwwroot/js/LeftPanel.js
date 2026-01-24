// Searchable Dropdown Function for Text Inputs
function makeSearchableDropdown(inputId, options) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.log(`Element with id "${inputId}" not found`);
        return;
    }

    // Create dropdown container
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'searchable-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.right = '0';
    dropdown.style.background = 'white';
    dropdown.style.border = '1px solid #ced4da';
    dropdown.style.borderRadius = '4px';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '1050';
    dropdown.style.marginTop = '2px';
    dropdown.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    wrapper.appendChild(dropdown);

    // Populate dropdown
    function populateDropdown(filterText = '') {
        dropdown.innerHTML = '';
        const filtered = options.filter(opt =>
            opt.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            const noResult = document.createElement('div');
            noResult.textContent = 'No results found';
            noResult.style.padding = '10px 12px';
            noResult.style.color = '#6c757d';
            noResult.style.textAlign = 'center';
            dropdown.appendChild(noResult);
        } else {
            filtered.forEach(option => {
                const item = document.createElement('div');
                item.textContent = option;
                item.style.padding = '10px 12px';
                item.style.cursor = 'pointer';

                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    input.value = option;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(item);
            });
        }
    }

    // Show dropdown on focus
    input.addEventListener('focus', () => {
        populateDropdown(input.value);
        dropdown.style.display = 'block';
    });

    // Filter on input
    input.addEventListener('input', () => {
        populateDropdown(input.value);
        dropdown.style.display = 'block';
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Searchable Dropdown for Select Elements
function makeSearchableSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.log(`Select element with id "${selectId}" not found`);
        return;
    }

    // Get options from select
    const options = Array.from(select.options)
        .filter(opt => opt.value !== '')
        .map(opt => ({ text: opt.text, value: opt.value }));

    // Create input to replace select
    const input = document.createElement('input');
    input.type = 'text';
    input.className = select.className;
    input.id = select.id + '_search';
    input.placeholder = select.options[0].text;
    input.autocomplete = 'off';

    // Create container
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(input);
    select.style.display = 'none';
    wrapper.appendChild(select);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'searchable-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.right = '0';
    dropdown.style.background = 'white';
    dropdown.style.border = '1px solid #ced4da';
    dropdown.style.borderRadius = '4px';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '1050';
    dropdown.style.marginTop = '2px';
    dropdown.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    wrapper.appendChild(dropdown);

    // Populate dropdown
    function populateDropdown(filterText = '') {
        dropdown.innerHTML = '';

        // Add empty option
        const emptyItem = document.createElement('div');
        emptyItem.textContent = select.options[0].text;
        emptyItem.style.padding = '10px 12px';
        emptyItem.style.cursor = 'pointer';
        emptyItem.style.color = '#6c757d';
        emptyItem.addEventListener('mouseenter', () => {
            emptyItem.style.background = '#f0f0f0';
        });
        emptyItem.addEventListener('mouseleave', () => {
            emptyItem.style.background = 'white';
        });
        emptyItem.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            select.value = '';
            dropdown.style.display = 'none';
        });
        dropdown.appendChild(emptyItem);

        const filtered = options.filter(opt =>
            opt.text.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            const noResult = document.createElement('div');
            noResult.textContent = 'No results found';
            noResult.style.padding = '10px 12px';
            noResult.style.color = '#6c757d';
            noResult.style.textAlign = 'center';
            dropdown.appendChild(noResult);
        } else {
            filtered.forEach(option => {
                const item = document.createElement('div');
                item.textContent = option.text;
                item.style.padding = '10px 12px';
                item.style.cursor = 'pointer';

                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    input.value = option.text;
                    select.value = option.value;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(item);
            });
        }
    }

    // Show dropdown on focus
    input.addEventListener('focus', () => {
        populateDropdown(input.value);
        dropdown.style.display = 'block';
    });

    // Filter on input
    input.addEventListener('input', () => {
        populateDropdown(input.value);
        dropdown.style.display = 'block';
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function initSearchableDropdowns() {

    const companies = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Industries', 'Innovation Inc', 'Acme Corporation'];
    const locations = ['New York', 'London', 'Tokyo', 'Mumbai', 'Singapore', 'Dubai', 'Paris', 'Berlin'];

    makeSearchableDropdown('companyName', companies);
    makeSearchableDropdown('location', locations);
    makeSearchableDropdown('frontsheetCompany', companies);
    makeSearchableDropdown('frontsheetLocation', locations);

    // Initialize select dropdowns
    makeSearchableSelect('licenseType');
    makeSearchableSelect('status');

}

 //Multiple initialization approaches to ensure it works
// Approach 1: DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchableDropdowns);
} else {
    initSearchableDropdowns();
}
