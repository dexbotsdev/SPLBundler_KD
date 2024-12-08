"server only";

import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
 
export const isAuthorized = async (
  userId: string
)    => {
  

  const result = (await clerkClient()).users.getUser(userId);

  if (!result) {
    return {
      authorized: false,
      message: "User not found",
    };
  }

  const cookieStore = await cookies();
  return {
    authorized: true,
    message: "User   found",
  };
};
