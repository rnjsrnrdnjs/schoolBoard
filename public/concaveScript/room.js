var player, game;
const socket = io.connect('https://schoolboard-raidd.run.goorm.io/concave', {
      path: '/socket.io',
});
socket.on('join', function (data) {
		document.getElementById('userCount').innerHTML=data.userCount;
    });
	socket.on('exit', function (data) {
		document.getElementById('userCount').innerHTML=data.userCount;
    });
	socket.on('completeMatch',function(data){
		if(player){
			return;
		}
		let re=document.getElementById('reMatch');
		let cancel=document.getElementById('cancelMatch');
		let find=document.getElementById('findMatch');
		re.style.display="inline-block";
		find.style.display="none";
		cancel.style.display="none";
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='대화가 시작되었습니다.'
		
		
		const name = document.getElementById('name');
        player = new Player(name.innerHTML, data.color);
		game = new Game(data.room);
        game.displayBoard('게임 시작!');
		player.setCurrentTurn(data.turn);
		
	});
	socket.on('endChat',function(data){
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='대화가 종료되었습니다.'
		//document.querySelector('.chat-list').appendChild(div);
		//document.getElementById('showFoot').scrollTop = document.getElementById('showFoot').scrollHeight;	
	});
 	//랜덤요청
	socket.on('refind', function (data) {
		//let showFoot = document.getElementById("showFoot"); while ( showFoot.hasChildNodes() ) { showFoot.removeChild( showFoot.firstChild ); }
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='대화상대를 찾는중입니다.'
		//document.querySelector('.chat-list').appendChild(div);
    });  

function init(){

	
	document.getElementById('findMatch').addEventListener('click',function(){
		//let showFoot = document.getElementById("showFoot"); while ( showFoot.hasChildNodes() ) { showFoot.removeChild( showFoot.firstChild ); }
		

		
		socket.emit('requestRandomChat');
		let find=document.getElementById('findMatch');
		let cancel=document.getElementById('cancelMatch');
		find.style.display="none";
		cancel.style.display="inline-block";
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='대화상대를 찾는중입니다.'
				
        //socket.emit('createGame', { name });
		//document.querySelector('.chat-list').appendChild(div);
	});
	document.getElementById('cancelMatch').addEventListener('click',function(){
		socket.emit('cancelRequest');
		let find=document.getElementById('findMatch');
		let cancel=document.getElementById('cancelMatch');
		find.style.display="inline-block";
		cancel.style.display="none";
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='요청을 취소하였습니다.'
		//document.querySelector('.chat-list').appendChild(div);
	});
	document.getElementById('reMatch').addEventListener('click',async function(){		
		socket.emit('reRequest');
			let re=document.getElementById('reMatch');
		let cancel=document.getElementById('cancelMatch');
		re.style.display="none";
		cancel.style.display="inline-block";	
	});
	
	/*
    $('#new').on('click', () => {
        const name = $('#nameNew').val();
        if (!name) {
          alert('Please enter your name:');
          return;
        }
        player = new Player(name, p1Color);
        socket.emit('createGame', { name });
      });
    
      // Join an existing game on the entered roomId.
	 
	$('#join').on('click', () => {
        const name = $('#nameJoin').val();
        const roomID = $('#room').val();

        if (!name || !roomID) {
          alert('Please enter your name and game ID:');
          return;
        }
        player = new Player(name, p2Color);
        socket.emit('joinGame', { name, room: roomID });
      });

     
    
      // New Game created by current client
      socket.on('newGame', (data) => {
        const message = `Hello ${data.name}<br/> Game ID: 
          ${data.room}<br/> Waiting for player 2...`;
    
        // Create game for first player
        game = new Game(data.room);
        game.displayBoard(message);
      });
    
      //Player 1 joined the game
      socket.on('player1', (data) => {
        const message = `Hello, ${player.getPlayerName()}`;
        $('#userHello').html(message);
        player.setCurrentTurn(false);
      });
    
      //Player 2 joined the game
      socket.on('player2', (data) => {
        const message = `Hello, ${data.name}`;
    
        // Create game for player 2
        game = new Game(data.room);
        game.displayBoard(message);
        player.setCurrentTurn(true);
      });
    */
      //After played turn update board and give new turn to other player
      socket.on('turnPlayed', (data) => {
        let row = game.getRowFromTile(data.tile);
        let col = game.getColFromTile(data.tile);

		  console.log(2);
        const opponentColor = player.getPlayerColor() === p1Color ? p2Color : p1Color;
        game.updateBoard(opponentColor, row, col, data.tile);
        player.setCurrentTurn(true);
      });
    
      //Notify users that game has ended
      socket.on('gameEnd', (data) => {
        game.endGameMessage(data.message);
      });

      //If there is error, send message and reload page
      socket.on('err', (data) => {
        alert(data.message);
        location.reload();
      });

      socket.on('userDisconnect', () =>{
        const message = `You win! Other player was disconnected!`;
        game.endGameMessage(message);
      });
}

init();