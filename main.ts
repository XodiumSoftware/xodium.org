import {App, staticFiles, trailingSlashes} from "fresh";
import {type State} from "./utils.ts";
import githubPlugin from "./plugins/github.ts";

export const app = new App<State>();

app.use(staticFiles());
app.use(trailingSlashes("never"));
githubPlugin(app);
app.fsRoutes();
