// Links.js - binds ShopCategoryLinks and TradeCategoryLinks using fetch()
(() => {
    const qs = (s, r = document) => r.querySelector(s);
    const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
    const api = {
        shop: '/shoplinks',
        trade: '/tradelinks'
    };

    function escapeHtml(s) {
        if (s == null) return '';
        return s.toString().replace(/[&<>"'`=\/]/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
        }[c]));
    }

    async function loadShopLinks() {
        try {
            const res = await fetch(api.shop);
            if (!res.ok) throw new Error('Failed to load shop links');
            const list = await res.json();
            renderShop(list || []);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadTradeLinks() {
        try {
            const res = await fetch(api.trade);
            if (!res.ok) throw new Error('Failed to load trade links');
            const list = await res.json();
            renderTrade(list || []);
        } catch (err) {
            console.error(err);
        }
    }

    function renderShop(items) {
        const tbody = qs('#tblShopLinks tbody');
        tbody.innerHTML = '';
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No shop links available</td></tr>';
            return;
        }
        items.forEach(it => {
            const tr = document.createElement('tr');
            const urlCell = (it.url && it.url.trim())
                ? `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener">${escapeHtml(it.url)}</a>`
                : `<b style="color:red;">OFFLINE</b>`;
            tr.innerHTML = `<td>${escapeHtml(it.stateName)}</td><td>${urlCell}</td>`;
            tbody.appendChild(tr);
        });
    }

    function renderTrade(items) {
        const tbody = qs('#tblTradeLinks tbody');
        tbody.innerHTML = '';
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No trade links available</td></tr>';
            return;
        }
        items.forEach((it, idx) => {
            const tr = document.createElement('tr');
            const website = (it.website && it.website.trim())
                ? `<a href="${escapeHtml(it.website)}" target="_blank" rel="noopener">${escapeHtml(it.website)}</a>`
                : `<b style="color:red;">OFFLINE</b>`;
            tr.innerHTML = `<td>${idx + 1}</td><td>${escapeHtml(it.corporationName)}</td><td>${website}</td>`;
            tbody.appendChild(tr);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadShopLinks();
        loadTradeLinks();
    });
})();