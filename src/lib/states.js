"use client";
import { cookies } from "next/headers";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function States() {
  const [auth, setAuth] = useState(false);

  return { auth, setAuth };
}

export const pathData = usePathname();

export const tokenData = async () => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");
  return authCookie;
};
