"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(
  "ws://ec2-13-235-33-26.ap-south-1.compute.amazonaws.com:3002",
  {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  }
);

export default function LiftOperator() {
  const [isStopped, setIsStopped] = useState(false);
  const [optimalStops, setOptimalStops] = useState<number[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "ONLINE" | "RECONNECTING" | "OFFLINE"
  >("RECONNECTING");
  const [activeAction, setActiveAction] = useState<
    "NONE" | "STOP" | "RESUME" | "DONE"
  >("NONE");

  useEffect(() => {
    const connectSocket = () => {
      if (!socket.connected) {
        setConnectionStatus("RECONNECTING");
        socket.connect();
      }
    };

    socket.on("connect", () => {
      setConnectionStatus("ONLINE");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("OFFLINE");
      setTimeout(connectSocket, 1000);
    });

    socket.on("connect_error", () => {
      setConnectionStatus("OFFLINE");
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
    setActiveAction(isStopped ? "RESUME" : "STOP");
    setIsStopped(!isStopped);
    socket.emit("toggle input", JSON.stringify({ status: !isStopped }));
    setTimeout(() => setActiveAction("NONE"), 1000);
  };

  const handleDone = () => {
    setActiveAction("DONE");
    socket.emit("done", {});
    setTimeout(() => setActiveAction("NONE"), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
      {/* HUD Display */}
      <div className="w-full max-w-4xl border-2 border-blue-400 rounded-xl bg-gray-800/50 backdrop-blur-sm p-6 shadow-2xl shadow-blue-500/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-blue-400/30 pb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            LIFT OPERATOR CONTROL
          </h1>
          <div
            className={`px-3 py-1 rounded-full text-sm font-mono flex items-center ${
              connectionStatus === "ONLINE"
                ? "bg-green-900/50 text-green-400 border border-green-400/30"
                : connectionStatus === "RECONNECTING"
                ? "bg-amber-900/50 text-amber-400 border border-amber-400/30"
                : "bg-red-900/50 text-red-400 border border-red-400/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === "ONLINE"
                  ? "bg-green-400 animate-pulse"
                  : connectionStatus === "RECONNECTING"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400"
              }`}
            ></span>
            {connectionStatus}
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Control Buttons */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-mono text-gray-400">
                CONTROL ACTIONS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleStopInput}
                  className={`relative overflow-hidden py-4 rounded-xl border-2 text-lg font-bold transition-all duration-300 ${
                    isStopped
                      ? "border-green-500 bg-green-900/20 hover:bg-green-900/30"
                      : "border-red-500 bg-red-900/20 hover:bg-red-900/30"
                  } ${
                    activeAction === "STOP" || activeAction === "RESUME"
                      ? "ring-4 ring-offset-2 ring-offset-gray-900 " +
                        (isStopped ? "ring-green-500" : "ring-red-500")
                      : ""
                  }`}
                >
                  <span className="relative z-10">
                    {isStopped ? "RESUME INPUT" : "STOP INPUT"}
                  </span>
                  <span
                    className={`absolute inset-0 ${
                      isStopped ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  ></span>
                </button>

                <button
                  onClick={handleDone}
                  className={`relative overflow-hidden py-4 rounded-xl border-2 border-blue-500 bg-blue-900/20 text-lg font-bold hover:bg-blue-900/30 transition-all duration-300 ${
                    activeAction === "DONE"
                      ? "ring-4 ring-offset-2 ring-offset-gray-900 ring-blue-500"
                      : ""
                  }`}
                >
                  <span className="relative z-10">EXECUTE</span>
                  <span className="absolute inset-0 bg-blue-500/10"></span>
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-2">
              <h2 className="text-xl font-mono text-gray-400">SYSTEM STATUS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm font-mono text-gray-400">
                    INPUT STATE
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      isStopped ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {isStopped ? "LOCKED" : "ACTIVE"}
                  </div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm font-mono text-gray-400">
                    LAST ACTION
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {activeAction === "NONE" ? "STANDBY" : activeAction}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimal Stops Display */}
          <div className="bg-gray-800/30 border-2 border-blue-400/30 rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-mono text-gray-400 mb-4">
              OPTIMIZATION DATA
            </h2>
            {optimalStops.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-sm font-mono text-blue-400 mb-2">
                  CALCULATED STOPS
                </div>
                <div className="text-4xl font-bold text-white mb-6">
                  {optimalStops.join(" → ")}
                </div>
                <div className="text-xs font-mono text-gray-500 mt-auto">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500 italic">
                  Awaiting optimization data...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-blue-400/20 text-xs font-mono text-gray-500 flex justify-between">
          <div>SYSTEM v2.4.7</div>
          <div>OPERATOR CONTROL PANEL</div>
          <div>{new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
