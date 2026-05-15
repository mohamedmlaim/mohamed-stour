// info.js
const form = document.querySelector('form');

const getField = id => document.getElementById(id);

const clearError = field => {
    const group = field.closest('.form-group') || field.closest('.input-wrap');
    if (!group) return;
    const error = group.querySelector('.error-message');
    if (error) error.remove();
};

const showError = (field, message) => {
    clearError(field);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    // Insert after the input-wrap (or directly after the field)
    const wrap = field.closest('.input-wrap');
    if (wrap) {
        wrap.parentElement.appendChild(error);
    } else {
        field.closest('.form-group').appendChild(error);
    }
    field.style.borderColor = 'var(--error)';
};

const clearSuccess = () => {
    const s = form.querySelector('.success-message');
    if (s) s.remove();
};

const resetBorders = fields => fields.forEach(f => f && (f.style.borderColor = ''));

if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearSuccess();

        const firstNameField = getField('txt');
        const lastNameField  = getField('la');
        const emailField     = getField('em');
        const ageField       = getField('ag');
        const phoneField     = getField('num');
        const addressField   = getField('add');
        const wilayaField    = getField('w');
        const passwordField  = getField('pass');
        const confirmField   = getField('con');
        const genderField    = form.querySelector('input[name="gender"]:checked');

        const allInputs = [firstNameField, lastNameField, emailField, ageField,
                           phoneField, addressField, passwordField, confirmField];

        allInputs.forEach(clearError);
        resetBorders(allInputs);

        // Clear gender error
        const genderErrDiv = document.getElementById('gender-error');
        if (genderErrDiv) genderErrDiv.innerHTML = '';

        let isValid = true;

        if (!firstNameField.value.trim()) {
            showError(firstNameField, 'First name is required.'); isValid = false;
        }

        if (!lastNameField.value.trim()) {
            showError(lastNameField, 'Last name is required.'); isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value.trim())) {
            showError(emailField, 'Enter a valid email address.'); isValid = false;
        }

        const ageValue = parseInt(ageField.value, 10);
        if (Number.isNaN(ageValue) || ageValue < 18) {
            showError(ageField, 'You must be at least 18 years old.'); isValid = false;
        }

        const phonePattern = /^(05|06|07)[0-9]{8}$/;
        if (!phonePattern.test(phoneField.value.trim())) {
            showError(phoneField, 'Enter a valid Algerian phone (05/06/07XXXXXXXX).'); isValid = false;
        }

        if (!genderField) {
            const err = document.createElement('div');
            err.className = 'error-message';
            err.textContent = 'Please select a gender.';
            genderErrDiv.appendChild(err);
            isValid = false;
        }

        if (!addressField.value.trim()) {
            showError(addressField, 'Address is required.'); isValid = false;
        }

        if (!wilayaField.value) {
            showError(wilayaField, 'Please select a province.'); isValid = false;
        }

        if (passwordField.value.trim().length < 6) {
            showError(passwordField, 'Password must be at least 6 characters.'); isValid = false;
        }

        if (passwordField.value.trim() !== confirmField.value.trim()) {
            showError(confirmField, 'Passwords do not match.'); isValid = false;
        }

        if (!isValid) return;

        // Disable button while sending
        const submitBtn = form.querySelector('input[type="submit"]');
        submitBtn.value = 'Creating account…';
        submitBtn.disabled = true;

        const payload = {
            firstName: firstNameField.value.trim(),
            lastName:  lastNameField.value.trim(),
            email:     emailField.value.trim(),
            age:       ageValue,
            phone:     phoneField.value.trim(),
            address:   addressField.value.trim(),
            wilaya:    wilayaField.value,
            password:  passwordField.value.trim(),
            gender:    genderField.value
        };

        try {
            const res = await fetch('api/register.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                const fieldset = form.querySelector('fieldset');
                const success  = document.createElement('div');
                success.className = 'success-message';
                success.innerHTML = '✓ Account created! Redirecting to login…';
                // Insert after legend-sub
                const sub = fieldset.querySelector('.legend-sub');
                sub ? sub.after(success) : fieldset.prepend(success);
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                showError(emailField, data.message || 'Registration failed. Try again.');
                submitBtn.value = 'Create Account →';
                submitBtn.disabled = false;
            }
        } catch (err) {
            alert('Server error. Please try again later.');
            submitBtn.value = 'Create Account →';
            submitBtn.disabled = false;
        }
    });

    // Live confirm password check
    const confirmField = getField('con');
    const passwordField = getField('pass');
    if (confirmField && passwordField) {
        confirmField.addEventListener('input', () => {
            if (confirmField.value && confirmField.value !== passwordField.value) {
                confirmField.style.borderColor = 'var(--error)';
            } else {
                confirmField.style.borderColor = '';
            }
        });
    }
}
