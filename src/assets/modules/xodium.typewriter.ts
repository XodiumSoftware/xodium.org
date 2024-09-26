// xodium.typewriter.ts
import Typewriter from "https://unpkg.com/typewriter-effect@2.21.0/dist/core.js";
import {
  T_TARGET,
  T_STRINGS,
  T_TYPE_SPEED,
  T_BACK_SPEED,
  T_LOOP,
} from "./xodium.constants.ts";

document.addEventListener("DOMContentLoaded", () => {
  new Typewriter(T_TARGET, {
    strings: T_STRINGS,
    typeSpeed: T_TYPE_SPEED,
    backSpeed: T_BACK_SPEED,
    loop: T_LOOP,
  });
});
