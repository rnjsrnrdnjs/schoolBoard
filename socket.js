const SocketIO = require('socket.io');
const axios = require('axios');
const {Room}=require('./models');

var socketRoom=[];

module.exports = (server, app,sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const manito = io.of('/manito');
    
	
	const roomRandom = io.of('/roomRandom');
	
	const roomAll = io.of('/roomAll');
    const chatAll = io.of('/chatAll');
	
    const room = io.of('/room');
    const chat = io.of('/chat');
	
    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
	
	roomRandom.on('connection', async(socket) => {
        console.log('roomRandom 네임스페이스에 접속');
        const req = socket.request;
		const currentRoom = socket.adapter.rooms;
		const userCount = currentRoom ? currentRoom.size : 0;
		roomRandom.emit('join',{userCount});
		
		socket.on('requestRandomChat',function(data){
			 console.log('requestRandomChat');
			for(var key in socketRoom){
				console.log(socketRoom[key]);
				if(socketRoom[key].member.length==1){
					var roomKey=socketRoom[key].id;
					socket.join(roomKey);					     
					socketRoom[roomKey].member[1]=socket.id;
					roomRandom.to(roomKey).emit('completeMatch',{});
					return;
				}
			 }
			
        	socket.join(socket.id);
			socketRoom[socket.id]={id:socket.id,member:[]};
			socketRoom[socket.id].member[0]=socket.id;
			
		});
		socket.on('cancelRequest', function(data){
        	socket.leave(socket.id);
			console.log('cancel');
			delete socketRoom[socket.id];
   		});
		socket.on('reRequest', function(data){
			for(var key in socketRoom){
				if(socketRoom[key].member[0]==socket.id || socketRoom[key].member[1]==socket.id){
					roomRandom.to(key).emit('endChat',{});
					socket.leave(socketRoom[key].member[0]);
					socket.leave(socketRoom[key].member[1]);
					delete socketRoom[socket.id];
				}
			}
			for(var key in socketRoom){
				console.log(socketRoom[key]);
				if(socketRoom[key].member.length==1){
					var roomKey=socketRoom[key].id;
					socket.join(roomKey);					     
					socketRoom[roomKey].member[1]=socket.id;
					roomRandom.to(roomKey).emit('refind',{});
					roomRandom.to(roomKey).emit('completeMatch',{});
					return;
				}
			 }
        	socket.join(socket.id);
			socket.emit('refind',{});
			socketRoom[socket.id]={id:socket.id,member:[]};
			socketRoom[socket.id].member[0]=socket.id;
   		});
		
   
   		 // client -> server Message전송 시
   		 socket.on('sendMessage', function(data){
    	    console.log('sendMessage!');
			 console.log(data.img);
			for(var key in socketRoom){
				if(socketRoom[key].member[0]==socket.id || socketRoom[key].member[1]==socket.id){
		    	    roomRandom.to(socketRoom[key].id).emit('chat',data);
					return;
				}
			} 
    	});
		
		
	    socket.on('disconnect', () => {
			console.log('roomRandom 네임스페이스에 접속 헤제');
			const currentRoom = socket.adapter.rooms;
			const userCount = currentRoom ? currentRoom.size : 0;
			roomRandom.emit('exit',{userCount});
			
			for(var key in socketRoom){
				if(socketRoom[key].member[0]==socket.id || socketRoom[key].member[1]==socket.id){
					roomRandom.to(key).emit('endChat',{});
					socket.leave(socketRoom[key].member[0]);
					socket.leave(socketRoom[key].member[1]);
					delete socketRoom[socket.id];
					return;
				}
			}
        });
    });
	
	
    roomAll.on('connection', (socket) => {
        console.log('roomAll 네임스페이스에 접속');
        const req = socket.request;
        socket.on('disconnect', () => {
            console.log('roomAll 네임스페이스에 접속 헤제');
        });
    });
	chatAll.on('connection', async(socket) => {
        console.log('chatAll 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
		socket.join(roomId);
        socket.on('disconnect', async() => {
            console.log('chatAll 네이스페이스 접속 해제');
            socket.leave(roomId);
        });
    });
	
    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        const req = socket.request;
        socket.on('disconnect', () => {
            console.log('room 네임스페이스에 접속 헤제');
        });
    });

    chat.on('connection', async(socket) => {
        console.log('chat 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
		socket.join(roomId);
        socket.on('disconnect', async() => {
            console.log('chat 네이스페이스 접속 해제');
            socket.leave(roomId);
        });
    });
};