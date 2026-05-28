"use client";

import { pauseSession, startSession } from "@/actions/session.action";
import { syncUser } from "@/actions/user.action";
import {
  Dice5,
  Flame,
  Vault,
  Trophy,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

// ─── Helpers (module-level, never re-created) ────────────────────────────────

function calculateModStudyTime(minutes) {
  const decimal = minutes / 60;
  const arr = decimal.toLocaleString().split(".");
  const hours = arr[0];
  const mins = arr[1] ? (parseFloat(`0.${arr[1]}`) * 60).toFixed() : "0";
  return `${hours}h ${mins}m`;
}

function formatTimerDisplay(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getMascot(studiedToday, isPenalty, wallRank) {
  if (wallRank === "#1") return "/mascot/king.jpg";
  if (isPenalty) return "/mascot/bankrupt.jpg";
  if (studiedToday >= 3600000 * 2) return "/mascot/sleeper.jpg";
  if (studiedToday >= 3600000) return "/mascot/chiller.jpg";
  if (studiedToday > 0) return "/mascot/chiller.jpg";
  return "/mascot/chiller.jpg";
}

// ─── Static data (module-level, never re-created) ────────────────────────────

const NAV_ITEMS = [
  { icon: Dice5, label: "SLOTS" },
  { icon: Flame, label: "SHAME" },
  { icon: Vault, label: "VAULT" },
];

const user = {
  username: "DevPro_01",
  currentMojo: 125,
  status: "The Grinder",
  rewardTime: -6000,
  wallRank: "#2",
  studiedToday: 9520000,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();

  // ── Timer state ─────────────────────────────────────────────────────────────
  const [durationMinutes, setDurationMinutes] = useState(() => {
    // FIX: lazy initializer runs once — no double-effect needed
    if (typeof window === "undefined") return 60;
    const stored = localStorage.getItem("timeLeft");
    if (stored) return ~~(Number(stored.replaceAll(",", "")) / (60 * 1000));
    return 60;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    // FIX: lazy initializer runs once — replaces the two mount useEffects
    if (typeof window === "undefined") return 60 * 60 * 1000;
    const stored = localStorage.getItem("timeLeft");
    return stored ? Number(stored.replaceAll(",", "")) : 60 * 60 * 1000;
  });

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("timeLeft");
  });

  const [sessionStartTime, setSessionStartTime] = useState(null);
  const timerRef = useRef(null);

  // ── Sync user once on auth ──────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && clerkUser?.id) {
      syncUser(clerkUser.id);
    }
  }, [isLoaded, clerkUser?.id]);

  // ── Sync timeLeft when duration slider changes (only when NOT running) ──────
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durationMinutes * 60 * 1000);
    }
    // FIX: removed localStorage reads here — handled by lazy initializers above
  }, [durationMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── beforeunload — registered once, cleaned up properly ────────────────────
  // FIX: was called bare in render body, re-adding listener on every render
  useEffect(() => {
    const handler = () => {
      localStorage.setItem("timeLeft", timeLeft.toLocaleString());
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [timeLeft]); // re-bind only when timeLeft changes so it captures latest value

  // ── Interval ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // ── Callbacks — stable references, not recreated each render ────────────────
  const toggleTimer = useCallback(async () => {
    setIsRunning((prev) => {
      const next = !prev;

      if (next) {
        // Starting
        localStorage.setItem("timeLeft", timeLeft.toLocaleString());
        setSessionStartTime(Date.now());
        startSession({
          userId: clerkUser?.id,
          duration: durationMinutes * 60 * 1000,
          remainingTime: timeLeft,
        });
      } else if (sessionStartTime) {
        // Pausing
        localStorage.setItem("timeLeft", timeLeft.toLocaleString());
        pauseSession({ userId: clerkUser?.id, lra: sessionStartTime });
      }

      return next;
    });
  }, [timeLeft, durationMinutes, clerkUser?.id, sessionStartTime]);

  const resetTimer = useCallback(() => {
    localStorage.removeItem("timeLeft");
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60 * 1000);
  }, [durationMinutes]);

  const handleDurationChange = useCallback((e) => {
    setDurationMinutes(parseInt(e.target.value, 10));
  }, []);

  // ── Derived values — memoized, not recomputed every render ──────────────────
  const isPenalty = user.rewardTime < 0;

  const result = useMemo(
    () => calculateModStudyTime(user.studiedToday / 60000),
    [user.studiedToday], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const penalty = useMemo(
    () => calculateModStudyTime(user.rewardTime / 60000),
    [user.rewardTime], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // FIX: pure derivation — no useEffect + setState needed
  const mascot = useMemo(
    () => getMascot(user.studiedToday, isPenalty, user.wallRank),
    [isPenalty], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const timerDisplay = useMemo(() => formatTimerDisplay(timeLeft), [timeLeft]);

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-mono text-black pb-28">
      <div className="p-4 max-w-xl mx-auto">
        {/* Top Bar */}
        <div className="flex gap-4 mb-4">
          {clerkUser ? <UserButton /> : null}
          <SignInButton mode="modal" />

          <div className="flex-1 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs uppercase font-bold text-gray-500">
              {isPenalty ? "Penalty" : "Rewards"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Trophy
                size={18}
                strokeWidth={3}
                className={isPenalty ? "text-red-600" : "text-green-600"}
              />
              <h1
                className={`text-xl font-black ${isPenalty ? "text-red-600" : "text-green-600"}`}
              >
                {penalty}
              </h1>
            </div>
          </div>

          <div className="flex-1 border-4 border-black bg-[#FFFF00] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs uppercase font-bold">Time Studied</p>
            <div className="flex items-center gap-2 mt-1">
              <Timer size={18} strokeWidth={3} />
              <h1 className="text-xl font-black">{result}</h1>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="border-4 border-black bg-[#00FF00] p-6 mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block">
                Session Control
              </h2>
              <p className="text-[11px] font-bold uppercase mt-1 text-black/80">
                Range: 15 mins to 6 hours
              </p>
            </div>
            <div className="text-3xl font-black tracking-tight bg-white border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {timerDisplay}
            </div>
          </div>

          <div className="bg-white border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <label className="block text-xs font-black uppercase mb-1">
              Set Duration: {Math.floor(durationMinutes / 60)}h{" "}
              {durationMinutes % 60}m
            </label>
            <input
              type="range"
              min="15"
              max="360"
              step="15"
              value={durationMinutes}
              disabled={isRunning}
              onChange={handleDurationChange}
              className="w-full accent-black cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className={`flex-1 border-4 border-black p-3 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                isRunning
                  ? "bg-[#FF2D2D] text-white"
                  : "bg-white text-black hover:bg-neutral-100"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={16} strokeWidth={3} /> Pause
                </>
              ) : (
                <>
                  <Play size={16} strokeWidth={3} /> Start Session
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="border-4 border-black bg-white p-3 font-black text-sm uppercase flex items-center justify-center aspect-square shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-neutral-100"
              title="Reset Timer"
            >
              <RotateCcw size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Mascot */}
        <div className="border-4 border-black bg-white mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
            {user.status}
          </div>

          <div className="w-48 h-48 bg-[#0000FF]/10 flex items-center justify-center mb-4">
            <img
              src={mascot}
              alt="Mascot status representation"
              className="aspect-square"
              fetchPriority="high"
            />
          </div>

          <div className="w-full border-4 border-black bg-[#FF2D2D] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black uppercase">
                  Wall Of Shame
                </h2>
                <p className="text-[10px] opacity-90 uppercase tracking-wide">
                  Slack again and your rank climbs higher.
                </p>
              </div>
              <div className="text-4xl font-black tracking-tighter">
                {user.wallRank}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F0F0F0] border-t-4 border-black px-3 py-2 z-50">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="bg-[#EDEDED] border-[5px] border-black h-24 flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 transition-all"
                >
                  <Icon size={34} strokeWidth={3.2} className="mb-1" />
                  <div className="text-lg font-black tracking-tight leading-none">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
