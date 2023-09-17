# Polygon Backend

> Polygon backend implemented in Typescript for Node.js

#### Example

```js
import { PolygonBackend } from "polygon-backend";

const server = new PolygonBackend();

server.on("connection", (client) => {
    client.on("packet", console.log);
    client.on("error", console.error);
});

server.listen({
    host: "0.0.0.0",
    port: 9838
}, () => console.log("Listening!"));
```