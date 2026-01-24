document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('dropdown');

    if (!searchInput || !dropdown) return;

    const options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

    dropdown.innerHTML = "";

    options.forEach(option => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = option;

        item.addEventListener('click', () => {
            searchInput.value = option;
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(item);
    });

    searchInput.addEventListener('focus', () => {
        dropdown.style.display = 'block';
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const items = dropdown.querySelectorAll('.dropdown-item');

        let hasVisible = false;

        items.forEach(item => {
            const match = item.textContent.toLowerCase().includes(query);
            item.style.display = match ? 'block' : 'none';
            if (match) hasVisible = true;
        });

        dropdown.style.display = hasVisible ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            dropdown.style.display = 'none';
        }
    });

});
