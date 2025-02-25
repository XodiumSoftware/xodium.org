/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Xodium</title>
        <link rel="stylesheet" href="/xodium.custom.css" />
        <link rel="icon" href="/xodium.favicon.svg" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
