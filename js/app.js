// app.js
// Wires the game model to the renderer: difficulty switching and New Game.
// No click/flag handling yet — that's Phase 4.

(function () {

const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("new-game");

let game;

function startNewGame(difficultyKey) {
  const preset = Game.DIFFICULTIES[difficultyKey];
  game = Game.createGame(preset.width, preset.height, preset.mines);

  Renderer.renderBoard(game);
  Renderer.updateMineCounter(game);
  Renderer.resetTimerDisplay();
}

difficultySelect.addEventListener("change", () => {
  startNewGame(difficultySelect.value);
});

newGameBtn.addEventListener("click", () => {
  startNewGame(difficultySelect.value);
});

startNewGame(difficultySelect.value);

})();
