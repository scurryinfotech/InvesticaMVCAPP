document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // stop normal form submit

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    debugger
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

        if (data.role === "Admin") {
            window.location.href = "/Home/Dashboard";
        }
        else {
            alert("Access denied");
        }
    }
    catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});
