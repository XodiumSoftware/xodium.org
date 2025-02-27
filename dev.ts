/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import dev from "$fresh/dev.ts";
import config from "./src/fresh.config.ts";

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts", config);
