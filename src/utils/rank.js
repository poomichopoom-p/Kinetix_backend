// Total points required to reach each rank
export const RANK_THRESHOLDS = [
  { rank: "bronze", points: 0 },
  { rank: "silver", points: 100 },
  { rank: "gold", points: 200 },
  { rank: "platinum", points: 500 },
  { rank: "Diamond", points: 700 },
  { rank: "Legend", points: 1000 },
];

// Returns the highest rank whose threshold the given points satisfy
export const getRankForPoints = (points) => {
  let rank = RANK_THRESHOLDS[0].rank;
  for (const tier of RANK_THRESHOLDS) {
    if (points >= tier.points) {
      rank = tier.rank;
    }
  }
  return rank;
};
