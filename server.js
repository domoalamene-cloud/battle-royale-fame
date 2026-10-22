const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "index.html"));
});

const players = {};

io.on("connection", (socket) => {
console.log("Player connected:", socket.id);

players[socket.id] = {
id: socket.id,
x: 200 + Math.random() * 300,
y: 200 + Math.random() * 200,
health: 100
};

socket.emit("currentPlayers", players);
socket.broadcast.emit("newPlayer", players[socket.id]);

socket.on("playerMovement", (data) => {
if (!players[socket.id]) return;

players[socket.id].x = Number(data.x) || 0;
players[socket.id].y = Number(data.y) || 0;

socket.broadcast.emit("playerMoved", players[socket.id]);

});

socket.on("disconnect", () => {
delete players[socket.id];
io.emit("playerDisconnected", socket.id);
console.log("Player disconnected:", socket.id);
});
});

server.listen(PORT, "0.0.0.0", () => {
console.log("Battle Royale server running on port", PORT);
});
