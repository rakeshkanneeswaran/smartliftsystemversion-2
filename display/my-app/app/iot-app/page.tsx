"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/config/socket";
import { useSocketHeartbeat } from "@/app/hooks/useSocketHeartbeat";
import { AUTH_CONFIG } from "@/app/config/auth";

export default function LiftControl() {
  /* ================= AUTH STATE ================= */

  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = () => {
    if (
      username === AUTH_CONFIG.iot.username &&
      password === AUTH_CONFIG.iot.password
    ) {
      sessionStorage.setItem(
        AUTH_CONFIG.iot.sessionKey,
        JSON.stringify({ loggedInAt: Date.now() })
      );
      setAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Invalid username or password");
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
          <h1 className="text-lg font-semibold text-[#E6EDF3] text-center mb-4">
            Lift IoT Control Login
          </h1>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-md bg-[#0E1117] border border-[#30363D] text-[#E6EDF3]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#0E1117] border border-[#30363D] text-[#E6EDF3]"
          />

          {authError && (
            <div className="mt-3 text-sm text-center text-[#D73A49]">
              {authError}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full mt-4 py-2 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-semibold"
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
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#30363D]">
        <h1 className="text-lg font-semibold text-[#E6EDF3]">
          Intelligent Lift Usage Optimization System
        </h1>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            online ? "bg-[#238636] text-white" : "bg-[#D73A49] text-white"
          }`}
        >
          {online ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {/* Status Panel */}
        <div className="w-[320px] flex-shrink-0">
          <div className="h-full bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col">
            <h2 className="text-xs uppercase tracking-wide text-[#8B949E] mb-4">
              System Status
            </h2>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[#D73A49]">
                {selectedFloors.length}
              </div>
              <div className="text-xs text-[#8B949E]">
                {selectedFloors.length === 1 ? "Passenger" : "Passengers"}
              </div>
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

        {/* Floor Grid */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-3 h-full gap-3">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((floor) => {
              const selected = selectedFloors.includes(floor);
              const active = recentlyClicked === floor;

              return (
                <button
                  key={floor}
                  onClick={() => toggleFloor(floor)}
                  disabled={disableInputs || !online}
                  className={`
                    w-full h-full rounded-lg text-2xl font-semibold
                    backdrop-blur-md border transition-all
                    ${
                      disableInputs || !online
                        ? "bg-[#161B22] text-[#6E7681] border-[#30363D] cursor-not-allowed"
                        : active
                        ? "bg-[#D73A49] text-white scale-95"
                        : selected
                        ? "bg-[#1F6FEB] text-white"
                        : "bg-[#21262D]/70 text-[#E6EDF3] hover:bg-[#30363D]"
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
