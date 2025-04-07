/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {FreshContext} from "$fresh/server.ts";
import {authMiddleware, State} from "./middlewares/auth.ts";

export const handler = [authMiddleware];

export type AppContext = FreshContext<State>;
