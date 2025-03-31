"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("/socket.io/", {
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

  useEffect(() => {
    socket.on("connect", () => console.log("Connected"));
    socket.on("done", () => {
      socket.emit(
        "request stops",
        JSON.stringify({ floors: selectedFloors, k })
      );
      setSelectedFloors([]);
    });
    socket.on("toggle input", (status: string) =>
      setDisableInputs(JSON.parse(status))
    );
    socket.on("optimal stops", (stops: number[]) => {
      setOptimalStops(stops);
      setSelectedFloors([]);
    });

    return () => {
      socket.off("optimal stops");
      socket.off("connect");
    };
  }, [selectedFloors, k]);

  const toggleFloor = (floor: number) => {
    if (disableInputs) return;
    setRecentlyClicked(floor);
    setSelectedFloors((prev) => [...prev, floor]);
    setTimeout(() => setRecentlyClicked(null), 300);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 text-center">
        SMART LIFT CONTROL
      </h1>

      {/* Main Content */}
      <div className="flex flex-1 gap-6">
        {/* Left Panel - System Configuration */}
        <div className="w-1/3 flex flex-col">
          <div className="bg-gray-800 rounded-xl p-4 flex-1">
            <div className="text-xl font-bold text-gray-300 mb-6">
              SYSTEM CONFIGURATION
            </div>

            <div className="mb-8">
              <div className="text-4xl font-bold text-blue-400 text-center">
                {selectedFloors.length}
              </div>
              <div className="text-lg text-gray-400 text-center">
                {selectedFloors.length === 1 ? "PERSON" : "PEOPLE"}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg text-gray-400 mb-2">
                OPTIMAL STOPS:
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {optimalStops.length > 0 && (
              <div className="mt-auto bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="text-lg font-medium text-blue-300 mb-2">
                  OPTIMAL STOPS
                </div>
                <div className="text-3xl font-bold text-white">
                  {optimalStops.join(", ")}
                </div>
              </div>
            )}

            {disableInputs && (
              <div className="mt-4 text-amber-300 font-medium text-lg animate-pulse text-center">
                PROCESSING...
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Floor Buttons */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((floor) => (
            <button
              key={floor}
              disabled={disableInputs}
              className={`rounded-2xl text-3xl font-bold transition-all duration-200 flex items-center justify-center h-full ${
                recentlyClicked === floor
                  ? "bg-green-500 scale-95 shadow-lg"
                  : selectedFloors.includes(floor)
                  ? "bg-blue-600 shadow-md"
                  : "bg-gray-700 hover:bg-gray-600 shadow"
              } ${
                disableInputs
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onClick={() => toggleFloor(floor)}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
