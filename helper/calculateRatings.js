const calculatedAvgRating = (reviews) => {
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const avgRating = totalRating / reviews.length;
  return avgRating;
};
export default calculatedAvgRating;
