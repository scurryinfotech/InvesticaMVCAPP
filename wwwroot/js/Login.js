document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("/Home/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            alert("Invalid credentials");
            return;
        }

        const data = await response.json();

        // ✅ STORE ROLE (this is the missing part)
        sessionStorage.setItem("userRole", data.role);

        // redirect both roles to dashboard
        if (data.role === "Admin" || data.role === "Editor") {
            window.location.href = "/Home/Dashboard";
        } else {
            alert("Access denied");
        }
    }
    catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});
