// xodium.index.ts
// External modules
// ts
import Bulma from "@vizuaalog/bulmajs";
import Bulma_tooltip from "@creativebulma/bulma-tooltip";
// Internal modules
// scss
import "../scss/xodium.custom.scss";
// ts
import "./xodium.typed";
import "./xodium.utils";
import "./xodium.utils.github";

document.addEventListener("DOMContentLoaded", () => {
  Bulma.init();
  Bulma_tooltip.init();
});
