// input.js
// Detects player gestures on the board (click, right-click, long-press) via
// event delegation on the board container, and reports them through
// callbacks. Reads only DOM state (which mirrors the model, since the
// renderer draws from it) to decide reveal vs. chord — no game rules here,
// no direct knowledge of the model.

window.Input = (function () {

const LONG_PRESS_MS = 450;
const TOUCH_MOVE_CANCEL_PX = 10;

function initInput(boardEl, { onReveal, onFlag, onChord }) {
  boardEl.addEventListener("click", (event) => {
    const cellEl = event.target.closest(".cell");
    if (!cellEl) return;

    const row = Number(cellEl.dataset.row);
    const col = Number(cellEl.dataset.col);

    if (cellEl.classList.contains("revealed")) {
      onChord(row, col);
    } else {
      onReveal(row, col);
    }
  });

  boardEl.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const cellEl = event.target.closest(".cell");
    if (!cellEl) return;

    onFlag(Number(cellEl.dataset.row), Number(cellEl.dataset.col));
  });

  let pressTimer = null;
  let longPressFired = false;
  let touchCell = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function cancelPress() {
    clearTimeout(pressTimer);
    pressTimer = null;
    touchCell = null;
  }

  boardEl.addEventListener("touchstart", (event) => {
    const cellEl = event.target.closest(".cell");
    if (!cellEl) return;

    touchCell = cellEl;
    longPressFired = false;

    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    pressTimer = setTimeout(() => {
      longPressFired = true;
      onFlag(Number(cellEl.dataset.row), Number(cellEl.dataset.col));
    }, LONG_PRESS_MS);
  });

  boardEl.addEventListener("touchmove", (event) => {
    if (!touchCell) return;

    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);

    if (dx > TOUCH_MOVE_CANCEL_PX || dy > TOUCH_MOVE_CANCEL_PX) cancelPress();
  });

  boardEl.addEventListener("touchend", (event) => {
    if (!touchCell) return;

    const cellEl = touchCell;
    const wasLongPress = longPressFired;
    cancelPress();

    // Stop the browser's synthetic click that follows a touch — we decide
    // the outcome ourselves below, so that click must not also fire.
    event.preventDefault();

    if (wasLongPress) return;

    const row = Number(cellEl.dataset.row);
    const col = Number(cellEl.dataset.col);

    if (cellEl.classList.contains("revealed")) {
      onChord(row, col);
    } else {
      onReveal(row, col);
    }
  });
}

return { initInput };

})();
