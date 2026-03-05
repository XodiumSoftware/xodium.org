import {App, cors, csrf, staticFiles, trailingSlashes} from "fresh";
import {type State} from "./utils.ts";
import githubPlugin from "./plugins/github.ts";
import {redirectMiddleware} from "./middleware/redirects.ts";

export const app = new App<State>();
export const allowedOrigins = (origin: string | null): boolean =>
  origin === "https://xodium.org" || origin?.endsWith(".xodium.org") === true;

app.use(staticFiles());
app.use(redirectMiddleware);
app.use(
  cors({
    origin: (origin) => {
      if (!origin) return null;
      if (origin === "https://xodium.org" || /\.xodium\.org$/.test(origin)) {
        return origin;
      }
      return null;
    },
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.use(
  csrf({
    origin: allowedOrigins,
  }),
);
app.use(trailingSlashes("never"));
githubPlugin(app);
app.fsRoutes();
