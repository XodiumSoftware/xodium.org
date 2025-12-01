import {App, staticFiles} from "fresh";
import {type State} from "./utils.ts";
import githubPlugin from "./plugins/github.ts";

export const app = new App<State>();

app.use(staticFiles());
githubPlugin(app);
app.fsRoutes();
