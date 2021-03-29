var timePass;
const BOARD_SIZE = 15;
const STONE_WHITE = 'w';
const STONE_BLACK = 'b';
const STONE_NONE = 'undefined';


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
            } else {
                if (document.getElementById(`${this.id}`).disabled) {
                    return;
                }
                if (player.getPlayerColor() == 'black') {
                    if (game.checkBlack33(col,row) == false) {
                        alert('흑돌은 3x3 4x4 6목 이상의 자리에 둘수없습니다.');
                        return;
                    }
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
        socket.emit('time', {
            room: game.getRoomId(),
            time: player.getTimeForTurn(),
        });

        timePass = setInterval(function () {
            player.timeForTurn--;
            socket.emit('time', {
                room: game.getRoomId(),
                time: player.getTimeForTurn(),
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
                    lose: player.getPlayerId(),
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
        document.getElementsByClassName('tile').disabled = true;
        setTimeout(function () {
            document.getElementsByClassName('gameBoard')[0].style.display = 'none';
            if (message.includes(player.getPlayerColor())) {
                document.getElementById('alert').innerHTML = '당신의 승리!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else if (message.includes('disconnected')) {
                document.getElementById('alert').innerHTML = '당신의 승리!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else if (message.includes('draw')) {
                document.getElementById('alert').innerHTML = '무승부!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            } else {
                document.getElementById('alert').innerHTML = '당신의 패배!';
                setTimeout(function () {
                    location.reload();
                }, 2000);
            }
            document.getElementsByClassName('menu')[0].style.display = 'block';
        }, 1000);
    }
    checkBlack33(row, col) {
        let x, y;
		let _x=parseInt(row),_y=parseInt(col);
        var _stone = player.getPlayerColor();
        // 돌 카운트 변수들
        var count; // 단순 카운팅
        var count_black; // 흑돌 카운팅
        var count_none; // 빈칸 카운팅
        var count_white; // 백돌 카운팅

        // 3x3, 4x4 판단용 boolean 변수들
        var hori_33 = false; // 가로 33
        var vert_33 = false; // 세로 33
        var ltrb_33 = false; // 대각선↘ 33
        var rtlb_33 = false; // 대각선↙ 33
        var hori_44 = false; // 가로 44
        var vert_44 = false; // 세로 44
        var ltrb_44 = false; // 대각선↘ 44
        var rtlb_44 = false; // 대각선↙ 44

		
            // 금수는 흑에게만 적용
            /*      3*3 판별 로직      */
            // 가로 방향 카운팅
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            // 가로 우 방향
            for (var i = 1; i < 4; i++) {

                // 게임판 탈출 방지 루틴
                if (x + i > BOARD_SIZE - 1) break;  //x, y 위치 바꾸기
				if (game.board[_y][x + i] != STONE_WHITE) {
                    if (game.board[_y][x + i] == STONE_BLACK) {
                        count_black++;
                    } else  {
                        count_none++;
                    }
                } else if (game.board[_y][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && x + i + 1 < BOARD_SIZE)
                    if (game.board[_y][x + i + 1] == STONE_WHITE) count_white++;
            }
            // 가로 우 방향 열린 3 여부 체킹
            var tmp_hori_33 = true;
            if (count_none <= count_white) tmp_hori_33 = false;
			
            // 가로 좌 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (x - i < 0) break;
                if (game.board[_y][x - i] != STONE_WHITE) {
                    if (game.board[_y][x - i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[_y][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && x - i - 1 >= 0)
                    if (game.board[_y][x - i - 1] == STONE_WHITE) count_white++;
            }
            // 둘다 열린 3이면서 흑돌이 3개인 경우
            if (count_none - count_white > 3 && tmp_hori_33 && count_black == 3) hori_33 = true; // 가로 방향 3x3 판정

            // 세로 방향 카운팅
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            // 세로 하 방향
            for (let i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y + i > BOARD_SIZE - 1) break;
                if (game.board[y + i][_x] != STONE_WHITE) {
                    if (game.board[y + i][_x] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][_x] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y + i + 1 < BOARD_SIZE)
                    if (game.board[y + i + 1][_x] == STONE_WHITE) count_white++;
            }
            // 세로 하 방향 열린 3 여부 체킹
            var tmp_vert_33 = true;
            if (count_none <= count_white) tmp_vert_33 = false;

            // 세로 상 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y - i < 0) break;
                if (game.board[y - i][_x] != STONE_WHITE) {
                    if (game.board[y - i][_x] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y - i][_x] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y - i - 1 >= 0)
                    if (game.board[y - i - 1][_x] == STONE_WHITE) count_white++;
            }
            // 둘다 열린 3면서 흑돌이 3개인 경우
            if (count_none - count_white > 3 && tmp_vert_33 && count_black == 3) vert_33 = true; // 세로 방향 33 판정

            // 대각선↘
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            // 대각선 우 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y + i > BOARD_SIZE - 1 || x + i > BOARD_SIZE - 1) break;
                if (game.board[y + i][x + i] != STONE_WHITE) {
                    if (game.board[y + i][x + i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y + i + 1 < BOARD_SIZE && x + i + 1 < BOARD_SIZE)
                    if (game.board[y + i + 1][x + i + 1] == STONE_WHITE) count_white++;
            }
            // 대각선 우 방향 열린 3 여부 체킹
            var tmp_ltrb_33 = true;
            if (count_none <= count_white) tmp_ltrb_33 = false;

            // 대각선 좌 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y - i < 0 || x - i < 0) break;
                if (game.board[y - i][x - i] != STONE_WHITE) {
                    if (game.board[y - i][x - i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y - i][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y - i - 1 >= 0 && x - i - 1 >= 0)
                    if (game.board[y - i - 1][x - i - 1] == STONE_WHITE) count_white++;
            }
            // 둘다 열린 3 이면서 흑돌이 3개인 경우
            if (count_none - count_white > 3 && tmp_ltrb_33 && count_black == 3) ltrb_33 = true; // 대각선↘ 방향 33 판정

            // 대각선↙
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;
            // 대각선 좌 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y + i > BOARD_SIZE - 1 || x - i < 0) break;
                if (game.board[y + i][x - i] != STONE_WHITE) {
                    if (game.board[y + i][x - i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y + i + 1 < BOARD_SIZE && x - i - 1 >= 0)
                    if (game.board[y + i + 1][x - i - 1] == STONE_WHITE) count_white++;
            }
            // 대각선 좌 방향 열린 3 여부 체킹
            var tmp_rtlb_33 = true;
            if (count_none <= count_white) tmp_rtlb_33 = false;
            // 대각선 우 방향
            for (var i = 1; i < 4; i++) {
                // 게임판 탈출 방지 루틴
                if (y - i < 0 || x + i > BOARD_SIZE - 1) break;
                if (game.board[y - i][x + i] != STONE_WHITE) {
                    if (game.board[y - i][x + i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y - i][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
                // 기본적으로 3칸까지만 카운팅 하고, 4번째 칸이 백돌일때만 추가 카운팅
                if (i == 3 && y - i - 1 >= 0 && x + i + 1 < BOARD_SIZE)
                    if (game.board[y - i - 1][x + i + 1] == STONE_WHITE) count_white++;
            }
            // 둘다 열린 3 이면서 흑돌이 3개인 경우
            if (count_none - count_white > 3 && tmp_rtlb_33 && count_black == 3) rtlb_33 = true; // 대각선↙ 방향 33 판정
            /*      4*4 판별 로직      */
            // 가로
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            for (var i = 1; i < 5; i++) {
                if (x + i > BOARD_SIZE - 1) break;
                if (game.board[_y][x + i] != STONE_WHITE) {
                    if (game.board[_y][x + i] == STONE_BLACK) {
                        count_black++;
                    } else{
                        count_none++;
                    }
                } else if (game.board[_y][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            for (var i = 1; i < 5; i++) {
                if (x - i < 0) break;
                if (game.board[_y][x - i] != STONE_WHITE) {
                    if (game.board[_y][x - i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[_y][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            // 둘다 열린 4 이면서 흑돌이 4개인 경우
            if (count_none >= count_white && count_black == 4) hori_44 = true; // 가로 방향 44 판정

            // 세로
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            for (var i = 1; i < 5; i++) {
                if (y + i > BOARD_SIZE - 1) break;
                if (game.board[y + i][_x] != STONE_WHITE) {
                    if (game.board[y + i][_x] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][_x] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            for (var i = 1; i < 5; i++) {
                if (y - i < 0) break;
                if (game.board[y - i][_x] != STONE_WHITE) {
                    if (game.board[y - i][_x] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y - i][_x] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }
			
            // 둘다 열린 4 이면서 흑돌이 4개인 경우
            if (count_none >= count_white && count_black == 4) vert_44 = true; // 세로 방향 44 판정

            // 대각선↘
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            for (var i = 1; i < 5; i++) {
                if (y + i > BOARD_SIZE - 1 || x + i > BOARD_SIZE - 1) break;
                if (game.board[y + i][x + i] != STONE_WHITE) {
                    if (game.board[y + i][x + i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            for (var i = 1; i < 5; i++) {
                if (y - i < 0 || x - i < 0) break;
                if (game.board[y - i][x - i] != STONE_WHITE) {
                    if (game.board[y - i][x - i] == STONE_BLACK) {
                        count_black++;
                    } else{
                        count_none++;
                    }
                } else if (game.board[y - i][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            // 둘다 열린 4 이면서 흑돌이 4개인 경우
            if (count_none >= count_white && count_black == 4) ltrb_44 = true; // 대각선↘ 방향 44 판정

            // 대각선↙ new
            x = _x;
            y = _y;
            count_black = 1;
            count_none = 0;
            count_white = 0;

            for (var i = 1; i < 5; i++) {
                if (y + i > BOARD_SIZE - 1 || x - i < 0) break;
                if (game.board[y + i][x - i] != STONE_WHITE) {
                    if (game.board[y + i][x - i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y + i][x - i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            for (var i = 1; i < 5; i++) {
                if (y - i < 0 || x + i > BOARD_SIZE - 1) break;
                if (game.board[y - i][x + i] != STONE_WHITE) {
                    if (game.board[y - i][x + i] == STONE_BLACK) {
                        count_black++;
                    } else {
                        count_none++;
                    }
                } else if (game.board[y - i][x + i] == STONE_WHITE) {
                    count_white++;
                    break;
                }
            }

            // 둘다 열린 4 이면서 흑돌이 4개인 경우
            if (count_none >= count_white && count_black == 4) rtlb_44 = true; // 대각선↙ 방향 44 판정

            // 3*3 판정 결과중 가로,세로,대각선 2개방향 중 2개이상이 해당될 경우(3*3 인 상황)
            if (hori_33 + vert_33 + ltrb_33 + rtlb_33 >= 2) {
                // 33 판정 결과 먼저 확인
                return false; // 금수 처리
            }
            // 4*4 판정 결과중 가로,세로,대각선 2개방향 중 2개이상이 해당될 경우(4*4 인 상황)
            else if (hori_44 + vert_44 + ltrb_44 + rtlb_44 >= 2) {
                return false; // 금수 처리
            }

            /*      4*4 예외 판별 로직      */
            /* 위의 4*4 판별 로직에서 걸러낼수 없는 동일 축 내에서 2개의 44가 발생하는 경우 */
            /* ●●빈●●빈●● 이거랑 ●빈●●●빈● 패턴 찾아내기 */
            // 패턴 문자열 변수들
            var hori_44 = '';
            var vert_44 = '';
            var ltrb_44 = '';
            var rtlb_44 = '';

            // 가로
            // 모든 가로축에 돌들에 대해 수집
            for (var i = 0; i < BOARD_SIZE; i++) {
                hori_44 = hori_44.concat(game.board[_y][i]);
            }

            // 세로
            // 모든 세로축에 돌들에 대해 수집
            for (var i = 0; i < BOARD_SIZE; i++) {
                vert_44 = vert_44.concat(game.board[i][_x]);
            }

            // 대각선 ↘
            // 모든 대각선 ↘에 돌들에 대해 수집
            x = _x;
            y = _y;

            // 대각선 끝점 찾기
            while (y > 0 && x > 0) {
                y--;
                x--;
            }

            do {
                ltrb_44 = ltrb_44.concat(game.board[y][x]);
            } while (++y < BOARD_SIZE && ++x < BOARD_SIZE);

            // 대각선 ↙
            // 모든 대각선 ↙의 돌들에 대해 수집
            x = _x;
            y = _y;

            // 대각선 끝점 찾기
            while (y > 0 && x < BOARD_SIZE-1) {
                y--;
                x++;
            }

            do {
                rtlb_44 = rtlb_44.concat(game.board[y][x]);
            } while (++y < BOARD_SIZE && --x > 0);
            // 찾아낼 착수 패턴 문자열 변수들
            let pt1 =`${STONE_BLACK}${STONE_BLACK}${STONE_NONE}${STONE_BLACK}${STONE_BLACK}${STONE_NONE}${STONE_BLACK}${STONE_BLACK}`;

            let pt2 =`${STONE_BLACK}${STONE_NONE}${STONE_BLACK}${STONE_BLACK}${STONE_BLACK}${STONE_NONE}${STONE_BLACK}`;
            // 가로,세로,대각선2방향의 돌 정보중 패턴이 하나라도 포함될 경우, 44 예외 판정
            if (hori_44.includes(pt1) || hori_44.includes(pt2))
                // 가로
                return false;
            // 금수 처리
            else if (vert_44.includes(pt1) || vert_44.includes(pt2))
                // 세로
                return false;
            else if (ltrb_44.includes(pt1) || ltrb_44.includes(pt2))
                // 대각선↘
                return false;
            else if (rtlb_44.includes(pt1) || rtlb_44.includes(pt2))
                // 대각선↙
                return false;
		
            /* 5,6목 이상 판별 로직 */
            // 가로
            x = _x;
            y = _y;
            count = 0;
            // 카운팅 시작점 찾기
            while (--x >= 0 && game.board[_y][x] == STONE_BLACK)count++;
            // 카운팅
            x = _x;
            y = _y;
			while (++x < BOARD_SIZE && game.board[_y][x] == STONE_BLACK) count++;

            // 6목 이상일 경우
		console.log(count);
            if (count >= 5) return false;

            // 세로
            x = _x;
            y = _y;
            count = 0;
            // 카운팅 시작점 찾기
            while (--y >= 0 && game.board[y][_x] == STONE_BLACK)count++;
            // 카운팅
            x = _x;
            y = _y;
            while (++y < BOARD_SIZE && game.board[y][_x] == STONE_BLACK) count++;

            if (count >= 5) return false;

            // 대각선 ↘
            x = _x;
            y = _y;
            count = 0;
            // 카운팅 시작점 찾기
            while (--x >= 0 && --y >= 0 && game.board[y][x] == STONE_BLACK) count++;
            // 카운팅
            x = _x;
            y = _y;
            while (++x < BOARD_SIZE && ++y < BOARD_SIZE && game.board[y][x] == STONE_BLACK) count++;

        if (count >=5) return false;

            // 대각선 ↙
            x = _x;
            y = _y;
            count = 0;
            // 카운팅 시작점 찾기
            while (++x < BOARD_SIZE && --y >= 0 && game.board[y][x] == STONE_BLACK)count++;
            // 카운팅
            x = _x;
            y = _y;
            while (--x >= 0 && ++y < BOARD_SIZE && game.board[y][x] == STONE_BLACK) count++;

            if (count >= 5) return false;
        // 모든 금수 로직에 걸리지 않았을 경우
        return true; // 정상 착수 처리
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
            win: player.getPlayerId(),
            message,
        });
        this.endGameMessage(message);
    }
}