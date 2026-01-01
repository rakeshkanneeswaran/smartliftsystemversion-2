"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      className="flex items-center justify-center h-screen px-6"
      style={{ backgroundColor: "#BDE8F5" }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl shadow-lg p-10 text-center"
        style={{ backgroundColor: "#0F2854", color: "#E6EDF3" }}
      >
        {/* Institute Heading */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          SRM Institute of Science and Technology
        </h1>

        <p className="text-sm md:text-base text-[#BDE8F5] opacity-90 mb-8">
          Smart Lift Usage Optimization System
        </p>

        {/* Divider */}
        <div className="h-px bg-white/20 mb-10" />

        {/* Select Mode */}
        <h2 className="text-lg font-semibold mb-6">Select Application Mode</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IoT App */}
          <button
            onClick={() => router.push("/iot-app")}
            className="rounded-xl p-6 text-left transition hover:scale-[1.02]"
            style={{ backgroundColor: "#1C4D8D" }}
          >
            <h3 className="text-lg font-bold mb-2">Smart IoT Display</h3>
            <p className="text-sm opacity-80">
              Floor input panel installed near the lift for passenger usage
            </p>
          </button>

          {/* Operator App */}
          <button
            onClick={() => router.push("/lift-operator")}
            className="rounded-xl p-6 text-left transition hover:scale-[1.02]"
            style={{ backgroundColor: "#4988C4", color: "#0F2854" }}
          >
            <h3 className="text-lg font-bold mb-2">Lift Operator Console</h3>
            <p className="text-sm opacity-80">
              Control panel for operators to execute optimized lift stops
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
