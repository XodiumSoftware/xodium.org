import {App, csp, csrf, staticFiles, trailingSlashes} from "fresh";
import {type State} from "./utils.ts";
import githubPlugin from "./plugins/github.ts";

export const app = new App<State>();
export const allowedOrigins = (origin: string | null): boolean =>
  origin === "https://xodium.org" || origin?.endsWith(".xodium.org") === true;

app.use(staticFiles());
app.use(
  csrf({
    origin: allowedOrigins,
  }),
);
app.use(csp({
  reportOnly: false,
  reportTo: "/api/csp",
  csp: [
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
  ],
}));
app.use(trailingSlashes("never"));
githubPlugin(app);
app.fsRoutes();
