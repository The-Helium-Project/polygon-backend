export type ClientEvents = {
    packet: (packet: ParsedPacket) => void
    close: (hadError: boolean) => void,
    error: (error: Error) => void
}

export interface Payload {
    type: number;
    proto: string;
    lat: number;
    lng: number;
    timestamp: number;
    token: string;
    level: string;
    account_name: string;
    account_id: string;
    ptc: string;
    extra: Array<unknown>
}

export interface Packet {
    payloads: Payload[];
    key: string;
}

export interface ParsedPayload {
    type: number;
    proto: { [key: string]: any } | string;
    lat: number;
    lng: number;
    timestamp: Date;
    token: string;
    level: number;
    accountName: string;
    accountId: string;
    ptc: string | null;
    extra: Array<unknown>
}

export interface ParsedPacket {
    payloads: ParsedPayload[];
    key: string;
}