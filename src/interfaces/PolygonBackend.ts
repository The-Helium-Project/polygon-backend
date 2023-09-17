import type { Client } from "../class/Client";

export type PolygonBackendEvents = {
    connection: (client: Client) => void;
    close: () => void;
    error: (error: Error) => void;
}