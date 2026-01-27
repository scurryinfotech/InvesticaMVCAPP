document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = (document.getElementById('password').value || '').trim();

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }


    const redirect = sessionStorage.getItem('postLoginRedirect') || 'InvesticaDashboard.html';
    sessionStorage.setItem('loggedIn', '1');
    window.location.href = redirect;
});