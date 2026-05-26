"use server";

import Session from "@/models/session";
import User from "@/models/user";
import connectDB from "@/app/lib/db";

export async function startSession({ userId, duration, remainingTime }) {
  try {
    await connectDB();

    if (!userId) {
      console.log("No user found in startSession");
      return;
    }

    if (typeof duration !== "number" || typeof remainingTime !== "number") {
      throw new Error("Invalid session times provided to startSession");
    }

    // Convert Clerk userId to MongoDB user _id
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log("User not found in database for clerkId:", userId);
      return;
    }

    const session = await Session.create({
      userId: user._id,
      duration,
      remainingTime,
      status: "RUNNING",
      startedAt: Date.now(),
      lastResumeAt: Date.now(),
    });

    console.log("Session created: ", session);
  } catch (error) {
    console.error("session.action.js: ", error);
    throw error;
  }
}

export async function pauseSession({ userId, lra }) {
  try {
    await connectDB();

    if (!userId) {
      console.log("No user found in pauseSession");
      return;
    }

    // Convert Clerk userId to MongoDB user _id
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.log("User not found in database for clerkId:", userId);
      return;
    }

    const pausedSession = await Session.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        $set: {
          lastResumeAt: Date.now() - lra,
          status: "PAUSED",
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!pausedSession) return;

    console.log("Paused Session: \n", pausedSession);
  } catch (error) {
    console.error("session.action.js pauseSession: ", error);
    throw error;
  }
}
