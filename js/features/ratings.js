import { get, set } from '../core/store.js';

const STORAGE_KEY = 'ratings';

let ratings = get(STORAGE_KEY, {});

/**
 * Get saved rating
 */
export const getRating = itemId => {
  return Number(ratings[itemId] ?? 0);
};

/**
 * Save or remove rating
 */
export const setRating = (itemId, value) => {
  const rating = Number(value);

  if (rating <= 0) {
    delete ratings[itemId];
  } else {
    ratings[itemId] = rating;
  }

  set(STORAGE_KEY, ratings);
};

/**
 * Sync the hidden radio inputs
 */
const syncRatingInputs = (itemId, value) => {
  document
    .querySelectorAll(
      `.rating-input[data-item-id="${itemId}"]`
    )
    .forEach(input => {
      input.checked = Number(input.value) === Number(value);
    });
};

/**
 * Sync the visible stars
 */
const syncRatingVisuals = (itemId, value) => {
  document
    .querySelectorAll(
      `.rating[data-item-id="${itemId}"]`
    )
    .forEach(container => {
      container
        .querySelectorAll('.rating-star')
        .forEach(star => {
          const starValue = Number(star.dataset.value);
          const isActive = starValue <= Number(value);

          star.classList.toggle('active', isActive);
          star.setAttribute('aria-checked', String(starValue === Number(value)));
        });
    });
};

/**
 * Sync everything
 */
const syncRating = (itemId, value) => {
  syncRatingInputs(itemId, value);
  syncRatingVisuals(itemId, value);
};

/**
 * Initialise ratings
 */
export const initRatings = () => {

  document.addEventListener('click', e => {
    const star = e.target.closest(
      '.rating-star[data-item-id]'
    );

    if (!star) return;

    // VERY IMPORTANT:
    // Prevent the label's normal radio behaviour.
    e.preventDefault();
    e.stopPropagation();

    const itemId = star.dataset.itemId;
    const clickedRating = Number(star.dataset.value);

    if (!itemId || !clickedRating) return;

    const currentRating = getRating(itemId);

    // Same star = remove rating
    // Different star = change rating
    const newRating =
      currentRating === clickedRating
        ? 0
        : clickedRating;

    setRating(itemId, newRating);
    syncRating(itemId, newRating);
  });

  /**
   * Keyboard support
   */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const star = e.target.closest(
      '.rating-star[data-item-id]'
    );

    if (!star) return;

    e.preventDefault();
    e.stopPropagation();

    const itemId = star.dataset.itemId;
    const clickedRating = Number(star.dataset.value);

    if (!itemId || !clickedRating) return;

    const currentRating = getRating(itemId);

    const newRating =
      currentRating === clickedRating
        ? 0
        : clickedRating;

    setRating(itemId, newRating);
    syncRating(itemId, newRating);
  });
};
