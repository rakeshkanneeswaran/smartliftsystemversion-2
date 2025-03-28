"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default function LiftControl() {
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [k, setK] = useState(3);
  const [optimalStops, setOptimalStops] = useState<number[]>([]);
  const [recentlyClicked, setRecentlyClicked] = useState<number | null>(null);
  const [disableInputs, setDisableInputs] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "Connected" | "Reconnecting..." | "Disconnected"
  >("Reconnecting...");

  useEffect(() => {
    const connectSocket = () => {
      if (!socket.connected) {
        socket.connect();
      }
    };

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus("Connected");
    });

    socket.on("done", () => {
      console.log("Done");
      setSelectedFloors((prev) => {
        socket.emit("request stops", JSON.stringify({ floors: prev, k }));
        setSelectedFloors([]);
        return prev;
      });
    });

    socket.on("toggle input", (message: string) => {
      const status = JSON.parse(message);
      console.log("Inputs status:", { status });
      setDisableInputs(status);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected, trying to reconnect...");
      setConnectionStatus("Reconnecting...");
      setTimeout(connectSocket, 1000);
    });

    socket.on("connect_error", () => {
      console.log("Connection failed.");
      setConnectionStatus("Disconnected");
    });

    socket.on("optimal stops", (stops: number[]) => {
      setOptimalStops(stops);
      setSelectedFloors([]);
    });

    return () => {
      socket.off("optimal stops");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [selectedFloors, k]);

  const toggleFloor = (floor: number) => {
    setRecentlyClicked(floor);
    setSelectedFloors((prev) => [...prev, floor]);
    setTimeout(() => setRecentlyClicked(null), 500);
  };

  return (
    <div className="flex flex-col items-center p-10 space-y-6">
      <h1 className="text-4xl font-bold">Smart Lift System</h1>

      {/* Connection Status */}
      <div
        className={`px-4 py-2 rounded-lg text-lg font-semibold ${
          connectionStatus === "Connected"
            ? "bg-green-500 text-white"
            : connectionStatus === "Reconnecting..."
            ? "bg-yellow-500 text-black"
            : "bg-red-500 text-white"
        }`}
      >
        {connectionStatus}
      </div>

      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        {Array.from({ length: 15 }, (_, i) => i + 1).map((floor) => (
          <button
            key={floor}
            className={`w-16 h-16 rounded-lg text-white text-xl font-bold transition-colors duration-300 ${
              recentlyClicked === floor ? "bg-green-500" : "bg-gray-700"
            }`}
            onClick={() => toggleFloor(floor)}
          >
            {floor}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <label className="text-xl font-medium">Number of Stops:</label>
        <select
          className="p-3 border rounded-lg text-lg"
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
        >
          {[1, 2, 3].map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      <div>Number of People: {selectedFloors.length}</div>

      {optimalStops.length > 0 && (
        <div className="mt-6 text-2xl font-semibold text-green-400">
          Optimal Stops: {optimalStops.join(", ")}
        </div>
      )}

      {disableInputs && (
        <div className="text-xl font-semibold text-red-500">
          Inputs are disabled, please wait...
        </div>
      )}
    </div>
  );
}
