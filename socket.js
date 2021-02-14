const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const manito = io.of('/manito');
    const random = io.of('/random');
    const room = io.of('/room');
    const chat = io.of('/chat');
	
    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스에 접속 헤제');
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
       
		 const currentRoom = socket.adapter.rooms.get(roomId);
			const userCount = currentRoom ? currentRoom.size : 0;
			console.log(userCount);
           
		
		socket.join(roomId);
        socket.to(roomId).emit('join', {
            user: 'system',
            chat:`새로운 사람이 입장~`,
        });
        socket.on('disconnect', () => {
            console.log('chat 네이스페이스 접속 해제');
            socket.leave(roomId);
            const currentRoom = socket.adapter.rooms.get(roomId);
			const userCount = currentRoom ? currentRoom.size : 0;
			console.log(userCount);
            if (userCount === 0) {
                // 유저가 0명이면 방 삭제
                axios.delete(`https://schoolboard-raidd.run.goorm.io/room/${roomId}`, {
                    })
                    .then(() => {
                        console.log('방제거 성공');
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat:`새로운 사람이 퇴장..ㅜㅜ`
                });
            }
        });
    });
};