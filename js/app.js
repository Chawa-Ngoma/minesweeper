// app.js
// Wires the game model, renderer, and input together: click/flag/chord
// handling, the timer, and New Game / difficulty reset.

(function () {

const boardEl = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("new-game");

let game;
let timerInterval = null;
let elapsedSeconds = 0;
let timerStarted = false;

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  Renderer.updateTimerDisplay(elapsedSeconds);
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    Renderer.updateTimerDisplay(elapsedSeconds);
  }, 1000);
}

function startNewGame(difficultyKey) {
  stopTimer();
  timerStarted = false;

  const preset = Game.DIFFICULTIES[difficultyKey];
  game = Game.createGame(preset.width, preset.height, preset.mines);

  Renderer.renderBoard(game);
  Renderer.updateMineCounter(game);
  Renderer.resetTimerDisplay();
}

function syncAfterModelChange() {
  Renderer.renderBoard(game);
  Renderer.updateMineCounter(game);

  if (game.getStatus() !== "in-progress") stopTimer();
}

function handleReveal(row, col) {
  if (game.getStatus() !== "in-progress") return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }

  game.revealCell(row, col);
  syncAfterModelChange();
}

function handleFlag(row, col) {
  if (game.getStatus() !== "in-progress") return;

  game.toggleFlag(row, col);
  syncAfterModelChange();
}

function handleChord(row, col) {
  if (game.getStatus() !== "in-progress") return;

  game.chord(row, col);
  syncAfterModelChange();
}

Input.initInput(boardEl, {
  onReveal: handleReveal,
  onFlag: handleFlag,
  onChord: handleChord,
});

difficultySelect.addEventListener("change", () => {
  startNewGame(difficultySelect.value);
});

newGameBtn.addEventListener("click", () => {
  startNewGame(difficultySelect.value);
});

startNewGame(difficultySelect.value);

})();
