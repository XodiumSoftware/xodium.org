/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useCallback, useState} from "preact/hooks";

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClick = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch("/sign-out");
      globalThis.location.href = "/";
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
