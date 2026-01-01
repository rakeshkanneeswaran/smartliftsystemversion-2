"use client";

import { useEffect, useState } from "react";
import { socket } from "@/app/config/socket";
import { useSocketHeartbeat } from "@/app/hooks/useSocketHeartbeat";
import { PageLogin } from "@/app/components/PageLogin";
import { AUTH_CONFIG } from "@/app/config/auth";

/* ---------------- auth helpers ---------------- */

const SESSION_KEY = "lift_operator_auth";

function isSessionValid(): boolean {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  const { ts } = JSON.parse(raw);
  const maxAge = AUTH_CONFIG.operator.ttlHours * 60 * 60 * 1000;

  return Date.now() - ts < maxAge;
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
}

/* ---------------- component ---------------- */

export default function LiftOperator() {
  const [authenticated, setAuthenticated] = useState(false);

  const [isStopped, setIsStopped] = useState(false);
  const [optimalStops, setOptimalStops] = useState<number[]>([]);
  const [activeAction, setActiveAction] = useState<
    "NONE" | "STOP" | "RESUME" | "DONE"
  >("NONE");
  const [k, setK] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const online = useSocketHeartbeat();

  /* ---------------- auth check ---------------- */

  useEffect(() => {
    setAuthenticated(isSessionValid());
  }, []);

  const handleLogin = (u: string, p: string): boolean => {
    if (
      u === AUTH_CONFIG.operator.username &&
      p === AUTH_CONFIG.operator.password
    ) {
      saveSession();
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  /* ---------------- socket listeners ---------------- */

  useEffect(() => {
    if (!authenticated) return;

    socket.on("optimal_stops", setOptimalStops);
    socket.on("toggle_input", ({ disabled }) => setIsStopped(disabled));

    socket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off("optimal_stops");
      socket.off("toggle_input");
      socket.off("error");
    };
  }, [authenticated]);

  /* ---------------- guards ---------------- */

  const requireConnection = (): boolean => {
    if (!online) {
      setError("Not connected to server. Please try again.");
      setTimeout(() => setError(null), 3000);
      return false;
    }
    return true;
  };

  /* ---------------- actions ---------------- */

  const handleStopInput = () => {
    if (!requireConnection()) return;

    const next = !isStopped;
    setActiveAction(next ? "STOP" : "RESUME");
    socket.emit("toggle_input", { disabled: next });

    setTimeout(() => setActiveAction("NONE"), 800);
  };

  const handleDone = () => {
    if (!requireConnection()) return;

    setActiveAction("DONE");
    socket.emit("done", { k });

    setTimeout(() => setActiveAction("NONE"), 800);
  };

  /* ---------------- LOGIN GATE ---------------- */

  if (!authenticated) {
    return <PageLogin title="Lift Operator Login" onLogin={handleLogin} />;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="flex items-center justify-center h-screen p-6 bg-[#0E1117]">
      <div className="w-full max-w-4xl rounded-xl p-6 bg-[#161B22] text-[#E6EDF3] shadow-xl border border-[#30363D]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#30363D]">
          <h1 className="text-2xl font-semibold tracking-wide">
            Lift Operator Control
          </h1>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              online ? "bg-[#238636] text-white" : "bg-[#D73A49] text-white"
            }`}
          >
            {online ? "Online" : "Offline"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-[#D73A49]/20 text-[#E6EDF3] px-4 py-2 text-sm text-center border border-[#D73A49]">
            {error}
          </div>
        )}

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6 bg-[#21262D] rounded-xl p-5 border border-[#30363D]">
            <h2 className="text-sm uppercase tracking-wide text-[#8B949E]">
              Control Actions
            </h2>

            {/* k selector */}
            <div>
              <label className="block text-sm mb-1 text-[#8B949E]">
                Number of Optimal Stops
              </label>
              <select
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 bg-[#0E1117] border border-[#30363D] text-[#E6EDF3]"
              >
                {[1, 2, 3].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleStopInput}
                className={`py-4 rounded-lg font-semibold transition ${
                  isStopped
                    ? "bg-[#238636] hover:bg-[#2EA043]"
                    : "bg-[#D73A49] hover:bg-[#E5533D]"
                }`}
              >
                {isStopped ? "Resume Input" : "Stop Input"}
              </button>

              <button
                onClick={handleDone}
                className="py-4 rounded-lg font-semibold bg-[#1F6FEB] hover:bg-[#388BFD]"
              >
                Execute
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-xl p-6 bg-[#21262D] border border-[#30363D] flex flex-col">
            <h2 className="text-sm uppercase tracking-wide text-[#8B949E] mb-4">
              Optimized Lift Stops
            </h2>

            {optimalStops.length > 0 ? (
              <div className="text-3xl font-bold text-center text-[#E6EDF3]">
                {optimalStops.join(" → ")}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#8B949E] italic">
                Awaiting optimization…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
