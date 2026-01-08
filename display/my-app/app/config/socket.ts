import { io } from "socket.io-client";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    `ws://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3002`;

export const socket = io(
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "http://localhost:3000"),
    {
        path: "/socket.io",
        transports: ["websocket"],
    }
);





