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
	var p1Color="white";
	var p2Color="black";
	
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
	
      //After played turn update board and give new turn to other player
      socket.on('turnPlayed', (data) => {
        let row = game.getRowFromTile(data.tile);
        let col = game.getColFromTile(data.tile);

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