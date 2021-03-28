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
		if(data.meName && data.youName){
			document.getElementById('me').innerHTML=`<img src="/${data.meProfile}" style="width: 12%;
    border-radius: 50%;
    margin-top: 2%;">${data.meName}`;
			document.getElementById('me1').innerHTML=`${data.meWin}  ${data.meLose}`;
			document.getElementById('you').innerHTML=`<img src="/${data.youProfile}" style="width: 12%;
    border-radius: 50%;
    margin-left: 5%;
    margin-top: 2%;">${data.youName}`;
			document.getElementById('you1').innerHTML=`  ${data.youWin}  ${data.youLose}`;
			
		}
		if(player){
			return;
		}
		const alert=document.getElementById('alert2');
		while(alert.firstChild){alert.removeChild(alert.firstChild);}
		const name = document.getElementById('name');
		const id = document.getElementById('id');
		
        player = new Player(name.innerHTML,id.innerHTML, data.color);
		game = new Game(data.room);
        game.displayBoard('게임 시작!');
		player.setCurrentTurn(data.turn);
		
	});
	
 	 

function init(){
	var p1Color="white";
	var p2Color="black";
	
	document.getElementById('findMatch').addEventListener('click',function(){
		const profile=document.getElementById('profile');
		const name = document.getElementById('name');
		const win=document.getElementById('win');
		const lose = document.getElementById('lose');
		const id = document.getElementById('id');
		
		socket.emit('requestRandomChat',{profile:profile.innerHTML,name:name.innerHTML,win:win.innerHTML,lose:lose.innerHTML,id:id.innerHTML});
		let find=document.getElementById('findMatch');
		let cancel=document.getElementById('cancelMatch');
		find.style.display="none";
		cancel.style.display="inline-block";
		const div = document.createElement('div');
        div.classList.add('system');
		div.innerHTML='상대를 찾는중입니다...'
		const alert=document.getElementById('alert2');
		while(alert.firstChild){alert.removeChild(alert.firstChild);}
		document.getElementById('alert2').appendChild(div);
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
		const alert=document.getElementById('alert2');
		while(alert.firstChild){alert.removeChild(alert.firstChild);}
		document.getElementById('alert2').appendChild(div);
	});
	socket.on('time',(data)=>{
         document.getElementById('time').innerHTML = `남은시간 : ${data.time}`;
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