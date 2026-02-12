import http from 'http';
import { Server } from 'socket.io';
import { GameManager } from './game-manager';
import { Matchmaker } from './matchmaker';
import { createSocketHandler } from './socket-handler';

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const gameManager = new GameManager();
const matchmaker = new Matchmaker(gameManager);

io.on('connection', createSocketHandler(io, gameManager, matchmaker));

// Periodic cleanup every 60 seconds
setInterval(() => {
  gameManager.cleanup();
}, 60_000);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Bull & Cow server running on port ${PORT}`);
});
