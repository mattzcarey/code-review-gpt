import { maxReviewCount } from "../../constants";
import { ReviewFile } from "../../types";

export const filterReviews = (reviews: ReviewFile[]): ReviewFile[] => {
  const filterReviews: ReviewFile[] = [];
  // order by Security, Bugs, Performance, Style
  filterReviews.push(...filterByCategory(reviews, "Security"));
  filterReviews.push(...filterByCategory(reviews, "Bugs"));
  filterReviews.push(...filterByCategory(reviews, "Performance"));
  filterReviews.push(...filterByCategory(reviews, "Style"));

  return filterReviews.slice(0, maxReviewCount);
};

const filterByCategory = (
  reviews: ReviewFile[],
  category: string
): ReviewFile[] => {
  const categoryReviews = reviews.filter(
    (review) => review.category === category
  );

  return categoryReviews;
};
