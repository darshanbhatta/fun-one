const http = require("http");
const socketIo = require("socket.io");
const roomIDs = new Set();
const roomMap = new Map();
const ownerMap = new Map();
const messageMap = new Map();
let openRoom = generateRoomCode();

function init(app) {
    const server = http.createServer(app);
    const io = socketIo(server);
    //Setting up a socket with the namespace "connection" for new sockets
    io.on("connection", socket => {
        let roomCode = ""
        let userName = "";
        console.log(`New client with ID: ${socket.conn.id} connected`);
        socket.on('createGame', (data) => {
            if (data.name) {
                roomCode = generateRoomCode();
                userName = data.name.replace(" ", "");
                socket.join(roomCode);
                ownerMap.set(roomCode, userName);
                roomMap.set(roomCode, new Set().add(userName));
                messageMap.set(roomCode, []);
                console.log(`Created new lobby: ${roomCode}`);
                io.to(roomCode).emit("newPlayer", { players: Array.from(roomMap.get(roomCode)), room: roomCode, messages: messageMap.get(roomCode) });
            }
        });

        socket.on('join', (data) => {
            if (data.room) {
                data.room = data.room.toLowerCase();
                if (!roomIDs.has(data.room)) {
                    socket.emit("newPlayer", { "message": "Invalid room code!" });
                } else if (roomMap.get(data.room).size > 10) {
                    socket.emit("newPlayer", { "message": "Room is full!" });
                } else if (roomMap.get(data.room).has(data.name.replace(" ", ""))) {
                    socket.emit("newPlayer", { "message": "Nickname taken, please choose a new one!" });
                } else {
                    socket.join(data.room);
                    roomCode = data.room;
                    userName = data.name.replace(" ", "");
                    roomMap.get(roomCode).add(userName);
                    io.to(roomCode).emit("newPlayer", { players: Array.from(roomMap.get(roomCode)), room: roomCode, messages: messageMap.get(roomCode) });
                }
            }
        });

        socket.on("find", (data) => {
            if (data.name) {
                if (roomMap.has(openRoom)) {
                    const roomSet = roomMap.get(openRoom);
                    if (roomSet.has(data.name)) {
                        socket.emit("newPlayer", { "message": "Nickname taken, please choose a new one!" });
                    } else {
                        userName = data.name.replace(" ", "");
                        roomCode = openRoom;
                        socket.join(roomCode);
                        roomSet.add(data.name.replace(" ", ""));
                        console.log(roomSet);
                        if (roomSet.size === 10) {
                            console.log("Start game!");
                            openRoom = generateRoomCode();
                        }
                    }
                } else {
                    console.log("A player joined!");
                    userName = data.name.replace(" ", "");
                    roomCode = openRoom;
                    socket.join(roomCode);
                    messageMap.set(roomCode, []);
                    ownerMap.set(roomCode, data.name.replace(" ", ""));
                    roomMap.set(roomCode, new Set().add(data.name.replace(" ", "")));
                }
                if (roomCode) {
                    io.to(roomCode).emit("newPlayer", { players: Array.from(roomMap.get(roomCode)), room: roomCode, messages: messageMap.get(roomCode) });
                }
            }
        });

        socket.on("startGame", () => {
            if (roomCode && userName) {
                if (ownerMap.get(roomCode) !== userName) {
                    socket.emit("startGame", { message: "Only the owner can start the game!" });
                } else {
                    io.to(roomCode).emit("startGame", {});
                }
            }
        });

        socket.on("chat", (data) => {
            if (data.name === userName) {
                const message = { data: data.message, author: userName };
                messageMap.get(roomCode).push(message);
                io.to(openRoom).emit("chat", { message: message});
            } else {
                socket.emit("chat", { error: "Something went wrong when sending message!" });
            }
        });

        socket.on("isInARoom", () => {
            socket.emit("isInARoom", roomCode ? roomCode : "");
        });

        socket.on("playerLeave", () => {
            removePlayer(roomCode, userName, socket, io);
        });

        socket.on("disconnect", () => {
            if (socket.socket)
                socket.socket.reconnect();
            removePlayer(roomCode, userName, socket, io);
        });
    });
    server.listen(4001, () => console.log(`SocketIO listening on port ${4001}`));
}

function removePlayer(roomCode, userName, socket, io) {
    if (roomCode && userName) {
        console.log(`${userName} left room: ${roomCode}`);
        socket.leave(roomCode);
        const roomSet = roomMap.get(roomCode);
        if (roomSet) {
            roomSet.delete(userName);
            if (roomSet.size !== 0 && ownerMap.get(roomCode) === userName) {
                const newOwner = roomMap.get(roomCode).values().next().value;
                console.log(`New owner of ${roomCode} is ${newOwner}`);
                ownerMap.set(roomCode, newOwner);
            }
            if (roomSet.size === 0) {
                roomMap.delete(roomCode);
                roomIDs.delete(roomCode);
                ownerMap.delete(roomCode);
                messageMap.delete(roomCode);
                console.log(`No one in the room, deleting room ${roomCode}`);
            } else {
                console.log(roomMap.get(roomCode));
                io.to(roomCode).emit("newPlayer", { players: Array.from(roomMap.get(roomCode)), room: roomCode });
            }
        }
        roomCode = "";
        userName = "";
    }
}

function generateRoomCode() {
    const possible = "abcdefghijkmnpqrstuvwxyz0123456789";
    let roomCode = "";
    // making sure our roomID is unique!
    while (roomIDs.has(roomCode) || roomCode === "") {
        roomCode = "";
        for (var i = 0; i < 4; i++) {
            roomCode += possible.charAt(Math.floor(Math.random() * possible.length));

        }
    }
    roomIDs.add(roomCode);
    return roomCode;
}

module.exports = init;