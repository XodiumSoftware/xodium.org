// illyrion.autotype.ts

import Typed from "typed.js";

import {
  AT_TARGET,
  AT_STRINGS,
  AT_TYPE_SPEED,
  AT_BACK_SPEED,
  AT_LOOP,
} from "./illyrion.constants";

new Typed(AT_TARGET, {
  strings: AT_STRINGS,
  typeSpeed: AT_TYPE_SPEED,
  backSpeed: AT_BACK_SPEED,
  loop: AT_LOOP,
});
