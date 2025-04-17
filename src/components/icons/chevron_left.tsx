/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {JSX} from "preact";

export default function ChevronLeft(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
