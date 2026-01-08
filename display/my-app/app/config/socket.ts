import { io } from "socket.io-client";



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





