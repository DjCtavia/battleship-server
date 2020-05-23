const { ServerList, Server } = require('./modules/server/serverlist');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Config
const PORT = 3001;
const INDEX = require("./routes/index");
// Express init
const app = express();
app.use(INDEX);
// Socket Io init
const server = http.createServer(app);
const io = socketIo(server);

let numUsersConnected = 0;
let servers = new Map();
let clients = [];

io.on('connection', socket => {
    socket.on('CreateServer', data => {
        let nServer = new Server(socket, data.name, data.password);
        ServerList.servers.set(nServer.id, nServer);
        console.log(nServer);
        console.log(ServerList.servers.toString());
    });

    socket.on('disconnect', () => {
        numUsersConnected--;
        console.log(`Users connected: ${numUsersConnected}`);
    });
    numUsersConnected++;
    console.log(`Users connected: ${numUsersConnected}`);
});

server.listen(PORT, () => console.log(`Listening port ${PORT}`));