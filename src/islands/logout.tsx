/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {useCallback, useState} from "preact/hooks";
import LogoutIcon from "../components/icons/logout.tsx";

type LogOutButtonProps = {
  className?: string;
};

export default function LogOutButton({ className = "" }: LogOutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleClick = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await fetch("/sign-out", { method: "POST" });
      if (response.ok) {
        globalThis.location.href = "/";
      } else {
        console.error("Sign out failed:", response.statusText);
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);
  const buttonClasses = `${className} ${
    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
  }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClasses}
      disabled={isLoggingOut}
    >
      <LogoutIcon className="w-6 h-6" />
      {isLoggingOut ? "Logging Out..." : "Logout"}
    </button>
  );
}
