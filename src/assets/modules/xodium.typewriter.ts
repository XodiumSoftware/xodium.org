// xodium.typewriter.ts
import Typewriter from "typewriter";
import {
  T_TARGET,
  T_AUTO_START,
  T_STRINGS,
  T_TYPE_SPEED,
  T_BACK_SPEED,
  T_LOOP,
} from "xodium/constants";

new Typewriter(T_TARGET, {
  autoStart: T_AUTO_START,
  strings: T_STRINGS,
  typeSpeed: T_TYPE_SPEED,
  deleteSpeed: T_BACK_SPEED,
  loop: T_LOOP,
});
