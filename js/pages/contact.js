import config from '../config.js';
import { rules, initFormValidation } from '../core/forms.js';
import { showToast } from '../core/toast.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const renderHours = () => {
  const list = document.getElementById('contact-hours-list');
  if (!list) return;

  const today = new Date().getDay();

  list.innerHTML = config.hours.map(h => `
    <div class="hours-row ${h.day === today ? 'today' : ''}">
      <span>${DAY_NAMES[h.day]}</span>
      <span>${h.open} — ${h.close}</span>
    </div>
  `).join('');
};

const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  initFormValidation(form, {
    name: [rules.required('Please enter your name')],
    email: [rules.required('Please enter your email'), rules.email()],
    subject: [rules.required('Please add a subject')],
    message: [rules.required('Please write a message')]
  }, () => {
    form.reset();
    showToast('Message sent — we\'ll get back to you soon', 'success');
  });
};

export const init = () => {
  renderHours();
  initContactForm();
};
