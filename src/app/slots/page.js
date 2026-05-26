"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Zap, X, Clock, AlertTriangle } from "lucide-react";
// import connectDB from "./lib/db";
// import { syncUser } from "@/actions/user.action";

const SlotsPage = () => {
  // Initial work to connect DB and sync user on component mount
  // useEffect(() => {
  //   async function initialize() {
  //     await connectDB();
  //     await syncUser()
  //       .then((createdUser) => {
  //         console.log("User synced: ", createdUser);
  //       })
  //       .catch((err) => console.log("Couldnt find created User"));
  //   }
  //   initialize();
  // }, []);

  const intervals = ["5m", "D1", "D2", "D4", "D7", "D15", "D30"];

  // State to manage the time warp for testing
  const [timeOffset, setTimeOffset] = useState(0);
  const currentSimulatedTime = Date.now() + timeOffset;

  // Mock initial data
  const [topics, setTopics] = useState([
    {
      id: 1,
      name: "React State Management",
      deadline: Date.now() + 1000 * 60 * 30, // Due in 30 mins
      slots: [true, true, true, true, true, true, null],
    },
    {
      id: 2,
      name: "MongoDB Indexing",
      deadline: Date.now() - 1000 * 60 * 10, // MISSED 10 mins ago
      slots: [true, false, false, null, null, null, null],
    },
    {
      id: 3,
      name: "Neo-Brutalist Layouts",
      deadline: Date.now() + 1000 * 60 * 60 * 24, // Due tomorrow
      slots: [false, null, null, null, null, null, null],
    },
    {
      id: 4,
      name: "Deployment",
      deadline: Date.now() + 1000 * 60 * 60 * 24, // Due tomorrow
      slots: [false, null, null, null, null, null, null],
    },
  ]);

  // Process data based on SIMULATED time
  const getProcessedData = () => {
    return topics.map((topic) => {
      const isPastDue = currentSimulatedTime > topic.deadline;

      const processedSlots = topic.slots.map((s) => {
        // If deadline passed and it wasn't finished (true), it is forcefully marked 'missed'
        if (isPastDue && s !== true) return "missed";
        return s;
      });

      const hasMissed = processedSlots.some((s) => s === "missed");

      return {
        ...topic,
        processedSlots,
        isGuillotined: isPastDue && hasMissed,
        isLocked: isPastDue,
      };
    });
  };

  const handleToggle = (topicId, slotIndex) => {
    setTopics((prev) =>
      prev.map((t) => {
        // Logic: Cannot edit if the global deadline for the row has passed
        if (t.id !== topicId || currentSimulatedTime > t.deadline) return t;

        const newSlots = [...t.slots];
        // Toggle between Complete (true) and Pending (false/null)
        newSlots[slotIndex] = newSlots[slotIndex] === true ? false : true;

        return { ...t, slots: newSlots };
      }),
    );
  };

  const data = getProcessedData();

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-mono text-black p-4 pb-24">
      {/* Simulation Banner */}
      {timeOffset !== 0 && (
        <div className="bg-black text-[#FFFF00] text-[10px] p-1.5 text-center font-black uppercase mb-3 border-b-4 border-black">
          ⚠️ TIME WARP: {timeOffset > 0 ? "+" : ""}
          {Math.round(timeOffset / 60000)}m Offset Active
        </div>
      )}

      {/* Header */}
      <div className="flex gap-3 mb-6">
        <button className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex-1 border-4 border-black bg-[#FFFF00] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none">
              The Grid
            </h1>
            <p className="text-[10px] font-bold uppercase mt-1">
              Revision Slots
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black opacity-50 uppercase">
              Simulated Time
            </p>
            <p className="text-sm font-black tabular-nums">
              {new Date(currentSimulatedTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 text-left sticky left-0 bg-black z-20 min-w-40 text-xs uppercase italic border-r border-white/20">
                  Topic
                </th>
                {intervals.map((int) => (
                  <th
                    key={int}
                    className="p-4 text-center text-[10px] font-black border-l border-white/10"
                  >
                    {int}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b-4 border-black transition-colors ${row.isGuillotined ? "bg-gray-100" : "bg-white"}`}
                >
                  {/* Topic Sticky Column */}
                  <td
                    className={`p-4 sticky left-0 z-10 border-r-4 border-black ${row.isGuillotined ? "bg-gray-200" : "bg-white"}`}
                  >
                    <p
                      className={`font-black text-sm uppercase truncate w-32 ${row.isGuillotined ? "line-through opacity-50" : ""}`}
                    >
                      {row.name}
                    </p>
                    <div
                      className={`text-[9px] font-black mt-1 flex items-center gap-1 ${row.isLocked && row.slots.includes(null) ? "text-red-600" : "text-blue-600"}`}
                    >
                      {row.isLocked && row.slots.every((s) => s === null) ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {row.isLocked && row.slots.includes(null)
                        ? "GUILLOTINE STRUCK"
                        : row.isLocked && row.slots.every((s) => s === true)
                          ? "Completed"
                          : "Pending"}
                          {/* TODO: Potential Bug */}
                    </div>
                  </td>

                  {/* Slot Interactive Buttons */}
                  {row.processedSlots.map((status, idx) => (
                    <td
                      key={idx}
                      className="p-2 border-l-2 border-black/5 text-center"
                    >
                      <button
                        disabled={row.isLocked}
                        onClick={() => handleToggle(row.id, idx)}
                        className={`
                          w-12 h-12 mx-auto flex items-center justify-center border-4 border-black transition-all relative overflow-hidden
                          ${status === true ? "bg-[#00FF00] hover:bg-[#00FF00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white"}
                          ${status === "missed" ? "bg-red-600 shadow-inner" : ""}
                          ${!row.isLocked ? "hover:bg-yellow-50 active:shadow-none active:translate-x-0.5 active:translate-y-0.5" : "cursor-not-allowed"}
                        `}
                      >
                        {/* Completed State */}
                        {status === true && (
                          <Zap size={22} fill="black" strokeWidth={1} />
                        )}

                        {/* Missed State (Vibrant Red with X) */}
                        {status === "missed" && (
                          <>
                            <div className="absolute inset-0 bg-red-600" />
                            <X
                              size={28}
                              className="text-white relative z-10 animate-pulse"
                              strokeWidth={5}
                            />
                          </>
                        )}

                        {/* Pending State */}
                        {(status === false || status === null) &&
                          !row.isLocked && (
                            <div className="w-2 h-2 rounded-full bg-black/10" />
                          )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 border-4 border-black bg-red-600 text-white font-black py-2 uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-xs"
          onClick={() => setTimeOffset((prev) => prev + 1000 * 60 * 31)}
        >
          Jump +31 Mins (Trigger Strike)
        </button>
        <button
          className="border-4 border-black bg-white font-black px-4 py-2 uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-xs"
          onClick={() => setTimeOffset(0)}
        >
          Reset
        </button>
      </div>

      {/* Legend & Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="border-4 border-black p-3 bg-[#00FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
          <Zap size={20} fill="black" />
          <span className="text-[10px] font-black mt-1">+15 MOJO</span>
        </div>
        <div className="border-4 border-black p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center opacity-40">
          <div className="w-5 h-5 border-2 border-black border-dashed rounded-full" />
          <span className="text-[10px] font-black mt-1 text-center">
            PENDING
          </span>
        </div>
        <div className="border-4 border-black p-3 bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-white">
          <X size={20} strokeWidth={4} />
          <span className="text-[10px] font-black mt-1">-45 MOJO</span>
        </div>
      </div>

      {/* Bottom Sticky Note */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-black text-white p-3 border-4 border-white shadow-[0_0_20px_rgba(255,0,0,0.3)] z-50">
        <p className="text-[10px] font-black text-center uppercase tracking-widest leading-tight">
          Penalty Ratio: 3x <br />
          <span className="text-[#FFFF00]">
            Mojo is fragile. The Guillotine is absolute.
          </span>
        </p>
      </div>
    </div>
  );
};

export default SlotsPage;
