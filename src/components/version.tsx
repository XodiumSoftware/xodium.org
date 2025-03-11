/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { JSX } from "preact/jsx-runtime";
import { CONFIG } from "../utils/constants.ts";

/**
 * Version component
 * @returns {JSX.Element} JSX.Element
 */
export default function Version(): JSX.Element {
  return (
    <div class="fixed bottom-0 m-2 text-gray-600 dark:text-slate-400 text-sm">
      v{CONFIG.version}
    </div>
  );
}
