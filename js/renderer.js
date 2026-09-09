// renderer.js
// Draws the current game model state into #board, and keeps the mine
// counter / timer / notice-pill display elements in sync. Pure "draw what
// I'm told" — no game rules, no click handling, no state of its own.

window.Renderer = (function () {

function formatMineCount(value) {
  return String(value);
}

// M:SS — zero-padded seconds only, no forced leading zero on minutes
// (5s -> "0:05", 63s -> "1:03", 720s -> "12:00").
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderBoard(game) {
  const board = document.getElementById("board");
  const width = game.getWidth();
  const height = game.getHeight();

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
  board.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      board.appendChild(createCellElement(game, row, col));
    }
  }
}

function createCellElement(game, row, col) {
  const cellState = game.getCell(row, col);
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.row = String(row);
  cell.dataset.col = String(col);

  if (cellState.state === "flagged") {
    cell.classList.add("flagged");
    cell.textContent = "🚩";
  } else if (cellState.isMine) {
    // A mine that's either been revealed (loss) or force-shown on loss.
    cell.classList.add("revealed", "mine");
    cell.textContent = "💣";
  } else if (cellState.state === "revealed") {
    cell.classList.add("revealed");
    if (cellState.adjacentMines > 0) {
      cell.classList.add(`n${cellState.adjacentMines}`);
      cell.textContent = String(cellState.adjacentMines);
    }
  }

  return cell;
}

function updateMineCounter(game) {
  document.getElementById("mine-counter").textContent = formatMineCount(game.getRemainingFlags());
}

function updateTimerDisplay(seconds) {
  document.getElementById("timer").textContent = formatTime(seconds);
}

function resetTimerDisplay() {
  updateTimerDisplay(0);
}

function updateBestTimeDisplay(seconds) {
  document.getElementById("best-time").textContent =
    seconds === null || seconds === undefined ? "--:--" : formatTime(seconds);
}

let confettiFrameId = null;
let confettiParticles = [];

function startConfetti() {
  stopConfetti();

  const canvas = document.getElementById("confetti-canvas");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const ctx = canvas.getContext("2d");
  const colors = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#e67e22"];

  // Confined to the shallow strip at the top of the board (see .confetti-canvas
  // in styles.css) — a brief shower, not a blanket over the grid. Particles
  // start just above the canvas and are dropped once they fall out of it.
  confettiParticles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 80,
    size: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 1.2 + Math.random() * 2,
    speedX: (Math.random() - 0.5) * 1.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
  }));

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let anyActive = false;

    for (const particle of confettiParticles) {
      particle.y += particle.speedY;
      particle.x += particle.speedX;
      particle.rotation += particle.rotationSpeed;
      if (particle.y < canvas.height) anyActive = true;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    }

    confettiFrameId = anyActive ? requestAnimationFrame(tick) : null;
  }

  confettiFrameId = requestAnimationFrame(tick);
}

function stopConfetti() {
  if (confettiFrameId !== null) cancelAnimationFrame(confettiFrameId);
  confettiFrameId = null;

  const canvas = document.getElementById("confetti-canvas");
  if (canvas.width > 0 && canvas.height > 0) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }
}

function showNoticePill(message, kind) {
  const pill = document.getElementById("notice-pill");
  pill.textContent = message;
  pill.classList.remove("win", "loss");
  pill.classList.add(kind);
  pill.hidden = false;
}

function hideNoticePill() {
  const pill = document.getElementById("notice-pill");
  pill.hidden = true;
  pill.classList.remove("win", "loss");
  stopConfetti();
}

function showLossNotice() {
  showNoticePill("You lost — mines revealed below.", "loss");
}

function showWinNotice({ elapsedSeconds, isNewBest }) {
  const message = isNewBest
    ? `You won in ${formatTime(elapsedSeconds)} — new best time!`
    : `You won in ${formatTime(elapsedSeconds)}`;

  showNoticePill(message, "win");
  startConfetti();
}

return {
  renderBoard,
  updateMineCounter,
  updateTimerDisplay,
  resetTimerDisplay,
  updateBestTimeDisplay,
  showLossNotice,
  showWinNotice,
  hideNoticePill,
};

})();
