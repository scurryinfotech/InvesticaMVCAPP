document.getElementById("invoiceEditBtn").addEventListener("click", function () {
    const isEditing = this.textContent.trim() === "Save";
    const ids = ["inv_to", "inv_to_address", "inv_to_gst", "inv_number", "inv_date", "inv_gross", "inv_net", "inv_tax", "inv_total"];

    if (!isEditing) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            const val = el.innerText.trim();
            el.innerHTML = `<input class="form-control form-control-sm" value="${val}">`;
        });
        this.textContent = "Save";
        this.style.background = "#28a745";
    } else {
        ids.forEach(id => {
            const el = document.getElementById(id);
            const val = el.querySelector("input").value;
            el.innerHTML = val;
        });
        this.textContent = "Edit";
        this.style.background = "#0f1445";
    }
});