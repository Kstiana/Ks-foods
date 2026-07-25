const TIERS = [
  { name: 'Gold', threshold: 500 },
  { name: 'Silver', threshold: 200 },
  { name: 'Bronze', threshold: 0 }
];

export const getTier = points => TIERS.find(tier => points >= tier.threshold) ?? TIERS[TIERS.length - 1];

export const getNextTier = points => {
  const currentIndex = TIERS.findIndex(tier => points >= tier.threshold);
  return currentIndex > 0 ? TIERS[currentIndex - 1] : null;
};

export const getPointsToNextTier = points => {
  const next = getNextTier(points);
  return next ? next.threshold - points : 0;
};

export const renderLoyaltyBadge = points => {
  const tier = getTier(points);
  return `${tier.name} · ${points} pts`;
};
