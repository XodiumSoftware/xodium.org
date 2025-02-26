/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import * as TypewriterModule from "typewriter";
const Typewriter = TypewriterModule.default ?? TypewriterModule;
import {
  T_AUTO_START,
  T_BACK_SPEED,
  T_LOOP,
  T_STRINGS,
  T_TARGET,
  T_TYPE_SPEED,
} from "xodium/constants";

Typewriter(T_TARGET, {
  autoStart: T_AUTO_START,
  strings: T_STRINGS,
  typeSpeed: T_TYPE_SPEED,
  deleteSpeed: T_BACK_SPEED,
  loop: T_LOOP,
});
