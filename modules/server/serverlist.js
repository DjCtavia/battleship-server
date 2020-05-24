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

        this.refreshInterval = setInterval(this.RefreshServersList.bind(this), 10000);
    }

    /**
     * @param {Array} rooms
     */
    GetPlayers({rooms}) {
        if (typeof rooms !== 'object') return undefined;
        const server = this.servers.get(rooms.find(room => room.match(REGEXSERVER)));
        if (!server) return undefined;
        return server.players;
    }

    /**
     * @param {Socket} socket 
     */
    RefreshServersList(socket = undefined) {
        let servers = Array();

        this.servers.forEach((value, key) => {
            servers.push({
                id: value.id,
                name: value.name,
                usePassword: value.password !== "" ? true : false,
            });
        });
        if (!socket) io.to('RefreshServersList').emit(servers);
        else if (socket instanceof Socket) socket.emit('RefreshServersList', servers);
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
     * @param {String} id
     * @param {String} name
     * @param {String} password
     * @constructs Server
     */
    constructor({id}, name = "default", password = "")
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
    IsPlayerAlreadyInAGame(rooms) {
        if (typeof rooms !== 'object') return undefined;
        return rooms.some(room => room.match(REGEXSERVER));
    }

    /**
    * @param {Socket} socket
    */
    AddPlayer(socket) {
        if (socket instanceof Socket) return;
        if (this.IsPlayerAlreadyInAGame(socket.rooms)) return;
        this.players.push(socket.id);
        socket.join(this.id);
    }

    toString()
    {
        return `[Server] UID: ${this.id} | name: ${this.name} | pwd: ${this.password} | Hoster: ${this.hoster}`;
    }
}

const gServerList = new ServerList();
module.exports = {
    ServerList: gServerList,
    Server
};