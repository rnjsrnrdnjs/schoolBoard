class Player {
    constructor(name, color) {
      this.name = name;
      this.color = color;
      this.currentTurn = false;
      this.timeForTurn = 30;
    }
  
    setCurrentTurn(turn) {
      this.currentTurn = turn;
      this.timeForTurn = 30;
      const message = turn ? '당신의 차례입니다 :' : '상대의 차례입니다 :';
	  document.getElementById('turn').innerHTML=message;
    }
  
    getPlayerName() {
      return this.name;
    }
  
    getPlayerColor() {
      return this.color;
    }

    getTimeForTurn(){
      return this.timeForTurn;
    }
  
    getCurrentTurn() {
      return this.currentTurn;
    }
  }