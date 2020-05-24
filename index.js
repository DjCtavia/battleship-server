const { io } = require('./modules/globals');
const { ServerList } = require('./modules/server/serverlist');

let numUsersConnected = 0;
let servers = new Map();
let clients = [];

io.on('connection', client => {
    client.on('CreateServer', data => {
        if (!servers.has(client.id)) {
            servers.set(client.id, {
                name: data.name,
                password: data.pwd,
                boardSize: data.boardSize,
            });
            console.log(`Server created with name "${data.name}" by "${client.id}"`);
        } else {
            console.error(`A server has already been created under the name "${servers.get(client.id).name}" by "${client.id}"`);
        }
    });

    client.on('disconnect', () => {
        numUsersConnected--;
        console.log(`Users connected: ${numUsersConnected}`);
    });
    numUsersConnected++;
    console.log(`Users connected: ${numUsersConnected}`);
});