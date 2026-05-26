"use server";

import connectDB from "@/app/lib/db";
import User from "@/models/user";
import { currentUser, auth } from "@clerk/nextjs/server";

export async function getUserId() {
  const { userId } = await auth();

  if (!userId) return;

  await connectDB();

  const user = await User.findOne({
    clerkId: userId,
  });

  if (!user) return;

  return user._id;
}

export async function syncUser(userId) {
  try {
    console.log("[syncUser] Starting user sync for:", userId);

    if (!userId) {
      console.log("[syncUser] No userId provided");
      return;
    }

    await connectDB();

    const existingUser = await User.findOne({
      clerkId: userId,
    });

    if (existingUser) {
      console.log("[syncUser] User exists, updating:", existingUser._id);
      await User.findByIdAndUpdate(existingUser._id, {
        clerkId: userId,
      });
      console.log("[syncUser] User updated successfully");
      return;
    }

    console.log("[syncUser] User not found, creating new user...");
    await User.create({
      clerkId: userId,
      email: "",
      status: "STABLE",
    });

    console.log("[syncUser] New user created");
    return;
  } catch (error) {
    console.error("[syncUser] Error:", error);
    return;
  }
}
