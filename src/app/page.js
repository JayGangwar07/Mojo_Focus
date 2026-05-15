import { syncUser } from "@/actions/user.action";
import connectDB from "./lib/db";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default async function Home() {
  await connectDB();
  await syncUser()
    .then((createdUser) => {
      console.log("User synced: ", createdUser);
    })
    .catch((err) => console.log("Couldnt find created User"));

  return (
    <>
      <Link href="/dashboard" prefetch={false}>
        Go to Dashboard
      </Link>
      {/*show sign in or account*/}
      <SignInButton />
      <UserButton />
    </>
  );
}
