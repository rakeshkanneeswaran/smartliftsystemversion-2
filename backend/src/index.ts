import fastify, { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { Server, Socket } from 'socket.io';
import { calculateOptimalLiftStops } from './k-means';

const liveWebClients = new Set<Socket>();

// Extend Fastify types to include io
declare module 'fastify' {
    interface FastifyInstance {
        io: Server;
    }
}
const server: FastifyInstance = fastify({ logger: true });
server.register(fastifyIO, {
    cors: {
        origin: "*", // Allow all origins (change in production)
        methods: ["GET", "POST"]
    }
});

// Basic route
server.get('/', async (request, reply) => {
    return { message: 'WebSocket server running' };
});



// Socket.IO connection handler
server.ready().then(() => {
    server.io.on('connection', (socket: Socket) => {
        liveWebClients.add(socket);
        server.log.info(`Client connected: ${socket.id}`);
        socket.on('request stops', (msg: string) => {
            server.log.info(`msg: ${msg}`);
            const data = JSON.parse(msg);
            server.log.info(`Received request: ${data}`);
            const floors = data.floors;
            server.log.info(`Floors: ${floors}`);
            const k = data.k;
            const stops = calculateOptimalLiftStops(floors, k);
            server.log.info(`Optimal stops: ${stops}`);
            liveWebClients.forEach(client => {
                liveWebClients.forEach(client => {
                    client.emit('optimal stops', stops);
                });

            })
        })
        socket.on('toggle input', (msg: string) => {
            server.log.info(`msg: ${msg}`);
            const data = JSON.parse(msg);
            server.log.info(`Received toggle: ${data}`);
            const status = data.status;
            liveWebClients.forEach(client => {
                client.emit('toggle input', status);
            });
        })

        socket.on('done', () => {
            liveWebClients.forEach(client => {
                client.emit('done', {});
            });
        })
        socket.on('disconnect', () => {
            server.log.info(`Client disconnected: ${socket.id}`);
            liveWebClients.delete(socket);
        });
    });
});

// Start server
const start = async () => {
    try {
        const PORT = 3002;
        await server.listen({
            port: PORT as number,
            host: '0.0.0.0',  // ← Critical for Docker
        });
        server.log.info(`Server listening on 3002`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();