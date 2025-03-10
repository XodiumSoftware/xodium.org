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
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-14 h-14"
        viewBox="0 0 24 24"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        </g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M6 15L12 9L18 15"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
          </path>
        </g>
      </svg>
    </a>
  );
}
