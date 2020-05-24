const { io } = require('./modules/globals');
const { ServerList } = require('./modules/server/serverlist');

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