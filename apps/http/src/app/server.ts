import http from "http";
import app from "./app";
import { env } from "./config/env";

const server = http.createServer(app);

const shutdown = () => {
    console.log("Server shutting down");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    })
}

server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
