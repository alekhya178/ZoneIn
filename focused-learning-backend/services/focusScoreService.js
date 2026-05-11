// Calculate focus score based on distractions and watch time
// Formula: 100 - (distractionsBlocked * 2) + (watchTimeSeconds / 300)
// Returns a score between 0 and 100
function calculateFocusScore(distractionsBlocked, watchTimeSeconds = 0) {
  const timeBonus = Math.floor(watchTimeSeconds / 300);
  // Capped penalty: each distraction costs 2 points, but max penalty is 60 points
  // This allows users with many shielded elements to still have a decent score
  const penalty = Math.min(60, distractionsBlocked * 0.5); 
  return Math.min(100, Math.max(0, 100 - penalty + timeBonus));
}

module.exports = {
  calculateFocusScore,
};
