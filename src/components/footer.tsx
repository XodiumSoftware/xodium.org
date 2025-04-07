/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {JSX} from "preact/jsx-runtime";

/**
 * Footer component
 * @returns {JSX.Element} JSX.Element
 */
export default function Footer(): JSX.Element {
  return (
    <footer>
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm sm:text-center font-bold text-black dark:text-white">
          © 2024&nbsp;
          <a href="/" className="hover:underline hover:text-[#CB2D3E]">
            XODIUM™
          </a>. Open-Source (CAD) Software Company.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-black dark:text-white sm:mt-0">
          <li>
            <a
              href="https://github.com/XodiumSoftware"
              className="hover:underline me-4 md:me-6 hover:text-[#CB2D3E]"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              className="hover:underline me-4 md:me-6 hover:text-[#CB2D3E]"
            >
              Licensing
            </a>
          </li>
          <li>
            <a
              href="mailto:info@xodium.org"
              className="hover:underline hover:text-[#CB2D3E]"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
