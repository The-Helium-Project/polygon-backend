import EventEmitter from "events";
import { Server, type ServerOpts, type Socket } from "net";
import type TypedEmitter from "typed-emitter";
import type { PolygonBackendEvents } from "../interfaces/PolygonBackend.js";
import { Client } from "./Client.js";

export class PolygonBackend extends (EventEmitter as new () => TypedEmitter<PolygonBackendEvents>) {
    private server: Server;
    public clients = new Map<number, Client>();

    constructor(options?: ServerOpts) {
        super();
        this.server = new Server(options, this.onConnection.bind(this));
        this.server.on("close", this.onClose.bind(this));
        this.server.on("error", this.onError.bind(this));
    }

    private onConnection(socket: Socket) {
        this.emit("connection", new Client(this, socket));
    }

    private onClose() {
        this.emit("close");
        this.removeAllListeners();
    }

    private onError(error: Error) {
        this.emit("error", error);
    }

    public address() {
        return this.server.address();
    }

    public close(...args: Parameters<typeof this.server.close>) {
        return this.server.close(...args);
    }

    public listen(...args: Parameters<typeof this.server.listen>) {
        return this.server.listen(...args);
    }
}