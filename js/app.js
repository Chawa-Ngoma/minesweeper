// app.js
// Entry point. Board/renderer/input wiring comes in later phases.
// For now, just instantiate the model to confirm it's connected.

const game = Game.createGame(
  Game.DIFFICULTIES.beginner.width,
  Game.DIFFICULTIES.beginner.height,
  Game.DIFFICULTIES.beginner.mines
);

console.log("Minesweeper: game model instantiated", game.getStatus());
