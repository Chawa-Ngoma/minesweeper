// game.js
// The Minesweeper game model: board creation, deferred mine placement,
// adjacency counts, reveal/flood-fill, flagging, and win/loss detection.
// No DOM access at all — this file only knows about grids and cell state.

window.Game = (function () {

const DIFFICULTIES = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
};

const CELL_STATE = {
  HIDDEN: "hidden",
  REVEALED: "revealed",
  FLAGGED: "flagged",
};

const GAME_STATUS = {
  IN_PROGRESS: "in-progress",
  WON: "won",
  LOST: "lost",
};

function inBounds(width, height, row, col) {
  return row >= 0 && row < height && col >= 0 && col < width;
}

function getNeighborCoords(width, height, row, col) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (inBounds(width, height, r, c)) neighbors.push({ row: r, col: c });
    }
  }
  return neighbors;
}

function createGrid(width, height) {
  const grid = [];
  for (let r = 0; r < height; r++) {
    const row = [];
    for (let c = 0; c < width; c++) {
      row.push({ isMine: false, adjacentMines: 0, state: CELL_STATE.HIDDEN });
    }
    grid.push(row);
  }
  return grid;
}

function placeMines(grid, width, height, mineCount, excludedCells) {
  const excluded = new Set(excludedCells.map(({ row, col }) => `${row},${col}`));
  const candidates = [];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!excluded.has(`${r},${c}`)) candidates.push({ row: r, col: c });
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < mineCount; i++) {
    const { row, col } = candidates[i];
    grid[row][col].isMine = true;
  }
}

function computeAdjacency(grid, width, height) {
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell = grid[r][c];
      if (cell.isMine) continue;

      const neighbors = getNeighborCoords(width, height, r, c);
      cell.adjacentMines = neighbors.filter(({ row, col }) => grid[row][col].isMine).length;
    }
  }
}

function createGame(width, height, mineCount) {
  const grid = createGrid(width, height);
  const totalCells = width * height;
  const cellsToReveal = totalCells - mineCount;

  let minesPlaced = false;
  let status = GAME_STATUS.IN_PROGRESS;
  let revealedCount = 0;
  let flaggedCount = 0;

  function floodReveal(startRow, startCol) {
    const stack = [{ row: startRow, col: startCol }];

    while (stack.length > 0) {
      const { row, col } = stack.pop();
      const cell = grid[row][col];

      if (cell.state !== CELL_STATE.HIDDEN) continue;

      cell.state = CELL_STATE.REVEALED;
      revealedCount++;

      if (cell.adjacentMines === 0) {
        for (const { row: nr, col: nc } of getNeighborCoords(width, height, row, col)) {
          const neighbor = grid[nr][nc];
          if (neighbor.state === CELL_STATE.HIDDEN && !neighbor.isMine) {
            stack.push({ row: nr, col: nc });
          }
        }
      }
    }
  }

  function revealCell(row, col) {
    if (status !== GAME_STATUS.IN_PROGRESS) return;

    const cell = grid[row][col];
    if (cell.state !== CELL_STATE.HIDDEN) return;

    if (!minesPlaced) {
      const excluded = [{ row, col }, ...getNeighborCoords(width, height, row, col)];
      placeMines(grid, width, height, mineCount, excluded);
      computeAdjacency(grid, width, height);
      minesPlaced = true;
    }

    if (cell.isMine) {
      cell.state = CELL_STATE.REVEALED;
      status = GAME_STATUS.LOST;
      return;
    }

    floodReveal(row, col);

    if (revealedCount === cellsToReveal) status = GAME_STATUS.WON;
  }

  function toggleFlag(row, col) {
    if (status !== GAME_STATUS.IN_PROGRESS) return;

    const cell = grid[row][col];
    if (cell.state === CELL_STATE.HIDDEN) {
      cell.state = CELL_STATE.FLAGGED;
      flaggedCount++;
    } else if (cell.state === CELL_STATE.FLAGGED) {
      cell.state = CELL_STATE.HIDDEN;
      flaggedCount--;
    }
  }

  function chord(row, col) {
    if (status !== GAME_STATUS.IN_PROGRESS) return;

    const cell = grid[row][col];
    if (cell.state !== CELL_STATE.REVEALED || cell.adjacentMines === 0) return;

    const neighbors = getNeighborCoords(width, height, row, col);
    const flaggedNeighborCount = neighbors.filter(
      ({ row: r, col: c }) => grid[r][c].state === CELL_STATE.FLAGGED
    ).length;

    if (flaggedNeighborCount !== cell.adjacentMines) return;

    for (const { row: nr, col: nc } of neighbors) {
      if (grid[nr][nc].state === CELL_STATE.HIDDEN) revealCell(nr, nc);
    }
  }

  function getCell(row, col) {
    const cell = grid[row][col];
    const view = { state: cell.state, adjacentMines: null, isMine: null };

    if (cell.state === CELL_STATE.REVEALED) {
      view.adjacentMines = cell.adjacentMines;
      view.isMine = cell.isMine;
    } else if (status === GAME_STATUS.LOST && cell.isMine) {
      view.isMine = true;
    }

    return view;
  }

  function getStatus() {
    return status;
  }

  function getRemainingFlags() {
    return mineCount - flaggedCount;
  }

  return {
    getWidth: () => width,
    getHeight: () => height,
    getMineCount: () => mineCount,
    getStatus,
    getCell,
    revealCell,
    toggleFlag,
    chord,
    getRemainingFlags,
  };
}

return { DIFFICULTIES, CELL_STATE, GAME_STATUS, createGame };

})();
