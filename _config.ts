import lume from "lume/mod.ts";

const site = lume();

site.ignore("README.md", "LICENSE.md", "CODE_OF_CONDUCT.md");
site.copyRemainingFiles((path: string) =>
  path.startsWith("") ? path.toLowerCase() : false
);

export default site;
