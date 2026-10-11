// Ye file browser me chalti hai (server pe nahi).
// Kaam: form ka data lekar API ko fetch() se bhejna, token save karna, redirect karna.

const TOKEN_KEY = 'token';

// ---------- Helpers ----------

// Form ke andar wale message <p> me text dikhata hai
function showMessage(text, type = 'error') {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.className = `message ${type}`;   // CSS me .error / .success ka color alag hai
}

// Zod ka error object { properties: { email: { errors: [...] } } } jaisa aata hai.
// Usme se pehla readable message nikaal lete hain.
function readError(message) {
    if (typeof message === 'string') return message;
    const props = message?.properties || {};
    for (const field in props) {
        const errs = props[field]?.errors;
        if (errs?.length) return `${field}: ${errs[0]}`;
    }
    return message?.errors?.[0] || 'Kuch galat ho gaya';
}

// Common function jo dono forms use karte hain
async function sendForm(form, url, successMsg) {
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form)); // {email: '...', password: '...'}

    button.disabled = true;
    button.classList.add('loading');
    showMessage('');

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!json.success) {
            showMessage(readError(json.message));
            return;
        }

        localStorage.setItem(TOKEN_KEY, json.payload.token);
        showMessage(successMsg, 'success');
        setTimeout(() => (window.location.href = '/dashboard'), 600);
    } catch (err) {
        showMessage('Server se connect nahi ho paya');
    } finally {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// ---------- Login page ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();                  // page reload rokta hai
        sendForm(loginForm, '/users/login', 'Login ho gaya!');
    });
}

// ---------- Signup page ----------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendForm(signupForm, '/users', 'Account ban gaya!');
    });
}

// ---------- Dashboard page ----------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) window.location.href = '/login';   // token nahi = login nahi

    // Protected API ko token ke saath call karke check karte hain ki token valid hai
    fetch('/todos/hello', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
            if (res.status === 401) {               // token expire/galat
                localStorage.removeItem(TOKEN_KEY);
                window.location.href = '/login';
                return;
            }
            document.getElementById('status').textContent = 'Active ✓';
            // JWT ka beech wala hissa (payload) base64 hota hai, use decode karke userId padh sakte hain
            const payload = JSON.parse(atob(token.split('.')[1]));
            document.getElementById('userId').textContent = payload.userId.slice(-6);
        });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
    });
}
