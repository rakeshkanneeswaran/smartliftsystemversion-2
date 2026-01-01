"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_CONFIG, Role } from "@/app/config/auth";

export default function LandingPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!role) {
      setError("Please select a system first");
      return;
    }

    const config = AUTH_CONFIG[role];

    if (username !== config.username || password !== config.password) {
      setError("Invalid credentials for selected system");
      return;
    }

    // ✅ mark authenticated
    sessionStorage.setItem("auth_ok", "true");
    sessionStorage.setItem("role", role);

    router.push(config.redirect);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Smart Lift System
        </h1>

        {/* Step 1: Select Mode */}
        <div className="mb-6 space-y-3">
          {Object.entries(AUTH_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => {
                setRole(key as Role);
                setError(null);
              }}
              className={`w-full py-2 rounded-lg border font-medium transition ${
                role === key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Step 2: Credentials */}
        {role && (
          <div className="space-y-4 mb-4">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
        )}

        {/* Continue */}
        <button
          onClick={handleLogin}
          disabled={!role}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
