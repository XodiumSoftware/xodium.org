/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {defineConfig} from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import securityHeaders from "./plugins/security_headers.ts";
import github from "./plugins/github.ts";

export default defineConfig({
  plugins: [tailwind(), github, securityHeaders],
});
