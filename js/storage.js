// storage.js
// Persists best completion times per difficulty to localStorage, tolerating
// an unavailable or disabled localStorage without crashing the game.

window.BestTimes = (function () {

const BEST_TIMES_KEY = "minesweeper-best-times";

function readAll() {
  try {
    const raw = localStorage.getItem(BEST_TIMES_KEY);
    if (raw === null) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getBestTime(difficultyKey) {
  const value = readAll()[difficultyKey];
  return Number.isFinite(value) ? value : null;
}

// Returns { best, isNewBest }: `best` is the best time on record for this
// difficulty after this call (the new time if it's lower, otherwise the
// unchanged existing one), `isNewBest` says whether this call improved it.
function setBestTimeIfLower(difficultyKey, seconds) {
  const times = readAll();
  const current = Number.isFinite(times[difficultyKey]) ? times[difficultyKey] : null;
  const isNewBest = current === null || seconds < current;

  if (isNewBest) {
    times[difficultyKey] = seconds;
    try {
      localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(times));
    } catch {
      // Ignore write failures (storage disabled/full/private mode); the
      // in-memory result below still reflects the new best for this session.
    }
  }

  return { best: isNewBest ? seconds : current, isNewBest };
}

return { getBestTime, setBestTimeIfLower };

})();
