import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import { Server, Socket } from "socket.io";
import { calculateOptimalLiftStops } from "./k-means";
import { logLiftDecision } from "./liftDecisionLogger";
import { countFloorClicks } from "./floorCounter";

const server = fastify({ logger: true });
const clients = new Set<Socket>();

let currentK = 3;

declare module "fastify" {
    interface FastifyInstance {
        io: Server;
    }
}

server.register(fastifyIO, {
    path: "/socket.io",
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});


server.get("/health", async () => ({ status: "OK" }));

server.ready().then(() => {
    server.io.on("connection", (socket: Socket) => {
        clients.add(socket);
        server.log.info(`Connected: ${socket.id}`);

        socket.on("request_stops", ({ floors }) => {
            if (!Array.isArray(floors) || floors.length === 0) return;

            // Count student clicks
            const floorClicks = countFloorClicks(floors);

            // Backend decides stops
            const decidedStops = calculateOptimalLiftStops(floors, currentK);

            // Log decision
            logLiftDecision({
                floorClicks,
                decidedStops,
            });

            // Send result to all clients
            clients.forEach((c) => c.emit("optimal_stops", decidedStops));
        });

        socket.on("toggle_input", ({ disabled }) => {
            if (!socket.connected) {
                socket.emit("error", {
                    message: "Not connected to server. Please try again.",
                });
                return;
            }

            clients.forEach((c) => c.emit("toggle_input", { disabled }));
            socket.emit("ack", { action: "toggle_input" });
        });

        socket.on("done", ({ k }) => {
            if (!socket.connected) {
                socket.emit("error", {
                    message: "Not connected to server. Please try again.",
                });
                return;
            }

            if (typeof k === "number" && k > 0) {
                currentK = k;
            }

            clients.forEach((c) => c.emit("done"));
            socket.emit("ack", { action: "done" });
        });

        socket.on("ping_alive", () => {
            socket.emit("pong_alive");
        });

        socket.on("disconnect", () => {
            clients.delete(socket);
            server.log.info(`Disconnected: ${socket.id}`);
        });
    });
});

server.listen({ port: 3002, host: "0.0.0.0" });
