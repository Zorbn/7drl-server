import {getLine, getRandomInt, Vec2} from "./utils";
import * as SocketIo from "socket.io";

type TileMapInfo = {
    width: number;
    height: number;
    defaultTile: number;
}

class RectangleRoom {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + width;
        this.y2 = y + height;
    }

    public center(): Vec2 {
        let centerX = Math.trunc((this.x1 + this.x2) / 2);
        let centerY = Math.trunc((this.y1 + this.y2) / 2);

        return { x: centerX, y: centerY };
    }

    public inner(): [[number, number], [number, number]] {
        return [[this.x1 + 1, this.x2], [this.y1 + 1, this.y2]];
    }

    public intersects(other: RectangleRoom): boolean {
        return (
          this.x1 <= other.x2
          && this.x2 >= other.x1
          && this.y1 <= other.y2
          && this.y2 >= other.y1
        );
    }
}

export class TileMap {
    private readonly tiles: number[][];
    private readonly width: number;
    private readonly height: number;
    private readonly defaultTile: number;

    constructor(width: number, height: number, io: SocketIo.Server) {
        this.tiles = [];
        this.width = width;
        this.height = height;
        this.defaultTile = 1;

        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = this.defaultTile;
            }
        }

        this.registerListeners(io);
    }

    private static tunnelBetween(start: Vec2, end: Vec2): Vec2[] {
        let x1 = start.x, y1 = start.y;
        let x2 = end.x, y2 = end.y;

        let cornerX, cornerY;

        if (Math.random() < 0.5) {
            // Move horizontally first
            cornerX = x2;
            cornerY = y1;
        } else {
            // Move vertically first
            cornerX = x1;
            cornerY = y2;
        }

        let tunnel = [];

        for (let v of getLine({ x: x1, y: y1 }, { x: cornerX, y: cornerY })) {
            tunnel.push({ x: v.x, y: v.y });
        }

        for (let v of getLine({ x: cornerX, y: cornerY }, { x: x2, y: y2 })) {
            tunnel.push({ x: v.x, y: v.y });
        }

        return tunnel;
    }

    public generateDungeon(maxRooms: number, roomMinSize: number, roomMaxSize: number) {
        let rooms: RectangleRoom[] = [];

        for (let r = 0; r < maxRooms; r++) {
            let roomWidth = getRandomInt(roomMinSize, roomMaxSize + 1);
            let roomHeight = getRandomInt(roomMinSize, roomMaxSize + 1);

            let x = getRandomInt(0, this.width - roomWidth);
            let y = getRandomInt(0, this.height - roomHeight);

            let newRoom = new RectangleRoom(x, y, roomWidth, roomHeight);

            let roomIntersects = false;

            for (let otherRoom of rooms) {
                if (newRoom.intersects(otherRoom)) {
                    roomIntersects = true;
                    break;
                }
            }

            if (roomIntersects) {
                continue;
            }

            let newRoomInner = newRoom.inner();

            for (let ix = newRoomInner[0][0]; ix < newRoomInner[0][1]; ix++) {
                for (let iy = newRoomInner[1][0]; iy < newRoomInner[1][1]; iy++) {
                    this.tiles[ix][iy] = 0;
                }
            }

            if (rooms.length != 0) {
                // Not the first room, dig a tunnel
                for (let v of TileMap.tunnelBetween(rooms[rooms.length - 1].center(), newRoom.center())) {
                    this.tiles[v.x][v.y] = 0;
                }
            }

            rooms.push(newRoom);
        }
    }

    // For testing only
    public drawToConsole() {
        for (let y = 0; y < this.height; y++) {
            let line = "";

            for (let x = 0; x < this.width; x++) {
                switch (this.tiles[x][y]) {
                    case 0:
                        line += ".";
                        break;
                    case 1:
                        line += "#";
                        break;
                    default:
                        line += " ";
                        break;
                }
            }

            console.log(line);
        }
    }

    public registerListeners(io: SocketIo.Server) {
        io.on("connection", (socket: SocketIo.Socket) => {
            socket.emit("MapInfo", this.getMapInfo());
            socket.emit("MapUpdate", { tiles: this.tiles })
        })
    }

    private getMapInfo(): TileMapInfo {
        return {
            width: this.width,
            height: this.height,
            defaultTile: this.defaultTile,
        }
    }
}