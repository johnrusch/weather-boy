interface Card {
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

interface ReviewResult {
  nextReviewDate: Date;
  interval: number;
  easeFactor: number;
}

export function calculateNextReview(
  card: Card,
  response: "again" | "hard" | "good" | "easy",
): ReviewResult {
  let { interval, easeFactor } = card;
  const now = new Date();

  // SuperMemo-2 algorithm with modifications
  switch (response) {
    case "again":
      // Reset interval, decrease ease factor
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case "hard":
      // Increase interval by 1.2, decrease ease factor
      interval = Math.max(1, interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;

    case "good":
      // Normal interval increase
      if (card.reviewCount === 0) {
        interval = 1;
      } else if (card.reviewCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      break;

    case "easy":
      // Larger interval increase, increase ease factor
      interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      break;
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + interval);

  return {
    nextReviewDate,
    interval,
    easeFactor,
  };
}
