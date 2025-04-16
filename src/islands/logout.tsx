/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useCallback, useState} from "preact/hooks";

export default function LogOutButton() {
  const [isLoggingOut, setIsLoggedOut] = useState(false);

  const handleClick = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggedOut(true);
    try {
      await fetch("/sign-out");
      globalThis.location.href = "/";
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsLoggedOut(false);
    }
  }, [isLoggingOut]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging Out..." : "Logout"}
    </button>
  );
}
