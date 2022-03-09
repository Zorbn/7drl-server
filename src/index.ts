import * as SocketIo from "socket.io";
import * as Http from "http";
import express from "express";
import path from "path";
import { Game } from "./game";

const port = 8080;

const app = express();
const httpServer = Http.createServer(app);
const io = new SocketIo.Server(httpServer);

io.on("connection", (socket: SocketIo.Socket) => {

});

app.use(
    express.static(path.join(__dirname, "../../7drl-client/dist/"))
);

/*
app.get('/', (req, res) => {
   res.sendFile(__dirname + '../../7drl-client/dist/index.html');
});
 */

httpServer.listen(port, () => {
    console.log(`Listening on *:${port}`)
});

/// Start game

let game = new Game(io);