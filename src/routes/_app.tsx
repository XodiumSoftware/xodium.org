/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {type PageProps} from "$fresh/server.ts";
import Version from "../components/version.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Xodium</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="bg-slate-100 dark:bg-slate-900 font-mono">
        <Component />
        <Version />
      </body>
    </html>
  );
}
