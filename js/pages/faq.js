let activeCategory = 'ordering';

const applyCategory = () => {
  document.querySelectorAll('.accordion-item').forEach(item => {
    item.classList.toggle('hidden-item', item.dataset.category !== activeCategory);
  });
};

const initTabs = () => {
  document.querySelectorAll('[data-faq-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-faq-category]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeCategory = btn.dataset.faqCategory;
      applyCategory();
    });
  });
};

const initAccordion = () => {
  document.getElementById('faq-list')?.addEventListener('click', e => {
    const trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;
    const item = trigger.closest('.accordion-item');
    const wasOpen = item.classList.contains('open');

    item.parentElement.querySelectorAll('.accordion-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
};

export const init = () => {
  activeCategory = 'ordering';
  applyCategory();
  initTabs();
  initAccordion();
};
