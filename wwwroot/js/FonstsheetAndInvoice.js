const STORAGE_KEY = "MASTER_DATA_V1";

function getMasterData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { Employees: [], Companies: [], AppTypes: [], Statuses: [] };
        return JSON.parse(raw);
    } catch {
        return { Employees: [], Companies: [], AppTypes: [], Statuses: [] };
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value ? value : "—";
}

function fetchFSData() {
    // Company info from step-2 localStorage
    const address = localStorage.getItem("wiz_address") || "";
    const license = localStorage.getItem("wiz_license") || "";
    const status = localStorage.getItem("wiz_status") || "Active";

    // Try companyName from left panel (if exists)
    const leftCompany = document.getElementById("companyName")?.value?.trim() || "";

    // MasterData fields (optional)
    const md = getMasterData();

    // Try matching company from master data
    let companyObj = null;
    if (leftCompany && md.Companies && md.Companies.length > 0) {
        companyObj = md.Companies.find(c => (c.name || "").toLowerCase() === leftCompany.toLowerCase());
    }

    companyObj = companyObj || (md.Companies && md.Companies.length > 0 ? md.Companies[0] : null);

    setText("fs_company", leftCompany || companyObj?.name || "");
    setText("fs_address", address || companyObj?.address || "");
    setText("fs_phone", companyObj?.phone || "");
    setText("fs_email", companyObj?.email || "");
    setText("fs_gstin", companyObj?.gstin || "");
    setText("fs_pan", companyObj?.pan || "");
    setText("fs_entity", companyObj?.entityType || "");
    setText("fs_product", companyObj?.product || companyObj?.services || "");
    setText("fs_location", companyObj?.location || "");

    setText("fs_license", license || "");
    setText("fs_status", status || "Active");

    // Save for Summary page
    localStorage.setItem("sum_company", document.getElementById("fs_company").innerText);
    localStorage.setItem("sum_address", document.getElementById("fs_address").innerText);
    localStorage.setItem("sum_license", document.getElementById("fs_license").innerText);
    localStorage.setItem("sum_status", document.getElementById("fs_status").innerText);
}

function goSummary() {
    // Ensure values are fetched before moving
    fetchFSData();
    window.location.href = "/Home/Summary";
}

// Auto fetch on page load
document.addEventListener("DOMContentLoaded", fetchFSData);