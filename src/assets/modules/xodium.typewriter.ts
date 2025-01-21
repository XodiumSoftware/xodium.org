/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import Typewriter from "typewriter";

const T_TARGET: string = ".typewriter";
const T_AUTO_START: boolean = true;
const T_STRINGS: string[] = ["MODULAR", "STRUCTURED", "EFFICIENT"];
const T_TYPE_SPEED: number = 150;
const T_BACK_SPEED: string | number = "natural";
const T_LOOP: boolean = true;

new Typewriter(T_TARGET, {
  autoStart: T_AUTO_START,
  strings: T_STRINGS,
  typeSpeed: T_TYPE_SPEED,
  deleteSpeed: T_BACK_SPEED,
  loop: T_LOOP,
});
