import Grid from './Grid.js';
import Tile from './Tile.js';
import Timer from './Timer.js';
class Game {
  autoplayInterval;
  level;
  constructor(board, level) {
    const scoreElem = document.querySelector('.score');
    scoreElem.textContent = '';
    this.scoreElem = scoreElem;
    this.board = board;
    this.grid = new Grid(board);
    this.timer = Timer;
    this.timer.start();
    this.level = level;
    this.record = localStorage.getItem('record') || 0;
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
  turnAutoplay() {
    const keys = ['Up', 'Down', 'Right', 'Left'];
    if (this.autoplayInterval) return;
    this.autoplayInterval = setInterval(() => {
      for (let i = 0; i < keys.length; i++) {
        if (this.canMove(keys[i].toLowerCase())) {
          this.handleInput({ key: 'Arrow' + keys[i] });
          break;
        }
      }
    }, 1000);
  }
  turnOffAutoplay() {
    clearInterval(this.autoplayInterval);
    this.autoplayInterval = null;
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
    const newTile = new Tile(this.board, this.level);
    this.grid.randomEmptyCell().tile = newTile;
    this.isLosed();
    if (
      !this.canMove('up') &&
      !this.canMove('down') &&
      !this.canMove('right') &&
      !this.canMove('left')
    ) {
      newTile.waitForTransition(true).then(() => {
        if (this.score > this.record) {
          localStorage.setItem('record', this.score);
          const recordElem = document.querySelector('.record');
          recordElem.textContent = `High score: ${this.score}`;
          alert('You beat the record');
        } else {
          alert('You lose');
        }
        this.timer.stop();
      });
    } else {
      this.setupInput();
    }
  }
  isLosed() {}
}
document.addEventListener('DOMContentLoaded', () => {
  let game = init();
  const restart = document.querySelector('.restart');
  const levelBtns = document.querySelectorAll('.level');
  const botBtn = document.querySelector('.bot');
  const recordElem = document.querySelector('.record');
  const recordVal = localStorage.getItem('record') || 0;
  if(recordVal){
    recordElem.textContent = `High score: ${recordVal}`;
  }
  botBtn.addEventListener('click', (e) => {
    if (!e.target.classList.contains('active')) {
      game.turnAutoplay();
      e.target.classList.add('active');
    } else {
      game.turnOffAutoplay();
      e.target.classList.remove('active');
    }
  });
  levelBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      levelBtns.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add("active");
      const level = e.target.dataset.level;
      game.level = level;
    });
  });
  restart.addEventListener('click', () => (game = init()));
});
function init() {
  const board = document.querySelector('.board');
  const game = new Game(board, 1);
  game.grid.randomEmptyCell().tile = new Tile(game.board, 1);
  game.grid.randomEmptyCell().tile = new Tile(game.board, 1);
  game.setupInput();
  return game;
}
