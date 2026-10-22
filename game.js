const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const playerCount = document.getElementById("playerCount");

const players = {};
let myId = null;

const player = {
x: 400,
y: 250,
speed: 5,
color: "#ffcc00"
};

socket.on("connect", () => {
myId = socket.id;
statusText.textContent = "Connected! Enter the battlefield!";
});

socket.on("disconnect", () => {
statusText.textContent = "Disconnected. Reconnecting...";
});

socket.on("currentPlayers", (serverPlayers) => {
Object.keys(players).forEach(id => delete players[id]);

Object.assign(players, serverPlayers);

if (players[myId]) {
player.x = players[myId].x;
player.y = players[myId].y;
}

updatePlayerCount();
});

socket.on("newPlayer", (newPlayer) => {
players[newPlayer.id] = newPlayer;
updatePlayerCount();
});

socket.on("playerMoved", (updatedPlayer) => {
players[updatedPlayer.id] = updatedPlayer;
});

socket.on("playerDisconnected", (id) => {
delete players[id];
updatePlayerCount();
});

function updatePlayerCount() {
playerCount.textContent = Object.keys(players).length;
}

function drawPlayer(p, isMe) {
ctx.fillStyle = isMe ? "#ffcc00" : "#ff5555";
ctx.beginPath();
ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "white";
ctx.font = "12px Arial";
ctx.textAlign = "center";
ctx.fillText(isMe ? "YOU" : "PLAYER", p.x, p.y - 22);
}

function drawGame() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#254d32";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = "#376b45";
ctx.lineWidth = 1;

for (let x = 0; x < canvas.width; x += 40) {
ctx.beginPath();
ctx.moveTo(x, 0);
ctx.lineTo(x, canvas.height);
ctx.stroke();
}

for (let y = 0; y < canvas.height; y += 40) {
ctx.beginPath();
ctx.moveTo(0, y);
ctx.lineTo(canvas.width, y);
ctx.stroke();
}

Object.values(players).forEach(p => {
drawPlayer(p, p.id === myId);
});

requestAnimationFrame(drawGame);
}

function movePlayer(dx, dy) {
if (!myId || !socket.connected) return;

player.x = Math.max(15, Math.min(canvas.width - 15, player.x + dx));
player.y = Math.max(15, Math.min(canvas.height - 15, player.y + dy));

players[myId] = {
id: myId,
x: player.x,
y: player.y,
health: 100
};

socket.emit("playerMovement", {
x: player.x,
y: player.y
});
}

document.getElementById("up").addEventListener("click", () => movePlayer(0, -player.speed));
document.getElementById("down").addEventListener("click", () => movePlayer(0, player.speed));
document.getElementById("left").addEventListener("click", () => movePlayer(-player.speed, 0));
document.getElementById("right").addEventListener("click", () => movePlayer(player.speed, 0));

document.getElementById("fire").addEventListener("click", () => {
if (!socket.connected) {
statusText.textContent = "Wait for the server to connect!";
return;
}

statusText.textContent = "BANG! Keep moving!";
});

drawGame();
