export default class Tile{
  #x;
  #tileElement;
  #y;
  #value;
  constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4){
    
    this.#tileElement = document.createElement('div');
    this.#tileElement.classList.add('tile');
    tileContainer.append(this.#tileElement);
    this.value = value;
  }
  set value(v){
    this.#value = v;
    this.#tileElement.textContent = v;
    this.#tileElement.style.background = `var(--tile-${v})`;

  }
  get value(){
    return this.#value;
  }
  set x(value){
    this.#x = value;
    this.#tileElement.style.setProperty('--x', value);
  }
  set y(value){
    this.#y = value;
    this.#tileElement.style.setProperty('--y', value);
  }
  remove(){
    this.#tileElement.remove();
  }
  waitForTransition(animation = false){
    return new Promise((res, rej) => {
      this.#tileElement.addEventListener(animation ? "animationend" : "transitionend", res, {once: true})
    })
  }
}