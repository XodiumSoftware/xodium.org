import lume from "lume/mod.ts";

const site = lume();

site.ignore("README.md", "LICENSE.md", "CODE_OF_CONDUCT.md");
site.copyRemainingFiles((path: string) =>
  path.startsWith("") ? path.toLowerCase() : false
);

site.loadAssets([".css"]);

function minifyCSS(css: string) {
  return css
    .replaceAll("\n", " ")
    .replaceAll(/\s+/g, " ")
    .replaceAll(/([:;{])\s/g, "$1");
}

site.process([".css"], (assets) => {
  for (const asset of assets) {
    asset.content = minifyCSS(asset.content as string);
  }
});

export default site;
