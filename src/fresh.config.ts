/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {defineConfig} from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import oauth from "./plugins/oauth.ts";
import securityHeaders from "./plugins/security_headers.ts";

export default defineConfig({ plugins: [tailwind(), oauth, securityHeaders] });
