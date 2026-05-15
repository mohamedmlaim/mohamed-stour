// process.js
const LAST_VIEWED_KEY = 'lastViewedProduct';

const getLastViewedProduct  = ()     => localStorage.getItem(LAST_VIEWED_KEY);
const saveLastViewedProduct = name   => name && localStorage.setItem(LAST_VIEWED_KEY, name);

// ── Banner ────────────────────────────────────────────────────
const initLastViewedBanner = () => {
    const last = getLastViewedProduct();
    const msg  = last
        ? `👁 Last viewed: ${last}`
        : '👋 Click any product to start browsing.';

    const banner = document.createElement('div');
    banner.id = 'last-viewed-banner';
    banner.textContent = msg;

    const gallery = document.querySelector('.gallery');
    if (gallery) gallery.insertBefore(banner, gallery.firstChild);
};

// ── Track clicks ──────────────────────────────────────────────
const initProductLinks = () => {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const name =
                card.dataset.name ||
                card.querySelector('h3')?.textContent.trim() ||
                card.querySelector('img')?.alt ||
                'Product';
            saveLastViewedProduct(name);
        });
    });
};

// ── User greeting / logout ────────────────────────────────────
const initUserGreeting = () => {
    const raw = sessionStorage.getItem('user');
    if (!raw) return;

    try {
        const user   = JSON.parse(raw);
        const btn    = document.getElementById('login-link');
        const logOut = document.getElementById('logout-btn');

        if (btn && user.firstName) {
            btn.textContent = `👤 ${user.firstName}`;
            btn.href        = '#';
            btn.style.background = 'rgba(255,255,255,0.06)';
            btn.style.boxShadow  = 'none';
            btn.style.border     = '1px solid rgba(255,255,255,0.08)';
        }

        if (logOut) logOut.style.display = 'flex';
    } catch (_) { /* bad JSON in storage — ignore */ }
};

// ── Logout ────────────────────────────────────────────────────
function logout() {
    sessionStorage.removeItem('user');
    window.location.reload();
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initLastViewedBanner();
    initProductLinks();
    initUserGreeting();
});
