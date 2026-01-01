import { io } from "socket.io-client";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    `ws://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3002`;

export const socket = io(BACKEND_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});
