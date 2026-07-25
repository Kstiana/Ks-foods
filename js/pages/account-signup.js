import { signup } from '../core/auth.js';
import { rules, initFormValidation, setFieldError, clearFieldError } from '../core/forms.js';
import { showToast } from '../core/toast.js';

const initPasswordToggle = () => {
  const toggle = document.getElementById('signup-password-toggle');
  const input = document.getElementById('signup-password');
  toggle?.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
};

export const init = () => {
  initPasswordToggle();

  const form = document.getElementById('signup-form');
  if (!form) return;

  const schema = {
    name: [rules.required('Please enter your full name')],
    email: [rules.required('Please enter your email'), rules.email()],
    password: [rules.required('Please choose a password'), rules.minLength(6)],
    confirmPassword: [
      rules.required('Please confirm your password'),
      rules.match(() => form.elements.namedItem('password').value, 'Passwords do not match')
    ]
  };

  initFormValidation(form, schema, () => {
    const termsInput = form.elements.namedItem('terms');
    if (!termsInput.checked) {
      showToast('Please agree to the Terms of Service to continue', 'error');
      return;
    }

    const name = form.elements.namedItem('name').value;
    const email = form.elements.namedItem('email').value;
    const password = form.elements.namedItem('password').value;

    const result = signup({ name, email, password });

    if (!result.success) {
      setFieldError(form.elements.namedItem('email'), result.error);
      showToast(result.error, 'error');
      return;
    }

    clearFieldError(form.elements.namedItem('email'));
    showToast(`Welcome to Kristy's Kitchen, ${result.user.name.split(' ')[0]}`, 'success');
    import('../router.js').then(({ navigate }) => navigate('/account'));
  });
};
