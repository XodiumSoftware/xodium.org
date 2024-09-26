import lume from "lume/mod.ts";

const site = lume();

site.ignore("README.md", "LICENSE.md", "CODE_OF_CONDUCT.md");

export default site;
