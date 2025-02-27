/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { JSX } from "preact/jsx-runtime";

/**
 * ButtonUp component
 * @returns {JSX.Element} JSX.Element
 */
export default function ButtonUp(): JSX.Element {
  return (
    <a
      href="#"
      class="fixed right-2 bottom-0 m-4 text-gray-600 dark:text-slate-400 hover:text-[#CB2D3E] cursor-pointer transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-14 h-14"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
    </a>
  );
}
