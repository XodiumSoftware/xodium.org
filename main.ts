import {App, csp, staticFiles, trailingSlashes} from "fresh";
import {type State} from "./utils.ts";
import githubPlugin from "./plugins/github.ts";

export const app = new App<State>();

app.use(staticFiles());
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
