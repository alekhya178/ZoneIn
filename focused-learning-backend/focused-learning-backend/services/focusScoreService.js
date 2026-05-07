// Calculate focus score based on distractions and watch time
// Formula: 100 - (distractionsBlocked * 2) + (watchTimeSeconds / 300)
// Returns a score between 0 and 100
function calculateFocusScore(distractionsBlocked, watchTimeSeconds = 0) {
  const timeBonus = Math.floor(watchTimeSeconds / 300);
  const penalty = distractionsBlocked * 2;
  return Math.min(100, Math.max(0, 100 - penalty + timeBonus));
}

module.exports = {
  calculateFocusScore,
};
