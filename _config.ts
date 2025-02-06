/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import lume from "lume/mod.ts";

import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import sitemap from "lume/plugins/sitemap.ts";
import robots from "lume/plugins/robots.ts";
import svgo from "lume/plugins/svgo.ts";
import esbuild from "lume/plugins/esbuild.ts";
import sourceMaps from "lume/plugins/source_maps.ts";

const site = lume({ src: "src", location: new URL("https://xodium.org/") });

site.data("version", "v1.0.2");
site.ignore(
  "README.md",
  "LICENSE.md",
  "CODE_OF_CONDUCT.md",
  (path: string) =>
    path.includes(".test.") ||
    (path.endsWith(".ts") && !path.endsWith("index.ts"))
);
site.copyRemainingFiles((path: string) =>
  path.startsWith("") ? path.toLowerCase() : false
);
site.use(
  tailwindcss({
    extensions: [".html", ".ts", ".css"],
    options: {
      safelist: [
        "mb-4",
        "flex",
        "items-center",
        "gap-x-6",
        "h-16",
        "w-16",
        "rounded-full",
        "hover:underline",
        "text-base",
        "font-semibold",
        "leading-7",
        "tracking-tight",
        "text-gray-900",
        "dark:text-slate-100",
      ],
    },
  })
);
site.use(postcss());
site.use(lightningCss());
site.use(minifyHTML());
site.use(sitemap());
site.use(robots());
site.use(svgo());
site.use(esbuild());
site.use(sourceMaps());

export default site;
