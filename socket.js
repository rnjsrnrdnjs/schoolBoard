const SocketIO = require('socket.io');
const axios = require('axios');
const { Room } = require('./models');

var socketRoom = [];
var concaveRoom = [];

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const myRoom = io.of('/myRoom');
    const myChat = io.of('/myChat');

    myRoom.on('connection', (socket) => {
        console.log('myRoom 네임스페이스에 접속');
        const req = socket.request;
        socket.on('disconnect', () => {
            console.log('myRoom 네임스페이스에 접속 헤제');
        });
    });
    myChat.on('connection', async (socket) => {
        console.log('myChat 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        console.log(req.headers + ' ??');
        console.log(referer + '! !');

        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
        socket.join(roomId);
        socket.on('disconnect', async () => {
            console.log('myChat 네이스페이스 접속 해제');
            socket.leave(roomId);
        });
    });

    const roomRandom = io.of('/roomRandom');
    const concave = io.of('/concave');

    const roomAll = io.of('/roomAll');
    const chatAll = io.of('/chatAll');

    const room = io.of('/room');
    const chat = io.of('/chat');

    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    roomRandom.on('connection', async (socket) => {
        console.log('roomRandom 네임스페이스에 접속');
        const req = socket.request;
        const currentRoom = socket.adapter.rooms;
        const userCount = currentRoom ? currentRoom.size : 0;
        roomRandom.emit('join', { userCount });

        socket.on('requestRandomChat', function (data) {
            console.log('requestRandomChat');
            for (var key in socketRoom) {
                console.log(socketRoom[key]);
                if (socketRoom[key].member.length == 1) {
                    var roomKey = socketRoom[key].id;
                    socket.join(roomKey);
                    socketRoom[roomKey].member[1] = socket.id;
                    roomRandom.to(roomKey).emit('completeMatch', {});
                    return;
                }
            }

            socket.join(socket.id);
            socketRoom[socket.id] = { id: socket.id, member: [] };
            socketRoom[socket.id].member[0] = socket.id;
        });
        socket.on('cancelRequest', function (data) {
            socket.leave(socket.id);
            console.log('cancel');
            delete socketRoom[socket.id];
        });
        socket.on('reRequest', function (data) {
            for (var key in socketRoom) {
                if (
                    socketRoom[key].member[0] == socket.id ||
                    socketRoom[key].member[1] == socket.id
                ) {
                    roomRandom.to(key).emit('endChat', {});
                    socket.leave(socketRoom[key].member[0]);
                    socket.leave(socketRoom[key].member[1]);
                    delete socketRoom[socket.id];
                }
            }
            for (var key in socketRoom) {
                console.log(socketRoom[key]);
                if (socketRoom[key].member.length == 1) {
                    var roomKey = socketRoom[key].id;
                    socket.join(roomKey);
                    socketRoom[roomKey].member[1] = socket.id;
                    roomRandom.to(roomKey).emit('refind', {});
                    roomRandom.to(roomKey).emit('completeMatch', {});
                    return;
                }
            }
            socket.join(socket.id);
            socket.emit('refind', {});
            socketRoom[socket.id] = { id: socket.id, member: [] };
            socketRoom[socket.id].member[0] = socket.id;
        });

        // client -> server Message전송 시
        socket.on('sendMessage', function (data) {
            console.log('sendMessage!');
            console.log(data.img);
            for (var key in socketRoom) {
                if (
                    socketRoom[key].member[0] == socket.id ||
                    socketRoom[key].member[1] == socket.id
                ) {
                    roomRandom.to(socketRoom[key].id).emit('chat', data);
                    return;
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('roomRandom 네임스페이스에 접속 헤제');
            const currentRoom = socket.adapter.rooms;
            const userCount = currentRoom ? currentRoom.size : 0;
            roomRandom.emit('exit', { userCount });

            for (var key in socketRoom) {
                if (
                    socketRoom[key].member[0] == socket.id ||
                    socketRoom[key].member[1] == socket.id
                ) {
                    roomRandom.to(key).emit('endChat', {});
                    socket.leave(socketRoom[key].member[0]);
                    socket.leave(socketRoom[key].member[1]);
                    delete socketRoom[socket.id];
                    return;
                }
            }
        });
    });

    /**/
    concave.on('connection', async (socket) => {
        console.log('concave 네임스페이스에 접속');
        const req = socket.request;
        const currentRoom = socket.adapter.rooms;
        const userCount = currentRoom ? currentRoom.size : 0;
        concave.emit('join', { userCount });

        socket.on('requestRandomChat', function (data) {
            console.log('requestRandomChat');
            for (var key in concaveRoom) {
                console.log(concaveRoom[key]);
                if (concaveRoom[key].member.length == 1) {
                    var roomKey = concaveRoom[key].id;
                    socket.broadcast.to(roomKey).emit('completeMatch', {color:"black",room:roomKey,turn:true,});
                    socket.join(roomKey);
                    concaveRoom[roomKey].member[1] = socket.id;
                    concave.to(roomKey).emit('completeMatch', {color:"white",room:roomKey,turn:false,});
                    return;
                }
            }

            socket.join(socket.id);
            concaveRoom[socket.id] = { id: socket.id, member: [] };
            concaveRoom[socket.id].member[0] = socket.id;
        });
        socket.on('cancelRequest', function (data) {
            socket.leave(socket.id);
            console.log('cancel');
            delete concaveRoom[socket.id];
        });
        socket.on('reRequest', function (data) {
            for (var key in concaveRoom) {
                if (
                    concaveRoom[key].member[0] == socket.id ||
                    concaveRoom[key].member[1] == socket.id
                ) {
                    concave.to(key).emit('endChat', {});
                    socket.leave(concaveRoom[key].member[0]);
                    socket.leave(concaveRoom[key].member[1]);
                    delete concaveRoom[socket.id];
                }
            }
            for (var key in concaveRoom) {
                console.log(concaveRoom[key]);
                if (concaveRoom[key].member.length == 1) {
                    var roomKey = concaveRoom[key].id;
                    socket.broadcast.to(roomKey).emit('completeMatch', {color:"black",room:roomKey,turn:true,});
                    socket.join(roomKey);
                    concaveRoom[roomKey].member[1] = socket.id;
                    concave.to(roomKey).emit('refind', {});
                    concave.to(roomKey).emit('completeMatch', {color:"white",room:roomKey,turn:false,});
                    return;
                }
            }
            socket.join(socket.id);
            socket.emit('refind', {});
            concaveRoom[socket.id] = { id: socket.id, member: [] };
            concaveRoom[socket.id].member[0] = socket.id;
        });
		/*
		socket.on('sendMessage', function (data) {
            console.log('sendMessage!');
            console.log(data.img);
            for (var key in socketRoom) {
                if (
                    socketRoom[key].member[0] == socket.id ||
                    socketRoom[key].member[1] == socket.id
                ) {
                    roomRandom.to(socketRoom[key].id).emit('chat', data);
                    return;
                }
            }
        });
		*/
		// 아마 고쳐야하는 부분
        socket.on('playTurn', (data) => {
            socket.broadcast.to(data.room).emit('turnPlayed', {
                tile: data.tile,
                room: data.room,
            });
        });

        socket.on('disconnect', () => {
            console.log('concave 네임스페이스에 접속 헤제');
            const currentRoom = socket.adapter.rooms;
            const userCount = currentRoom ? currentRoom.size : 0;
            concave.emit('exit', { userCount });

            for (var key in concaveRoom) {
                if (
                    concaveRoom[key].member[0] == socket.id ||
                    concaveRoom[key].member[1] == socket.id
                ) {
                    concave.to(key).emit('endChat', {});
                    socket.leave(concaveRoom[key].member[0]);
                    socket.leave(concaveRoom[key].member[1]);
                    delete concaveRoom[socket.id];
                    return;
                }
            }
        });
    });
    /**/

    roomAll.on('connection', (socket) => {
        console.log('roomAll 네임스페이스에 접속');
        const req = socket.request;
        socket.on('disconnect', () => {
            console.log('roomAll 네임스페이스에 접속 헤제');
        });
    });
    chatAll.on('connection', async (socket) => {
        console.log('chatAll 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
        socket.join(roomId);
        socket.on('disconnect', async () => {
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

    chat.on('connection', async (socket) => {
        console.log('chat 네이스페이스 접속');
        const req = socket.request;
        const {
            headers: { referer },
        } = req;
        const roomId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
        socket.join(roomId);
        socket.on('disconnect', async () => {
            console.log('chat 네이스페이스 접속 해제');
            socket.leave(roomId);
        });
    });
};