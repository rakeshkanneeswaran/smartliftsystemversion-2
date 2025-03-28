"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default function LiftOperator() {
  const [isStopped, setIsStopped] = useState(false);
  const [optimalStops, setOptimalStops] = useState<number[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    const connectSocket = () => {
      if (!socket.connected) {
        setConnectionStatus("Reconnecting...");
        socket.connect();
      }
    };

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus("Connected");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected, trying to reconnect...");
      setConnectionStatus("Disconnected, trying to reconnect...");
      setTimeout(connectSocket, 1000);
    });

    socket.on("connect_error", () => {
      console.log("Reconnection failed");
      setConnectionStatus("Reconnection failed");
    });

    socket.on("optimal stops", (stops: number[]) => {
      setOptimalStops(stops);
    });

    return () => {
      socket.off("optimal stops");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  const handleStopInput = () => {
    setIsStopped(!isStopped);
    const dataToSend = JSON.stringify({ status: !isStopped });
    socket.emit("toggle input", dataToSend);
  };

  const handleDone = () => {
    socket.emit("done", {});
  };

  return (
    <div className="flex flex-col items-center p-10 space-y-6">
      <h1 className="text-4xl font-bold">Lift Operator Control</h1>

      {/* Connection Status Display */}
      <div
        className={`text-lg font-semibold ${
          connectionStatus === "Connected"
            ? "text-green-500"
            : connectionStatus.includes("Reconnecting")
            ? "text-yellow-500"
            : "text-red-500"
        }`}
      >
        {connectionStatus}
      </div>

      <div className="flex space-x-4">
        <button
          className="px-6 py-3 bg-red-600 text-white text-xl rounded-lg shadow-md hover:bg-red-700"
          onClick={handleStopInput}
        >
          {isStopped ? "Take Input" : "Stop Input"}
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white text-xl rounded-lg shadow-md hover:bg-green-700"
          onClick={handleDone}
        >
          Done
        </button>
      </div>

      {optimalStops.length > 0 && (
        <div className="mt-6 text-2xl font-semibold text-green-400">
          Optimal Stops: {optimalStops.join(", ")}
        </div>
      )}
    </div>
  );
}
