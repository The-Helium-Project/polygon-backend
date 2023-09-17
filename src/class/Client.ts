import EventEmitter from "events";
import type { Socket } from "net";
import type TypedEmitter from "typed-emitter";
import type { ClientEvents, Packet, ParsedPacket } from "../interfaces/Client";
import Parser from "./Parser.js";
import type { PolygonBackend } from "./PolygonBackend";

export class Client extends (EventEmitter as new () => TypedEmitter<ClientEvents>) {
    private static readonly PACKET_SEPERATOR = "\n";
    private static readonly MAX_BUFFER_SIZE = 500_000;
    private static id = 1;

    public id = Client.id++;
    private buffer = "";

    constructor(private server: PolygonBackend, public socket: Socket) {
        super();
        server.clients.set(this.id, this);
        socket.on("data", this.onData.bind(this));
        socket.on("close", this.onClose.bind(this));
        socket.on("error", this.onError.bind(this));
    }

    private onData(data: Buffer) {
        this.buffer += data.toString();
        const packets = this.buffer.split(Client.PACKET_SEPERATOR);
        this.buffer = packets.pop() ?? "";

        if (this.buffer.length > Client.MAX_BUFFER_SIZE)
            this.socket.destroy(new Error("Client went over the maximum allowed buffer size!"));

        try {
            this.parsePackets(packets.map((packet) => JSON.parse(packet))).forEach((packet) => 
                this.emit("packet", packet)
            )
        } catch (err) {
            this.socket.destroy(err as Error);
        }
    }

    private onClose(hadError: boolean) {
        this.server.clients.delete(this.id);
        this.removeAllListeners();
        this.emit("close", hadError);
    }

    private onError(error: Error) {
        this.emit("error", error);
    }

    private parsePackets(packets: Packet[]) {
        const parsedPackets: ParsedPacket[] = [];

        for (const packet of packets) {
            const payloads = [];

            for (const payload of packet.payloads) {
                const decoder = Parser[payload.type as keyof typeof Parser]?.[1];
                const proto = decoder ? decoder.decode(Buffer.from(payload.proto, "base64")) : payload.proto;
                payloads.push({
                    type: payload.type,
                    proto,
                    lat: payload.lat,
                    lng: payload.lng,
                    timestamp: new Date(payload.timestamp),
                    token: payload.token,
                    level: parseInt(payload.level, 10),
                    accountName: payload.account_name,
                    accountId: payload.account_id,
                    ptc: payload.ptc === "null" ? null : payload.ptc,
                    extra: payload.extra
                });
            }

            parsedPackets.push({
                payloads,
                key: packet.key
            })
        }

        return parsedPackets;
    }

    public address() {
        return this.socket.address();
    }

    public destroy(...args: Parameters<typeof this.socket.destroy>) {
        return this.socket.destroy(...args);
    }
}