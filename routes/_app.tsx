import Version from "../components/version.tsx";
import {define} from "../utils.ts";

// noinspection JSUnusedGlobalSymbols
export default define.page(function App({ Component }) {
  return (
    <html data-theme="halloween">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Xodium</title>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="bg-base-100 font-mono">
        <Component />
        <Version />
      </body>
    </html>
  );
});
