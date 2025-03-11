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
    <a href="#">
      <svg
        viewBox="0 0 14 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-8 h-8 fixed right-2 bottom-0 m-4 text-gray-600 dark:text-slate-400 hover:text-[#CB2D3E] cursor-pointer transition-color"
      >
        <path
          d="M1 7L7 1L13 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </a>
  );
}
