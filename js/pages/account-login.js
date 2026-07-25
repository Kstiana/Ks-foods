import { login } from '../core/auth.js';
import { rules, initFormValidation, setFieldError } from '../core/forms.js';
import { showToast } from '../core/toast.js';

const initPasswordToggle = () => {
  const toggle = document.getElementById('login-password-toggle');
  const input = document.getElementById('login-password');
  toggle?.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
};

const initForgotPassword = () => {
  document.getElementById('forgot-password-btn')?.addEventListener('click', () => {
    showToast('Password reset instructions would be sent to your email', 'info');
  });
};

export const init = () => {
  initPasswordToggle();
  initForgotPassword();

  const form = document.getElementById('login-form');
  if (!form) return;

  initFormValidation(form, {
    email: [rules.required('Please enter your email'), rules.email()],
    password: [rules.required('Please enter your password')]
  }, () => {
    const email = form.elements.namedItem('email').value;
    const password = form.elements.namedItem('password').value;

    const result = login({ email, password });

    if (!result.success) {
      setFieldError(form.elements.namedItem('password'), result.error);
      showToast(result.error, 'error');
      return;
    }

    showToast(`Welcome back, ${result.user.name.split(' ')[0]}`, 'success');
    import('../router.js').then(({ navigate }) => navigate('/account'));
  });
};
