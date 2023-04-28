class Grid {
  constructor(gridElement) {
    this.cells = this.createCellElements(gridElement).map((cell, i) => {
      return new Cell(cell, i % 4, Math.floor(i / 4));
    });
  }
  get emptyCells() {
    return this.cells.filter((cell) => cell.tile == null);
  }
  get cellsByColumn() {
    return this.cells.reduce((cellGrid, cell) => {
      cellGrid[cell.x] = cellGrid[cell.x] || [];
      cellGrid[cell.x][cell.y] = cell;
      return cellGrid;
    }, []);
  }
  get cellsByRow(){
    return this.cells.reduce((cellGrid, cell) => {
      cellGrid[cell.y] = cellGrid[cell.y] || [];
      cellGrid[cell.y][cell.x] = cell;
      return cellGrid;
    }, [])
  }
  randomEmptyCell() {
    const randomIndex = Math.floor(Math.random() * this.emptyCells.length);
    return this.emptyCells[randomIndex];
  }
  createCellElements(gridElement) {
    const cells = [];
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cells.push(cell);
    }
    gridElement.append(...cells);
    return cells;
  }
}
class Cell {
  #tile;
  #mergeTile;
  constructor(cellElement, x, y) {
    this.cellElement = cellElement;
    this.x = x;
    this.y = y;
  }
  get tile() {
    return this.#tile;
  }
  set tile(value) {
    this.#tile = value;
    if (value == null) return;
    this.#tile.x = this.x;
    this.#tile.y = this.y;
  }
  get mergeTile() {
    return this.#mergeTile;
  }
  set mergeTile(value) {
    this.#mergeTile = value;
    if (value === null) {
      return;
    }
    this.#mergeTile.x = this.x;
    this.#mergeTile.y = this.y;
  }
  canAccept(tile) {
    return (
      this.tile == null ||
      (this.mergeTile == null && this.tile.value === tile.value)
    );
  }
  mergeTiles(){
    if(this.#tile == null || this.mergeTile == null) return;
    this.tile.value = this.tile.value * 2;
    this.mergeTile.remove();
    this.#mergeTile = null;
  }
}
export default Grid;
