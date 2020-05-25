const { Socket } = require('socket.io');
const { io } = require('../globals');
const { v4: uuidv4 } = require('uuid');
const REGEXSERVER = /game-[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}/;

/**
 * Manage servers list
 * @class ServerList
 */
class ServerList {
    /**
     * Construct an instance of ServerList
     * 
     * @constructs ServerList
     */
    constructor() {
        /** @private */
        this.servers = new Map();

        this.servers.set('DjCtavia', new Server('DjCtavia', "Dope serv", ""));
        this.servers.set('DanceOfJesus', new Server('DanceOfJesus', "T'as cru quoi", "tree"));
        this.servers.set('Lulu', new Server('Lulu', "Pif plouf", "yikzea"));
        this.servers.set('Vernon', new Server('Vernon', "[EN] Come bae", ""));
        this.servers.set('Lynx', new Server('Lynx', "what's going on", ""));
        this.servers.set('Britneybitch', new Server('Britneybitch', "Ich liebe Battleship", "lol"));
        this.servers.set('Queen', new Server('Queen', "Radio Ga Ga", "lol"));
        this.servers.set('God', new Server('God', "Where is Jesus ?", "Eh"));
        this.servers.set('Hanou', new Server('Hanou', "Ich liebe Battleship", ""));
        this.servers.set('CoffeeShop', new Server('CoffeeShop', "GIMME COFFEE", "lol"));
        this.servers.set('PepeTheFrog', new Server('PepeTheFrog', "Ich liebe Battleship", "lol"));
        this.servers.set('Batman', new Server('Batman', "I'm Batman", "batcave"));
        this.servers.set('SpongeBob', new Server('SpongeBob', "FUUUNNN", ""));

    }

    /**
     * @param {Number} amount Number of servers to get
     * @param {Number} at Position from the list start to get servers
     * @param {Socket} socket Client asking for servers
     */
    getServers({amount, at = 0}, socket) {
        let servers = [];
        const iterator = this.servers.values();

        for (const value of iterator) {
            servers.push(value);
        }
        servers = servers.splice(at, at + amount).map(server => {
            return {
                id: server.id,
                name: server.name,
                usePassword: server.password !== "" ? true : false
            }
        });
        socket.emit('GetServersList', servers);
    }

    /**
     * @param {Array} rooms
     */
    getPlayers({rooms}) {
        if (typeof rooms !== 'object') return undefined;
        const server = this.servers.get(rooms.find(room => room.match(REGEXSERVER)));
        if (!server) return undefined;
        return server.players;
    }

    /**
     * @param {String} serverId
     * @param {Socket} socket
     */
    joinServer(serverId, socket) {
        let server = this.servers.get(serverId);
        
        if (!server) return;
        server.join(socket);
    }

    /**
     * @param {Socket} socket
     */
    leaveServer(socket) {
        if (!socket) return;
        const serverId = socket.rooms.find(room => room.match(REGEXSERVER));
        if (!serverId) return;
        const server = this.servers.get(serverId);
        if (!server) return;
        server.removePlayer(socket);
    }
}

/**
 * Base class for servers
 * @class Server
 */
class Server {
    /**
     * Construct an instance of Server
     * 
     * @param {String} id We use `socket.id`
     * @param {String} name
     * @param {String} password
     * @constructs Server
     */
    constructor(id, name = "default", password = "")
    {
        /** @private */
        this.id = `game-${uuidv4()}`;
        /** @private */
        this.name = name;
        /** @private */
        this.password = password;
        /** @private */
        this.hoster = id;
        /** @private */
        this.players = [id];
        /** @private */
        this.canJoin = true;
    }

    /**
     * @param {Array} rooms 
     */
    isPlayerAlreadyInAGame(rooms) {
        if (typeof rooms !== 'object') return undefined;
        return rooms.some(room => room.match(REGEXSERVER));
    }

    /**
    * @param {Socket} socket
    */
    addPlayer(socket) {
        if (socket instanceof Socket) return;
        if (this.isPlayerAlreadyInAGame(socket.rooms)) return;
        this.players.push(socket.id);
        socket.join(this.id);
    }

    /**
     * @param {Socket} socket
     */
    removePlayer(socket) {
        if (!socket) return;
        let indexOfPlayer = this.players.indexOf(socket.id);
        if (indexOfPlayer < 0) return;
        this.players.splice(indexOfPlayer, 1);
    }

    /**
     * @param {Socket} socket
     */
    join(socket) {
        if (!socket) return;
        if (!isPlayerAlreadyInAGame(socket.rooms)) return;
        this.addPlayer(socket);
        console.log(`[Server]{this.id} Player ${socket.id} try to join the session.`);
    }

    toString()
    {
        return `[Server] UID: ${this.id} | name: ${this.name} | pwd: ${this.password} | Hoster: ${this.hoster}`;
    }
}

/**
 * Add events for listening on serverlist
 * updates.
 * 
 * @param {Socket} socket
 */
function listenServerList(socket) {
    socket
        .on('InitServerList', () => gServerList.getServers({amount: 10}, socket))
        .on('GetServersList', data => gServerList.getServers(data, socket))
        .on('JoinServer', data => gServerList.joinServer(data, socket))
        .on('LeaveServer', data => gServerList.leaveServer(socket));
}

const gServerList = new ServerList();
module.exports = {
    ServerList: gServerList,
    Server,
    listenServerList
};