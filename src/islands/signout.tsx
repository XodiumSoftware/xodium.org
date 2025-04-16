/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {STATUS_CODE} from "$std/http/status.ts";
import {useCallback, useState} from "preact/hooks";

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClick = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch("/sign-out");
      Response.redirect(new URL("/"), STATUS_CODE.Found);
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsSigningOut(false);
    }
  }, [isSigningOut]);

  return (
    <button
      type="button"
      onClick={handleClick}
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      disabled={isSigningOut}
    >
      {isSigningOut ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
