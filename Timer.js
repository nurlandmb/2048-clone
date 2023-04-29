class Timer {
  interval;
  secondsVal;
  constructor() {
    const timerElem = document.querySelector('.timer');
    timerElem.textContent = "00:00:00";
    this.timerElem = timerElem;
    this.timer = timerElem;
    this.secondsVal = 0;
  }
  start() {
    this.timerElem.textContent = '00:00:00';
    this.secondsVal = 0;
    if(this.interval) return;
    this.interval = setInterval(() => {
      this.seconds++;
    }, 1000);
  }
  stop() {
    clearInterval(this.interval);
  }
  set seconds(val) {
    this.secondsVal = val;
    const hours = this.addZero(this.hours);
    const minutes = this.addZero(this.minutes);
    const leftSeconds = this.addZero(this.seconds);
    this.timer.textContent = `${hours}:${minutes}:${leftSeconds}`;
  }
  addZero(time){
    if(time < 10){
      return "0" + time;
    }else{
      return time;
    }
  }
  get seconds(){
    return this.secondsVal;
  }
  get hours() {
    return Math.floor(this.seconds / 3600);
  }
  get minutes() {
    return Math.floor(this.seconds / 60);
  }
  get leftSeconds(){
    return this.seconds - (this.hours * 3600) - (this.minutes * 60);
  }
}

export default new Timer();