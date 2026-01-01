"use client";

import { useState } from "react";

export function PageLogin({
  onLogin,
  title,
}: {
  onLogin: (u: string, p: string) => boolean;
  title: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const ok = onLogin(username, password);
    if (!ok) {
      setError("Invalid username or password");
    } else {
      setError(null);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: "#BDE8F5" }}
    >
      <div
        className="w-full max-w-sm rounded-xl shadow-lg p-6"
        style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
      >
        {/* Title */}
        <h1
          className="text-xl font-semibold text-center mb-6"
          style={{ color: "#000000" }}
        >
          {title}
        </h1>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border outline-none"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#4988C4",
              color: "#000000",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border outline-none"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#4988C4",
              color: "#000000",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-4 text-sm text-center font-medium"
            style={{ color: "#000000" }}
          >
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={submit}
          className="w-full mt-6 py-2 rounded-lg font-semibold transition"
          style={{
            backgroundColor: "#1C4D8D",
            color: "#FFFFFF", // button text stays white for contrast
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
