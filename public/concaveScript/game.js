var timePass;
//class with game logic
class Game {
    constructor(roomId) {
        //room for game
        this.roomId = roomId;
        //array for savings movements of players
        this.board = [];
        //count of moves
        this.moves = 0;
    }
	
    //Create the Game board and attach click event to tiles
    createGameBoard() {
        function tileClickHandler() {
            let row, col;

            row = game.getRowFromTile(this.id);
            col = game.getColFromTile(this.id);
            //If is not your turn
            if (!player.getCurrentTurn() || !game) {
                return;
            }
            else {
                if (document.getElementById(`${this.id}`).disabled) {
                    return;
                }
				if(player.getPlayerColor()=='black' ){
					console.log(game.checkBlack33(row,col));
					/*
					if(checkBlack33(row,col)==true){
					   alert('흑돌은 3x3 자리에 둘수없습니다.')
					   return;
					}*/
					/*
					if(checkBlack44(row,col)){
					   alert('흑돌은 4x4 자리에 둘수없습니다.')
					   return;
					}
					if(checkBlack66(row,col)){
					   alert('흑돌은 6목 이상에 둘수없습니다.')
					   return;
					}*/
				}

                //Update board after player turn.
                game.playTurn(this);
                game.updateBoard(player.getPlayerColor(), row, col, this.id);

                //Check if player win
                game.checkWinner();

                player.setCurrentTurn(false);
            }
        }
        document.getElementById('color').style.background = `${player.getPlayerColor()}`;
        game.createTiles(tileClickHandler);
        if (player.getPlayerColor() != 'white' && this.moves == 0) {
            game.setTimer();
        } else {
            document.getElementsByClassName('center')[0].disabled = true;
        }
    }

    //Create tiles for game board
    createTiles(clickHandler) {
        //Create tiles in the DOM
        let btn = document.createElement('div');
        btn.innerHTML = `<button class="tile" id="button_0_0" style="background-image:url(/crossLeftTop.png);"></button>`;
        document.getElementsByClassName('center')[0].appendChild(btn);
        for (let i = 1; i < 14; i++) {
            btn = document.createElement('div');
            btn.innerHTML = `<button class="tile" id="button_0_${i}" style="background-image:url(/crossTop.png);"></button>`;
            document.getElementsByClassName('center')[0].appendChild(btn);
        }
        btn = document.createElement('div');
        btn.innerHTML = `<button class="tile" id="button_0_14" style="background-image:url(/crossRightTop.png);float:none; "></button>`;
        document.getElementsByClassName('center')[0].appendChild(btn);

        for (let i = 1; i < 14; i++) {
            btn = document.createElement('div');
            btn.innerHTML = `<button class="tile" id="button_${i}_0" style="background-image:url(/crossLeft.png);"></button>`;
            document.getElementsByClassName('center')[0].appendChild(btn);

            for (let j = 1; j < 14; j++) {
                if (i == 7 && j == 7) {
                    btn = document.createElement('div');
                    btn.innerHTML = `<button class="tile" id="button_${i}_${j}" style="background-image:url(/crossCenter.png);"></button>`;
                    document.getElementsByClassName('center')[0].appendChild(btn);
                } else {
                    btn = document.createElement('div');
                    btn.innerHTML = `<button class="tile" id="button_${i}_${j}"></button>`;
                    document.getElementsByClassName('center')[0].appendChild(btn);
                }
            }
            btn = document.createElement('div');
            btn.innerHTML = `<button class="tile" id="button_${i}_14" style="background-image:url(/crossRight.png);float:none;"></button>`;
            document.getElementsByClassName('center')[0].appendChild(btn);
        }
        btn = document.createElement('div');
        btn.innerHTML = `<button class="tile" id="button_14_0" style="background-image:url(/crossLeftBottom.png);"></button>`;
        document.getElementsByClassName('center')[0].appendChild(btn);
        for (let i = 1; i < 14; i++) {
            btn = document.createElement('div');
            btn.innerHTML = `<button class="tile" id="button_14_${i}" style="background-image:url(/crossBottom.png);"></button>`;
            document.getElementsByClassName('center')[0].appendChild(btn);
        }
        btn = document.createElement('div');
        btn.innerHTML = `<button class="tile" id="button_14_14" style="background-image:url(/crossRightBottom.png);float:none;"></button>`;
        document.getElementsByClassName('center')[0].appendChild(btn);

        //Attach click listener to tiles
        for (let i = 0; i < 15; i++) {
            this.board.push(['']);
            for (let j = 0; j < 15; j++) {
                document.getElementById(`button_${i}_${j}`).addEventListener('click', clickHandler);
            }
        }
    }

    //Set timer for turn
    setTimer() {
			socket.emit('time',{
				room:game.getRoomId(),
				time:player.getTimeForTurn(),
			});

        timePass = setInterval(function () {
            player.timeForTurn--;
			socket.emit('time',{
				room:game.getRoomId(),
				time:player.getTimeForTurn(),
			});
            //If time is even zero, then other player wins!
            if (player.getTimeForTurn() == 0) {
                let winMessage;

                if (player.getPlayerColor() == 'white') {
                    winMessage = 'black';
                } else {
                    winMessage = 'white';
                }

                socket.emit('gameEnded', {
                    room: game.getRoomId(),
					lose:player.getPlayerId(),
                    message: winMessage,
                });

                game.endGameMessage(winMessage);

                clearInterval(timePass);
            }
        }, 1000);
    }

    //Remove the menu from DOM, display the gameboard
    displayBoard(message) {
        document.getElementsByClassName('menu')[0].style.display = 'none';
        document.getElementsByClassName('gameBoard')[0].style.display = 'block';
        this.createGameBoard();
    }

    //Update board
    updateBoard(color, row, col, tile) {
        clearInterval(timePass);
        document.getElementsByClassName('center')[0].disabled = true;
        if (!player.getCurrentTurn()) {
            game.setTimer();
            document.getElementsByClassName('center')[0].disabled = false;
        }

        document.getElementById(`${tile}`).style.backgroundImage = `url(/${color}Pawn.png)`;
        document.getElementById(`${tile}`).disabled = true;
        this.board[row][col] = color[0];
        this.moves++;
    }

    //Get row from tile id
    getRowFromTile(id) {
        let row;
        if (id.split('_')[1][1] != undefined) {
            row = id.split('_')[1][0] + id.split('_')[1][1];
        } else {
            row = id.split('_')[1][0];
        }
        return row;
    }

    //Get column from tile id
    getColFromTile(id) {
        let col;
        if (id.split('_')[2][1] != undefined) {
            col = id.split('_')[2][0] + id.split('_')[2][1];
        } else {
            col = id.split('_')[2][0];
        }
        return col;
    }

    getRoomId() {
        return this.roomId;
    }

    // Send an update to the opponent game board
    playTurn(tile) {
        const clickedTile = tile.id;
        socket.emit('playTurn', {
            tile: clickedTile,
            room: this.getRoomId(),
        });
    }

    //When game is ended send message to player about winner
    endGameMessage(message) {
		document.getElementsByClassName('tile').disabled=true;
        setTimeout(function () {
			document.getElementsByClassName('gameBoard')[0].style.display='none';
            if (message.includes(player.getPlayerColor())) {
				document.getElementById('alert').innerHTML='당신의 승리!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else if (message.includes('disconnected')) {
				document.getElementById('alert').innerHTML='당신의 승리!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else if (message.includes('draw')) {
				document.getElementById('alert').innerHTML='무승부!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else {
				document.getElementById('alert').innerHTML='당신의 패배!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            }
			document.getElementsByClassName('menu')[0].style.display="block";
        }, 1000);
    }
	checkBlack33(x,y){
		let cnt=0;
		let chkBlack=0;
		//toRight
		if(x-1>0 && game.board[x-1][y]=='b')
		   chkBlack++;
		if(x+1<15 && game.board[x+1][y]=='b')
		   chkBlack++;
		if(x+2<15 && game.board[x+2][y]=='b')
		   chkBlack++;
		if(x-1>0 && game.board[x-1][y]=='w')
		   chkBlack=-10;
		if(game.board[x][y]=='w')
		   chkBlack=-10;
		if(x+1<15 && game.board[x+1][y]=='w')
		   chkBlack=-10;
		if(x+2<15 && game.board[x+2][y]=='w')
		   chkBlack=-10;
		if(chkBlack==2)cnt++;
		chkBlack=0;
		//toRightTop
		if(x-1>0 && y-1>0 && game.board[x-1][y-1]=='b')
		   chkBlack++;
		if(x+1<15 && y+1<15 && game.board[x+1][y+1]=='black')
		   chkBlack++;
		if(x+2<15 && y+2<15 && game.board[x+2][y+2]=='black')
		   chkBlack++;
		if(chkBlack==2)cnt++;
		chkBlack=0;
		//toTop
		if(x-1>0 && game.board[x][y+1]=='black')
		   chkBlack++;
		if(x+1<15 && game.board[x+1][y]=='black')
		   chkBlack++;
		if(x+2<15 && game.board[x+2][y]=='black')
		   chkBlack++;
		if(toRight==2)cnt++;
		chkBlack=0;
		//toLeftTop
		//toLeft
		//toLeftBottom
		//toBottom
		//toRightBottom

		return false;
		
		
	}
	checkBlack44(y,x){
		return false;
		
	}
	checkBlack66(y,x){
		return false;
		
	}
    //Check if player has 5 pawns in row
    checkInHorizontal(color) {
        let value = 0;
        for (let row = 0; row < 15; row++) {
            value = 0;
            for (let col = 0; col < 15; col++) {
                if (game.board[row][col] != color) {
                    value = 0;
                } else {
                    value++;
                }
                if (value == 5) {
                    this.announceWinner();
                    return;
                }
            }
        }
    }

    //Check if player has 5 pawns in column
    checkInVertical(color) {
        let value = 0;
        for (let col = 0; col < 15; col++) {
            value = 0;
            for (let row = 0; row < 15; row++) {
                if (game.board[row][col] != color) {
                    value = 0;
                } else {
                    value++;
                }
                if (value == 5) {
                    this.announceWinner();
                    return;
                }
            }
        }
    }

    //Check if player has 5 pawns in diagonal from top left to bottom right
    checkInDiagonalTopLeftBottomRight(color) {
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row < 10; row++) {
                let match = true;
                for (let i = 0; i < 5; i++) {
                    if (color != game.board[row + i][col + i]) {
                        match = false;
                    }
                }
                if (match) {
                    this.announceWinner();
                    return;
                }
            }
        }
    }

    //Check if player has 5 pawns in diagonal from top right to bottom left
    checkInDiagonalTopRightBottomLeft(color) {
        for (let col = 0; col < 15; col++) {
            if (col > 4) {
                for (let row = 0; row < 10; row++) {
                    let match = true;
                    for (let i = 0; i < 5; i++) {
                        if (color != game.board[row + i][col - i]) {
                            match = false;
                        }
                    }

                    if (match) {
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
        return this.moves >= 15 * 15;
    }

    //When player is disconnected
    onDisconnected() {
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
			win:player.getPlayerId(),
            message,
        });
        this.endGameMessage(message);
    }
}