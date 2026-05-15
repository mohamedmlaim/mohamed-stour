// produit/product.js — shared by all product pages
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('order-form');
    if (!form) return;

    // Pre-fill name/phone if user is logged in
    const raw = sessionStorage.getItem('user');
    if (raw) {
        try {
            const user = JSON.parse(raw);
            const nameField = document.getElementById('o-name');
            if (nameField && user.firstName) {
                nameField.value = `${user.firstName} ${user.lastName || ''}`.trim();
            }
        } catch (_) {}
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous messages
        form.querySelectorAll('.error-msg').forEach(el => el.remove());
        const prevSuccess = form.querySelector('.success-msg');
        if (prevSuccess) prevSuccess.remove();

        const nameField  = document.getElementById('o-name');
        const phoneField = document.getElementById('o-phone');
        const addrField  = document.getElementById('o-address');
        const wilayaField= document.getElementById('o-wilaya');
        const qtyField   = document.getElementById('o-qty');
        const noteField  = document.getElementById('o-note');

        const productName = document.getElementById('product-name')?.value || '';
        const productId   = document.getElementById('product-id')?.value   || '';

        let isValid = true;

        const showErr = (field, msg) => {
            const div = document.createElement('div');
            div.className = 'error-msg';
            div.textContent = msg;
            field.after(div);
            isValid = false;
        };

        if (!nameField.value.trim())  showErr(nameField, 'Full name is required.');

        const phonePattern = /^(05|06|07)[0-9]{8}$/;
        if (!phonePattern.test(phoneField.value.trim())) {
            showErr(phoneField, 'Enter a valid Algerian phone number.');
        }

        if (!addrField.value.trim())   showErr(addrField,   'Address is required.');
        if (!wilayaField.value)        showErr(wilayaField,  'Please select a province.');

        const qty = parseInt(qtyField.value, 10);
        if (isNaN(qty) || qty < 1 || qty > 99) showErr(qtyField, 'Quantity must be 1–99.');

        if (!isValid) return;

        const btn = form.querySelector('.submit-btn');
        btn.textContent  = 'Placing order…';
        btn.disabled     = true;

        // Get user id if logged in
        let userId = 0;
        if (raw) {
            try { userId = JSON.parse(raw).id || 0; } catch (_) {}
        }

        const payload = {
            productName: productName,
            productId:   productId,
            quantity:    qty,
            fullName:    nameField.value.trim(),
            phone:       phoneField.value.trim(),
            address:     addrField.value.trim(),
            wilaya:      wilayaField.value,
            note:        noteField ? noteField.value.trim() : '',
            userId:      userId
        };

        try {
            const res  = await fetch('../api/order.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                const ok = document.createElement('div');
                ok.className = 'success-msg';
                ok.innerHTML = `✅ Order placed! (Ref #${data.orderId}) We will contact you soon.`;
                btn.after(ok);
                form.reset();
            } else {
                const err = document.createElement('div');
                err.className = 'error-msg';
                err.textContent = data.message || 'Failed to place order. Try again.';
                btn.after(err);
            }
        } catch (_) {
            const err = document.createElement('div');
            err.className = 'error-msg';
            err.textContent = 'Server error. Please try again later.';
            btn.after(err);
        } finally {
            btn.textContent = 'Place Order';
            btn.disabled    = false;
        }
    });
});
