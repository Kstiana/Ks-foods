import { get, set, generateId } from '../core/store.js';
import seedReviews from '../data/reviews-data.js';

const REVIEWS_KEY = 'userReviews';

const getUserReviews = () => get(REVIEWS_KEY, []);
const saveUserReviews = reviews => set(REVIEWS_KEY, reviews);

export const getAllReviews = () => [...getUserReviews(), ...seedReviews]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addReview = ({ userId, userName, rating, title, body, itemId = null }) => {
  const review = {
    id: generateId('rev'),
    userId,
    userName,
    rating,
    title,
    body,
    itemId,
    createdAt: new Date().toISOString()
  };

  const reviews = getUserReviews();
  reviews.push(review);
  saveUserReviews(reviews);

  return review;
};

export const getAverageRating = reviews => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return total / reviews.length;
};

export const getRatingDistribution = reviews => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });
  return distribution;
};
