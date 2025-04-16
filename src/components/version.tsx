/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {CONFIG} from "../utils/constants.ts";

export default function Version() {
  return (
      <div className="fixed bottom-0 m-2 text-gray-600 dark:text-slate-400 text-sm">
      v{CONFIG.version}
    </div>
  );
}
