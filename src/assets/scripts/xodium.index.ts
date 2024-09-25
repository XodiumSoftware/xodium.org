// xodium.index.ts
// External modules
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
// Internal modules
import "../styles/xodium.custom.css";
import "./xodium.typed";
import "./xodium.utils";
import "./xodium.utils.github";

library.add(fas, fab);
dom.watch();
