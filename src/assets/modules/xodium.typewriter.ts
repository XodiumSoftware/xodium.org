/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import Typewriter from "typewriter";
import {T_AUTO_START, T_BACK_SPEED, T_LOOP, T_STRINGS, T_TARGET, T_TYPE_SPEED,} from "xodium/constants";

new Typewriter(T_TARGET, {
  autoStart: T_AUTO_START,
  strings: T_STRINGS,
  typeSpeed: T_TYPE_SPEED,
  deleteSpeed: T_BACK_SPEED,
  loop: T_LOOP,
});
