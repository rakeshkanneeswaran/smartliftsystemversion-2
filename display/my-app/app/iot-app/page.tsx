"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/config/socket";
import { useSocketHeartbeat } from "@/app/hooks/useSocketHeartbeat";
import { AUTH_CONFIG } from "@/app/config/auth";

export default function LiftControl() {
  /* ================= AUTH STATE ================= */

  const [authenticated, setAuthenticated] = useState(false);
  const username = AUTH_CONFIG.iot.username;
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(AUTH_CONFIG.iot.sessionKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const ttlMs = AUTH_CONFIG.iot.ttlHours * 60 * 60 * 1000;

      if (Date.now() - data.loggedInAt < ttlMs) {
        setAuthenticated(true);
      } else {
        sessionStorage.removeItem(AUTH_CONFIG.iot.sessionKey);
      }
    } catch {
      sessionStorage.removeItem(AUTH_CONFIG.iot.sessionKey);
    }
  }, []);

  const handleDigitPress = (digit: number) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
    setAuthError(null);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
    setAuthError(null);
  };

  const handleLogin = () => {
    if (pin.length !== 4) {
      setAuthError("Enter 4-digit PIN");
      return;
    }

    if (pin === AUTH_CONFIG.iot.password) {
      sessionStorage.setItem(
        AUTH_CONFIG.iot.sessionKey,
        JSON.stringify({ loggedInAt: Date.now() })
      );
      setAuthenticated(true);
      setPin("");
      setAuthError(null);
    } else {
      setAuthError("Invalid PIN");
      setPin("");
    }
  };

  /* ================= APP STATE ================= */

  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [optimalStops, setOptimalStops] = useState<number[]>([]);
  const [recentlyClicked, setRecentlyClicked] = useState<number | null>(null);
  const [disableInputs, setDisableInputs] = useState(false);

  const online = useSocketHeartbeat();

  const selectedFloorsRef = useRef<number[]>([]);
  useEffect(() => {
    selectedFloorsRef.current = selectedFloors;
  }, [selectedFloors]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!authenticated) return;

    const handleDone = () => {
      if (selectedFloorsRef.current.length === 0) return;
      socket.emit("request_stops", { floors: selectedFloorsRef.current });
      setSelectedFloors([]);
    };

    socket.on("done", handleDone);
    socket.on("toggle_input", ({ disabled }) => setDisableInputs(disabled));
    socket.on("optimal_stops", setOptimalStops);

    return () => {
      socket.off("done", handleDone);
      socket.off("toggle_input");
      socket.off("optimal_stops");
    };
  }, [authenticated]);

  const toggleFloor = (floor: number) => {
    if (disableInputs || !online) return;
    setRecentlyClicked(floor);
    setSelectedFloors((prev) => [...prev, floor]);
    setTimeout(() => setRecentlyClicked(null), 150);
  };

  /* ================= LOGIN UI ================= */

  if (!authenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0E1117]">
        <div className="w-full max-w-sm bg-[#161B22] border border-[#30363D] rounded-xl p-6">
          <h1 className="text-lg font-semibold text-[#E6EDF3] text-center mb-2">
            Lift IoT Control
          </h1>

          <div className="text-center text-sm text-[#8B949E] mb-4">
            User: <span className="font-semibold text-white">{username}</span>
          </div>

          {/* PIN DISPLAY */}
          <div className="mb-4 text-center">
            <div className="text-3xl tracking-widest text-[#E6EDF3]">
              {"•".repeat(pin.length)}
            </div>
          </div>

          {/* KEYPAD */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleDigitPress(n)}
                className="py-4 rounded-lg bg-[#21262D] text-white text-xl active:scale-95"
              >
                {n}
              </button>
            ))}

            <button
              onClick={handleBackspace}
              className="py-4 rounded-lg bg-[#30363D] text-white text-lg"
            >
              ⌫
            </button>

            <button
              onClick={() => handleDigitPress(0)}
              className="py-4 rounded-lg bg-[#21262D] text-white text-xl"
            >
              0
            </button>

            <button
              onClick={handleClear}
              className="py-4 rounded-lg bg-[#30363D] text-white text-lg"
            >
              C
            </button>
          </div>

          {authError && (
            <div className="text-center text-sm text-[#D73A49] mb-3">
              {authError}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-2 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <div className="h-screen flex flex-col bg-[#0E1117] overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D]">
        <h1 className="text-lg font-semibold text-[#E6EDF3]">
          Intelligent Lift Usage Optimization System
        </h1>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            online ? "bg-[#238636]" : "bg-[#D73A49]"
          } text-white`}
        >
          {online ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {/* STATUS PANEL */}
        <div className="w-[320px]">
          <div className="h-full bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col">
            <h2 className="text-xs uppercase text-[#8B949E] mb-4">
              System Status
            </h2>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[#D73A49]">
                {selectedFloors.length}
              </div>
              <div className="text-xs text-[#8B949E]">Passengers</div>
            </div>

            {optimalStops.length > 0 && (
              <div className="mt-auto bg-[#21262D] border border-[#30363D] rounded-lg p-3 text-center">
                <div className="text-xs text-[#8B949E] mb-1">Optimal Stops</div>
                <div className="text-base font-semibold text-[#E6EDF3]">
                  {optimalStops.join(", ")}
                </div>
              </div>
            )}

            {disableInputs && (
              <div className="mt-3 text-center text-[#E3B341] text-xs">
                INPUT LOCKED
              </div>
            )}

            {!online && (
              <div className="mt-1 text-center text-[#D73A49] text-xs">
                CONNECTION LOST
              </div>
            )}
          </div>
        </div>

        {/* FLOOR GRID */}
        <div className="flex-1">
          <div className="grid grid-cols-3 h-full gap-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((floor) => {
              const selected = selectedFloors.includes(floor);
              const active = recentlyClicked === floor;

              return (
                <button
                  key={floor}
                  onClick={() => toggleFloor(floor)}
                  disabled={disableInputs || !online}
                  className={`
                    rounded-lg text-2xl font-semibold border transition-all
                    ${
                      disableInputs || !online
                        ? "bg-[#161B22] text-[#6E7681]"
                        : active
                        ? "bg-[#D73A49] text-white scale-95"
                        : selected
                        ? "bg-[#1F6FEB] text-white"
                        : "bg-[#21262D] text-[#E6EDF3] hover:bg-[#30363D]"
                    }
                    border-[#30363D]
                  `}
                >
                  {floor}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
