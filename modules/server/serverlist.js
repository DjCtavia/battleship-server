const { io } = require('../globals');
const { v4: uuidv4 } = require('uuid');
const REGEXSERVER = /game-[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}/;

class ServerList {
    constructor() {
        this.servers = new Map();

        this.refreshInterval = setInterval(this.RefreshServersList, 2000);
    }

    GetPlayers({rooms}) {
        if (typeof rooms !== 'object') return undefined;
        const server = this.servers.get(rooms.find(room => room.match(REGEXSERVER)));
        if (!server) return undefined;
        return server.players;
    }

    RefreshServersList() {
        let servers = [];

        this.servers.forEach((value, key) => {
            servers.push({
                id: value.id,
                name: value.name,
                usePassword: value.password !== "" ? true : false,
            });
        });
        io.to('RefreshServersList').emit(servers);
    }
}

class Server {
    constructor({id}, name = "default", password = "")
    {
        this.id = `game-${uuidv4()}`;
        this.name = name;
        this.password = password;
        this.hoster = id;
        this.players = [id];
        this.canJoin = true;
    }

    IsPlayerAlreadyInAGame(rooms) {
        if (typeof rooms !== 'object') return undefined;
        return rooms.some(room => room.match(REGEXSERVER));
    }

    AddPlayer({id: playerId, rooms, join}) {
        if (this.IsPlayerAlreadyInAGame(rooms)) return;
        this.players.push(playerId);
        join(this.id);
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