export const isPublishedReview = review =>
  !review.status || review.status === 'published';

export const getPublishedReviews = reviews =>
  (reviews || []).filter(isPublishedReview);

export const getReviewAverage = reviews => {
  const published = getPublishedReviews(reviews);
  if (!published.length) return null;
  const average = published.reduce((sum, review) => sum + Number(review.rating || 0), 0) / published.length;
  return Number(average.toFixed(1));
};
