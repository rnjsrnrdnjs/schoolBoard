var timePass;
//class with game logic
class Game {
    constructor(roomId) {
      //room for game
      this.roomId = roomId;
      //array for savings movements of players
      this.board = [];
      //count of moves
      this.moves = 0
    }
  
    //Create the Game board and attach click event to tiles
    createGameBoard() {
      function tileClickHandler() {
        let row, col;
        
        row = game.getRowFromTile(this.id);
        col = game.getColFromTile(this.id);

        //If is not your turn
        if (!player.getCurrentTurn() || !game) {
          alert('Its not your turn!');
          return;
        }

        //In gomoku first move for blacks have to be in the middle tile
        if(game.moves == 0 && !(row == 7 && col == 7)){
          alert('You have to put pawn in the middle of grid!');
          return;
        }
        //In gomoku second move for blacks have to be beyond 5x5 grid in the middle
        else if(game.moves == 2 && (row >= 5 && row <= 9 && col >= 5 && col <= 9)){
          alert('You have to put pawn beyond 5x5 grid in the middle!');
          return;
        }
        //If tile has been already played
        else{
          if (document.getElementById(`${this.id}`).disabled) {
            alert('This tile has already been played on!');
            return;
          }

          //Update board after player turn.
          game.playTurn(this);
          game.updateBoard(player.getPlayerColor(), row, col, this.id);

          //Check if player win
          game.checkWinner();
          
          player.setCurrentTurn(false);
        }
      }    
	  document.getElementById('color').style.background=`${player.getPlayerColor()}`;
      game.createTiles(tileClickHandler);
      if(player.getPlayerColor() != "white" && this.moves == 0){
        game.setTimer();
      }else{
		  document.getElementsByClassName('center')[0].disabled=true;
      }
    }

    //Create tiles for game board
    createTiles(clickHandler){
      //Create tiles in the DOM
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 14; j++) {
			if(i==7 && j==7){
				
			}
		  let btn=document.createElement('div');
		   btn.innerHTML=`<button class="tile" id="button_${i}_${j}"></button>`;
		  document.getElementsByClassName('center')[0].appendChild(btn);	
        }
		  let btn=document.createElement('div');
		  btn.innerHTML=`<button class="tile" id="button_${i}_14" style="float:none;"></button>`;
		  document.getElementsByClassName('center')[0].appendChild(btn);	
      }

      //Attach click listener to tiles
      for (let i = 0; i < 15; i++) {
        this.board.push(['']);
        for (let j = 0; j < 15; j++) {
			document.getElementById(`button_${i}_${j}`).addEventListener('click',clickHandler);
        }
      }
    }

    //Set timer for turn
    setTimer(){
	  document.getElementById('time').innerHTML=`Time : ${player.getTimeForTurn()}`;

      timePass = setInterval(function(){
        player.timeForTurn--;
		document.getElementById('time').innerHTML=`Time : ${player.getTimeForTurn()}`;
        //If time is even zero, then other player wins!
        if(player.getTimeForTurn() == 0){

          let winMessage;

          if(player.getPlayerColor() == "white"){
            winMessage = "black";
          }else{
            winMessage = "white";
          }

          socket.emit('gameEnded', {
            room: game.getRoomId(),
            message: winMessage,
          });  

          game.endGameMessage(winMessage);

          clearInterval(timePass);
        }
      },1000);
    }

    //Remove the menu from DOM, display the gameboard
    displayBoard(message) {
	  document.getElementsByClassName('menu')[0].style.display='none';
	  document.getElementsByClassName('gameBoard')[0].style.display='block';
	  document.getElementById('userHello').innerHTML=message;
      this.createGameBoard();
    }

    //Update board
    updateBoard(color, row, col, tile) {
      clearInterval(timePass);
	  document.getElementById('time').innerHTML=`Not your turn!`;
	  document.getElementsByClassName('center')[0].disabled=true;
      if(!player.getCurrentTurn()){
        game.setTimer();
        document.getElementsByClassName('center')[0].disabled=false;
      }
		
		//background = "url('이미지 경로') no-repeat 0 0";

	  document.getElementById(`${tile}`).style.backgroundImage=`url(/${color}Pawn.png)`;
	  document.getElementById(`${tile}`).disabled=true;
      //$(`#${tile}`).css("backgroundImage", `url(images/${color}Pawn.png)`).prop('disabled', true);
      this.board[row][col] = color[0];
      this.moves++;
    }

    //Get row from tile id
    getRowFromTile(id){
      let row;
      if(id.split('_')[1][1] != undefined){
        row = id.split('_')[1][0] + id.split('_')[1][1];
      }else
      {
        row = id.split('_')[1][0];
      }
      return row;
    }

    //Get column from tile id
    getColFromTile(id){
      let col;
      if(id.split('_')[2][1] != undefined){
          col = id.split('_')[2][0] + id.split('_')[2][1];
      }else
      {
        col = id.split('_')[2][0];
      }
     return col;
    }

    getRoomId() {
      return this.roomId;
    }

    // Send an update to the opponent game board
    playTurn(tile) {
		
		console.log(tile.id);
		
	  const clickedTile =	tile.id;
      //const clickedTile = $(tile).attr('id');

      //Emit that turn was played by player
      socket.emit('playTurn', {
        tile: clickedTile,
        room: this.getRoomId(),
      });
    }

    //When game is ended send message to player about winner
    endGameMessage(message){
        $('.tile').attr('disabled', true);

      setTimeout(function(){
        $( ".gameBoard").css('display', 'none');
        $( ".center" ).empty();
  
        if(message.includes(player.getPlayerColor())){
           $("#alert").text("You win!");
           setTimeout(function(){
            location.reload();
          }, 2000);
        }else if(message.includes('disconnected')){
          $("#alert").text(message);
          setTimeout(function(){
            location.reload();
          }, 2000);
        }else if(message.includes('draw')){
          $("#alert").text(message);
          setTimeout(function(){
            location.reload();
          }, 2000);
        }else{
          $("#alert").text("You loose!");
          setTimeout(function(){
            location.reload();
          }, 2000);
        }
  
        $('.menu').css('display', 'block');
        $( ".welcome" ).remove();
      }, 1000);
    }

    //Check if player has 5 pawns in row
    checkInHorizontal(color){
      let value = 0;
      for(let row=0; row<15; row++){
        value = 0;
        for(let col=0; col<15; col++){
          if(game.board[row][col] != color){
            value = 0;
          }else{
            value++;
          }
          if(value == 5){
            this.announceWinner();
            return;
          }
        }
      }
    }

    //Check if player has 5 pawns in column
    checkInVertical(color){
      let value = 0;
      for(let col=0; col<15; col++){
        value = 0;
        for(let row=0; row<15; row++){
          if(game.board[row][col] != color){
            value = 0;
          }else{
            value++;
          }
          if(value == 5){
            this.announceWinner();
            return;
          }
        }
      }
    }

    //Check if player has 5 pawns in diagonal from top left to bottom right
    checkInDiagonalTopLeftBottomRight(color){
      for(let col = 0; col < 10; col++){
        for(let row = 0; row < 10; row++)
        {
            let match = true;
            for(let i = 0; i < 5; i++)
            {
                if(color != game.board[row + i][col + i]){
                  match = false;
                }                     
            }
            if(match){
              this.announceWinner();
              return;
            }
        }
      }  
    }

    //Check if player has 5 pawns in diagonal from top right to bottom left
    checkInDiagonalTopRightBottomLeft(color){
      for(let col = 0; col < 15; col++){
        if(col>4){
          for(let row = 0; row < 10; row++)
          {
              let match = true;
                for(let i = 0; i < 5; i++)
                {
                    if(color != game.board[row + i][col - i]){
                      match = false;
                    }                     
                }
            
              if(match){
                this.announceWinner();
                return;
              }
          }
        }
      }  
    }
    
    //Check if player win after his move
    checkWinner() {
      this.checkInHorizontal(player.getPlayerColor()[0]);
      this.checkInVertical(player.getPlayerColor()[0]);
      this.checkInDiagonalTopLeftBottomRight(player.getPlayerColor()[0]);
      this.checkInDiagonalTopRightBottomLeft(player.getPlayerColor()[0]);

      //If board is full of pawns and no-one win then send that is draw 
      const drawMessage = 'Game ended with draw';
      if (this.checkdraw()) {
        socket.emit('gameEnded', {
          room: this.getRoomId(),
          message: drawMessage,
        });
        this.endGameMessage(drawMessage);
      }
    }

    checkdraw() {
      return this.moves >= 15*15;
    }

    //When player is disconnected
    onDisconnected(){
      const message = 'Game ended with disconnected';
      socket.emit('gameEnded', {
        room: this.getRoomId(),
        message: message,
      });
    }

    //Announce if winner is in current client, and broadcast this message to opponent
    announceWinner() {
      const message = player.getPlayerColor();
      socket.emit('gameEnded', {
        room: this.getRoomId(),
        message,
      });
      this.endGameMessage(message);
    }
  }