import User from "@/models/user";
import { currentUser, auth } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();

    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await User.findOne({
      $or: [
        { clerkId: userId },
        { email: user.emailAddresses[0].emailAddress },
      ],
    });

    console.log(existingUser);

    if (existingUser) return existingUser;

    const createdUser = await User.create({
      clerkId: userId,
      name: `${user.firstName || ""} ${user.lastName || ""}`,
      username:
        user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    });

    return createdUser;
  } catch (err) {
    console.log("Error in syncUser: ", err);
  }
}
