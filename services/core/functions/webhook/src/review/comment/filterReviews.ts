import { maxReviewCount } from "../../constants";
import { ReviewFile } from "../../types";

export const filterReviews = (reviews: ReviewFile[]): ReviewFile[] => {
  const securityReviews = reviews.filter((r) => r.category === "Security");
  if (securityReviews.length > 0) {
    return securityReviews.slice(0, maxReviewCount);
  }

  const performanceReviews = reviews.filter(
    (r) => r.category === "Performance"
  );
  if (performanceReviews.length > 0) {
    return performanceReviews.slice(0, maxReviewCount);
  }

  // Return other reviews if no security or performance issues found
  return reviews.slice(0, maxReviewCount);
};
