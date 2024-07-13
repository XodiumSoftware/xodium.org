// illyrion.autotype.ts

import Typed from "typed.js";

import {
  T_TARGET,
  T_STRINGS,
  T_TYPE_SPEED,
  T_BACK_SPEED,
  T_LOOP,
} from "./illyrion.constants.js";

new Typed(T_TARGET, {
  strings: T_STRINGS,
  typeSpeed: T_TYPE_SPEED,
  backSpeed: T_BACK_SPEED,
  loop: T_LOOP,
});
