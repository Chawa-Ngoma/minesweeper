// renderer.js
// Draws the current game model state into #board, and keeps the mine
// counter / timer display elements in sync. Pure "draw what I'm told" —
// no game rules, no click handling, no state of its own.

window.Renderer = (function () {

function formatCounter(value) {
  const sign = value < 0 ? "-" : "";
  const digits = String(Math.abs(value)).padStart(sign ? 2 : 3, "0");
  return sign + digits;
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
  document.getElementById("mine-counter").textContent = formatCounter(game.getRemainingFlags());
}

function resetTimerDisplay() {
  document.getElementById("timer").textContent = formatCounter(0);
}

return { renderBoard, updateMineCounter, resetTimerDisplay };

})();
