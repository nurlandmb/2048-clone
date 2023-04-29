import Grid from './Grid.js';
import Tile from './Tile.js';
class Game {
  constructor(board) {
    const scoreElem = document.querySelector('.score');
    scoreElem.textContent = "";
    this.scoreElem = scoreElem;

    this.board = board;
    this.grid = new Grid(board);
  }
  setupInput() {
    window.addEventListener('keydown', this.handleInput.bind(this), {
      once: true,
    });
  }

  get score() {
    return +this.scoreElem.textContent;
  }
  set score(val) {
    this.scoreElem.textContent = val;
  }
  getOrderedCells(type) {
    switch (type) {
      case 'up':
        return this.grid.cellsByColumn;
      case 'down':
        return this.grid.cellsByColumn.map((column) => [...column].reverse());
      case 'right':
        return this.grid.cellsByRow.map((column) => [...column].reverse());
      case 'left':
        return this.grid.cellsByRow;
    }
  }
  slideTiles(type) {
    let cells = this.getOrderedCells(type);
    return Promise.all(
      cells.flatMap((group) => {
        const promises = [];
        for (let i = 1; i < group.length; i++) {
          const cell = group[i];
          if (cell.tile == null) continue;
          let lastValidCell;
          for (let j = i - 1; j >= 0; j--) {
            const moveToCell = group[j];
            if (!moveToCell.canAccept(cell.tile)) break;
            lastValidCell = moveToCell;
          }
          if (lastValidCell != null) {
            promises.push(cell.tile.waitForTransition());
            if (lastValidCell.tile != null) {
              lastValidCell.mergeTile = cell.tile;
            } else {
              lastValidCell.tile = cell.tile;
            }
            cell.tile = null;
          }
        }
        return promises;
      })
    );
  }
  canMove(type) {
    const cells = this.getOrderedCells(type);
    return cells.some((group) => {
      return group.some((cell, index) => {
        if (index == 0) return false;
        if (cell.tile == null) return false;
        const moveToCell = group[index - 1];
        return moveToCell.canAccept(cell.tile);
      });
    });
  }
  async handleInput(e) {
    const cases = ['up', 'down', 'right', 'left'];
    const moveType = e.key.slice(5).toLowerCase();
    if (cases.includes(moveType)) {
      if (!this.canMove(moveType)) {
        this.setupInput();
        return;
      }
      await this.slideTiles(moveType);
    } else {
      this.setupInput();
      return;
    }
    this.grid.cells.forEach((cell) => {
      const val = cell.mergeTiles();
      if (val > 0) {
        this.score = this.score + val;
      }
    });
    const newTile = new Tile(this.board);
    this.grid.randomEmptyCell().tile = newTile;
    if (
      !this.canMove('up') &&
      !this.canMove('down') &&
      !this.canMove('right') &&
      !this.canMove('left')
    ) {
      newTile.waitForTransition(true).then(() => {
        alert('You lose');
      });
    } else {
      this.setupInput();
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  init();
  const restart = document.querySelector('.restart');
  restart.addEventListener('click', () => init());
});
function init() {
  const board = document.querySelector('.board');
  const game = new Game(board);
  game.grid.randomEmptyCell().tile = new Tile(game.board);
  game.grid.randomEmptyCell().tile = new Tile(game.board);
  game.setupInput();
}
