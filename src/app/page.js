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
import { useState, useEffect, useRef } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();

  const user = {
    username: "DevPro_01",
    currentMojo: 125,
    status: "The Grinder",
    rewardTime: -6000,
    wallRank: "#2",
    studiedToday: 5520000,
  };

  // --- Timer State Logic ---
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const timerRef = useRef(null);

  // Sync user to MongoDB on component mount - only when user is authenticated
  useEffect(() => {
    if (isLoaded && clerkUser?.id) {
      syncUser(clerkUser.id);
    }
  }, [isLoaded, clerkUser?.id]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durationMinutes * 60 * 1000);
    }
  }, [durationMinutes]);

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
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = async () => {
    setIsRunning((prev) => !prev);

    if (!isRunning) {
      // Starting session
      setSessionStartTime(Date.now());
      await startSession({
        userId: clerkUser?.id,
        duration: durationMinutes * 60 * 1000,
        remainingTime: durationMinutes * 60 * 1000,
      });
    }

    if (isRunning && sessionStartTime) {
      // Pausing session
      await pauseSession({
        userId: clerkUser?.id,
        lra: sessionStartTime,
      });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60 * 1000);
  };

  const formatTimerDisplay = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- End Timer Logic ---

  let modStudyTime = user.studiedToday / 60000;
  let result = "0";
  let penalty = "0";

  function calculateModStudyTime(time) {
    const decimal = time / 60;
    let arr = decimal.toLocaleString().split(".");
    const hours = arr[0];
    const minutes = arr[1] ? (parseFloat(`0.${arr[1]}`) * 60).toFixed() : "0";
    return `${hours}h ${minutes}m`;
  }

  result = calculateModStudyTime(modStudyTime);
  penalty = calculateModStudyTime(user.rewardTime / 60000);

  const [mascot, setMascot] = useState("/mascot/chiller.jpg");
  const isPenalty = user.rewardTime < 0;

  useEffect(() => {
    if (user.studiedToday >= 3600000) setMascot("/mascot/chiller.jpg");
    if (user.studiedToday >= 3600000 * 2) setMascot("/mascot/sleeper.jpg");
    if (user.studiedToday < 3600000 && user.studiedToday > 0)
      setMascot("/mascot/chiller.jpg");
    if (isPenalty) setMascot("/mascot/bankrupt.jpg");
    if (user.wallRank === "#1") setMascot("/mascot/king.jpg");
  }, [isPenalty, user.studiedToday, user.wallRank]);

  const navItems = [
    { icon: Dice5, label: "SLOTS" },
    { icon: Flame, label: "SHAME" },
    { icon: Vault, label: "VAULT" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-mono text-black pb-28">
      <div className="p-4 max-w-xl mx-auto">
        {/* Top Bar */}
        <div className="flex gap-4 mb-4">
          {user ? <UserButton /> : null}
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

        {/* NEO-BRUTALIST TIMER COMPONENT */}
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
              {formatTimerDisplay(timeLeft)}
            </div>
          </div>

          {/* Configuration Input Controls */}
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
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="w-full accent-black cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Interactive Button Elements */}
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

        {/* Mascot Area */}
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

          {/* Wall Of Shame Ranking */}
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

        {/* Sticky Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F0F0F0] border-t-4 border-black px-3 py-2 z-50">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {navItems.map((item) => {
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
