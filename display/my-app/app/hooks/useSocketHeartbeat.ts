import { useEffect, useState } from "react";
import { socket } from "@/app/config/socket";

export function useSocketHeartbeat() {
    const [online, setOnline] = useState(socket.connected);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const ping = () => {
            socket.emit("ping_alive");
            timeout = setTimeout(() => {
                setOnline(false);
                socket.connect();
            }, 5000);
        };

        socket.on("pong_alive", () => {
            clearTimeout(timeout);
            setOnline(true);
        });

        socket.on("connect", () => setOnline(true));
        socket.on("disconnect", () => setOnline(false));

        const interval = setInterval(ping, 3000);

        return () => {
            clearInterval(interval);
            socket.off("pong_alive");
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return online;
}
