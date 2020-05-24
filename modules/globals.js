const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Config
const PORT = 3001;
const INDEX = require("../routes/index");
// Express init
const app = express();
app.use(INDEX);
// Socket Io init
const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, () => console.log(`Listening port ${PORT}`));

module.exports = {
    express,
    http,
    app,
    server,
    io
};