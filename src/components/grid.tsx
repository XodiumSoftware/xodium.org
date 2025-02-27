/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { JSX } from "preact/jsx-runtime";

/**
 * Grid component
 * @returns {JSX.Element} JSX.Element
 */
export default function Grid(): JSX.Element {
  return (
    <div class="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />
  );
}
