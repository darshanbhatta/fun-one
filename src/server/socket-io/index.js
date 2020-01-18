const http = require("http");
const socketIo = require("socket.io");
const roomIDs = new Set();
const roomMap = new Map();
const roomIdMap = new Map();
const ownerMap = new Map();
const messageMap = new Map();
let openRoom = generateRoomCode();

const roomGameState = new Map();
const Game = require("../game");

function init(app) {
    const server = http.createServer(app);
    const io = socketIo(server);
    //Setting up a socket with the namespace "connection" for new sockets
    io.on("connection", socket => {
        let roomCode = ""
        let userName = "";
        const id = socket.conn.id;
        console.log(`New client with ID: ${id} connected`);
        socket.on('createGame', (data) => {
            if (data.name) {
                roomCode = generateRoomCode();
                userName = data.name.replace(" ", "");
                socket.join(roomCode);
                ownerMap.set(roomCode, userName);
                roomMap.set(roomCode, new Set().add(userName));
                roomIdMap.set(roomCode, new Set().add(id))
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
                    roomIdMap.get(roomCode).add(id);
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
                        const roomIDSet = roomIdMap.get(openRoom);
                        userName = data.name.replace(" ", "");
                        roomCode = openRoom;
                        socket.join(roomCode);
                        roomSet.add(data.name.replace(" ", ""));
                        roomIDSet.add(id);
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
                    roomIdMap.set(roomCode, new Set().add(id));
                    roomIDs.add(roomCode);
                }
                if (roomCode) {
                    io.to(roomCode).emit("newPlayer", { players: Array.from(roomMap.get(roomCode)), room: roomCode, messages: messageMap.get(roomCode) });
                }
                console.log(roomIdMap);
            }
        });

        socket.on("startGame", () => {
            if (roomCode && userName) {
                if (ownerMap.get(roomCode) !== userName) {
                    socket.emit("startGame", { message: "Only the owner can start the game!" });
                } else {
                    const userNameID = getPlayerObject(Array.from(roomMap.get(roomCode)), Array.from(roomIdMap.get(roomCode)));
                    const newGame = new Game(userNameID);
                    roomGameState.set(roomCode, newGame);
                    for (const id of newGame.playerIDs) {
                        const payload = {
                            player: newGame.players.get(id),
                            players: newGame.publicPlayers,
                            turnIndex: newGame.turnIndex,
                            prevCard: newGame.prevCard,
                        };
                        io.to(id).emit("startGame", payload);
                    }
                    
                }
            }
        });

        socket.on("gameMove", (data) => {
            console.log(data);
            const gameObj = roomGameState.get(roomCode);
            let moveData;
            if (data.move === "playCard") {
                moveData = gameObj.tryToMakeMove({id: id}, data.card);
            } else if (data.move === "skip") {
                moveData = gameObj.notToPlay({id: id});
            } else if (data.move === true) {
                moveData = gameObj.makeMove({id: id}, data.card);
            } else {
                moveData = gameObj.drawCard({id: id});
            }
            console.log(moveData);
            if (moveData.message) {
                socket.emit("gameData", moveData);
            } else if (data.move === false) {
                socket.emit("gameData", {player: gameObj.players.get(id)});
            } else {
                for (const id of gameObj.playerIDs) {
                    const payload = {
                        player: gameObj.players.get(id),
                        players: gameObj.publicPlayers,
                        turnIndex: gameObj.turnIndex,
                        prevCard: gameObj.prevCard,
                        announce: moveData.announce,
                        global_action: moveData.global_action,

                    };
                    io.to(id).emit("gameData", payload);
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
            removePlayer(roomCode, userName, socket, io, id);
        });

        socket.on("disconnect", () => {
            if (socket.socket)
                socket.socket.reconnect();
            removePlayer(roomCode, userName, socket, io, id);
        });
    });
    server.listen(4001, () => console.log(`SocketIO listening on port ${4001}`));
}

function getPlayerObject (playerNames, playerIds) {
    const obj = [];
    for(let i = 0; i < playerNames.length; i++) {
        obj.push({username: playerNames[i], id: playerIds[i]});
    }
    return obj;
}

function removePlayer(roomCode, userName, socket, io, id) {
    if (roomCode && userName) {
        console.log(`${userName} left room: ${roomCode}`);
        socket.leave(roomCode);
        const roomSet = roomMap.get(roomCode);
        const roomIdSet = roomIdMap.get(roomCode);
        if (roomSet) {
            roomSet.delete(userName);
            roomIdSet.delete(id);
            if (roomSet.size !== 0 && ownerMap.get(roomCode) === userName) {
                const newOwner = roomMap.get(roomCode).values().next().value;
                console.log(`New owner of ${roomCode} is ${newOwner}`);
                ownerMap.set(roomCode, newOwner);
            }
            if (roomSet.size === 0) {
                roomMap.delete(roomCode);
                roomIDs.delete(roomCode);
                roomIdMap.delete(roomCode);
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