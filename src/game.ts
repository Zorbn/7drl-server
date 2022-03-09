import { TileMap } from "./tileMap";
import * as SocketIo from "socket.io";

export class Game {
    private map: TileMap;

    constructor(io: SocketIo.Server) {
        this.map = new TileMap(80, 45, io);
        this.map.generateDungeon(30, 10, 6);
        this.map.drawToConsole();
    }
}