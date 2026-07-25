import { getAllReviews, addReview, getAverageRating, getRatingDistribution } from '../features/reviews.js';
import { getCurrentUser } from '../core/auth.js';
import { bindModal } from '../core/modal.js';
import { icon } from '../core/icons.js';
import { showToast } from '../core/toast.js';
import { rules, initFormValidation } from '../core/forms.js';

let activeRatingFilter = 'all';
let activeSort = 'newest';
let reviewModal = null;

const formatDate = iso => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const buildStars = (rating, size = 14) => Array.from({ length: 5 }, (_, i) => `
  <span style="color:${i < rating ? 'var(--brand-gold)' : 'var(--border-strong)'};display:inline-flex;">
    ${icon('starFilled', { size })}
  </span>
`).join('');

const renderSummary = reviews => {
  const average = getAverageRating(reviews);
  const distribution = getRatingDistribution(reviews);
  const total = reviews.length;

  document.getElementById('reviews-average').textContent = average.toFixed(1);
  document.getElementById('reviews-average-stars').innerHTML = buildStars(Math.round(average), 20);
  document.getElementById('reviews-count').textContent = `${total} review${total !== 1 ? 's' : ''}`;

  const distContainer = document.getElementById('reviews-distribution');
  distContainer.innerHTML = [5, 4, 3, 2, 1].map(star => {
    const count = distribution[star] ?? 0;
    const pct = total ? Math.round((count / total) * 100) : 0;
    return `
      <div class="reviews-distribution-row">
        <span>${star} star</span>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%;"></div></div>
        <span>${count}</span>
      </div>
    `;
  }).join('');
};

const getFilteredSorted = reviews => {
  let filtered = activeRatingFilter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === Number(activeRatingFilter));

  filtered = [...filtered];
  if (activeSort === 'highest') filtered.sort((a, b) => b.rating - a.rating);
  else if (activeSort === 'lowest') filtered.sort((a, b) => a.rating - b.rating);
  else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filtered;
};

const renderList = () => {
  const reviews = getAllReviews();
  const filtered = getFilteredSorted(reviews);
  const list = document.getElementById('reviews-list');
  const empty = document.getElementById('reviews-empty');

  empty.hidden = filtered.length > 0;
  list.innerHTML = filtered.map(r => `
    <div class="card review-card">
      <div class="review-card-header">
        <div class="review-card-rating">${buildStars(r.rating)}</div>
        <span class="review-card-date">${formatDate(r.createdAt)}</span>
      </div>
      <h3 class="review-card-title">${r.title}</h3>
      <p class="review-card-body">${r.body}</p>
      <div class="review-card-footer">
        <span class="avatar" style="width:32px;height:32px;font-size:12px;">${r.userName.charAt(0).toUpperCase()}</span>
        <span class="review-card-name">${r.userName}</span>
      </div>
    </div>
  `).join('');
};

const renderAll = () => {
  renderSummary(getAllReviews());
  renderList();
};

const initFilterTabs = () => {
  document.querySelectorAll('[data-rating-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-rating-filter]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeRatingFilter = btn.dataset.ratingFilter;
      renderList();
    });
  });

  document.getElementById('reviews-sort-select')?.addEventListener('change', e => {
    activeSort = e.target.value;
    renderList();
  });
};

const initReviewForm = () => {
  const overlay = document.getElementById('review-form-overlay');
  const writeBtn = document.getElementById('write-review-btn');
  const cancelBtn = document.getElementById('review-form-cancel');
  const form = document.getElementById('review-form');
  if (!overlay || !form) return;

  reviewModal = bindModal(overlay);

  writeBtn?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      showToast('Please log in to write a review', 'info');
      import('../router.js').then(({ navigate }) => navigate('/login'));
      return;
    }
    form.reset();
    reviewModal.open(writeBtn);
  });

  cancelBtn?.addEventListener('click', () => reviewModal.close());

  initFormValidation(form, {
    title: [rules.required('Please add a title')],
    body: [rules.required('Please write your review')]
  }, () => {
    const rating = Number(form.querySelector('input[name="reviewRating"]:checked')?.value ?? 0);
    if (!rating) {
      showToast('Please select a star rating', 'error');
      return;
    }

    const user = getCurrentUser();
    addReview({
      userId: user.id,
      userName: user.name,
      rating,
      title: form.elements.namedItem('title').value.trim(),
      body: form.elements.namedItem('body').value.trim()
    });

    reviewModal.close();
    showToast('Thank you for your review', 'success');
    renderAll();
  });
};

export const init = () => {
  activeRatingFilter = 'all';
  activeSort = 'newest';
  renderAll();
  initFilterTabs();
  initReviewForm();
};
