/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {JSX} from "preact";

export default function ChevronRight(
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
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
