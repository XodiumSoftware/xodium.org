import lume from "lume/mod.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import sitemap from "lume/plugins/sitemap.ts";
import robots from "lume/plugins/robots.ts";
import svgo from "lume/plugins/svgo.ts";
import esbuild from "lume/plugins/esbuild.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";

const site = lume();

site.ignore("README.md", "LICENSE.md", "CODE_OF_CONDUCT.md");
site.copyRemainingFiles((path: string) =>
  path.startsWith("") ? path.toLowerCase() : false
);
site.use(lightningCss(/* Options */));
site.use(minifyHTML(/* Options */));
site.use(sitemap(/* Options */));
site.use(robots(/* Options */));
site.use(svgo(/* Options */));
site.use(esbuild(/* Options */));
site.use(tailwindcss(/* Options */));
site.use(postcss(/* Options */));
site.use(sourceMaps(/* Options */));

export default site;
