export const rules = {
  required: message => value => (value.trim().length ? null : message ?? 'This field is required'),
  email: message => value => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : message ?? 'Enter a valid email address'),
  phone: message => value => (/^[0-9+()\s-]{7,20}$/.test(value.trim()) ? null : message ?? 'Enter a valid phone number'),
  minLength: (length, message) => value => (value.trim().length >= length ? null : message ?? `Must be at least ${length} characters`),
  match: (getOtherValue, message) => value => (value === getOtherValue() ? null : message ?? 'Values do not match')
};

const getFieldWrapper = input => input.closest('.form-group') ?? input.parentElement;

export const setFieldError = (input, message) => {
  input.setAttribute('aria-invalid', 'true');
  const wrapper = getFieldWrapper(input);
  let errorEl = wrapper.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    wrapper.appendChild(errorEl);
  }
  const errorId = input.id ? `${input.id}-error` : '';
  if (errorId) {
    errorEl.id = errorId;
    input.setAttribute('aria-describedby', errorId);
  }
  errorEl.textContent = message;
};

export const clearFieldError = input => {
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  const wrapper = getFieldWrapper(input);
  wrapper.querySelector('.form-error')?.remove();
};

export const validateField = (input, validators = []) => {
  const value = input.value ?? '';
  for (const validator of validators) {
    const message = validator(value);
    if (message) {
      setFieldError(input, message);
      return message;
    }
  }
  clearFieldError(input);
  return null;
};

export const validateForm = (form, schema) => {
  const errors = {};
  Object.entries(schema).forEach(([name, validators]) => {
    const input = form.elements.namedItem(name);
    if (!input) return;
    const message = validateField(input, validators);
    if (message) errors[name] = message;
  });
  return { valid: Object.keys(errors).length === 0, errors };
};

export const renderErrorSummary = (form, errors) => {
  let summary = form.querySelector('.form-error-summary');
  const count = Object.keys(errors).length;

  if (!count) {
    summary?.remove();
    return;
  }

  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'form-error-summary';
    summary.setAttribute('role', 'alert');
    form.prepend(summary);
  }

  summary.innerHTML = `
    <span class="form-error-summary-title">${count === 1 ? 'There is 1 problem' : `There are ${count} problems`} with your submission</span>
    <ul>${Object.values(errors).map(message => `<li>${message}</li>`).join('')}</ul>
  `;
};

export const initFormValidation = (form, schema, onValid) => {
  let attemptedSubmit = false;

  Object.keys(schema).forEach(name => {
    const input = form.elements.namedItem(name);
    if (!input) return;
    input.addEventListener('blur', () => {
      if (attemptedSubmit) validateField(input, schema[name]);
    });
    input.addEventListener('input', () => {
      if (attemptedSubmit) validateField(input, schema[name]);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    attemptedSubmit = true;
    const { valid, errors } = validateForm(form, schema);
    renderErrorSummary(form, errors);
    if (valid) onValid(form);
    else form.querySelector('.form-error-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};
