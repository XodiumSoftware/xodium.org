/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {VNode} from "preact";
import {CONFIG} from "../utils/constants.ts";

/**
 * Version component
 * @returns {VNode} VNode
 */
export default function Version(): VNode {
  return (
    <div class="fixed bottom-0 m-2 text-gray-600 dark:text-slate-400 text-sm">
      v{CONFIG.version}
    </div>
  );
}
