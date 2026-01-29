import {
  a as a$4,
  b as Typewriter,
  d as define$1,
  H as Header,
  P as ProjectGrid,
  s as s$5,
  T as TeamGrid,
  u as u$7
} from "./server-entry-D1TpNODr.mjs";
import "node:process";

const $$_tpl_1$2 = ['<footer class="footer footer-center text-base-content p-4"><aside class="grid-flow-col items-center"><p class="font-bold">© ', " ", '. Open-Source (CAD) Software Company.</p></aside><nav class="grid grid-flow-col gap-4">', "</nav></footer>"];

function Footer() {
    const homePage = "/";
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const footerLinks = [{
        href: "https://github.com/XodiumSoftware",
        text: "About"
    }, {
        href: "https://www.gnu.org/licenses/agpl-3.0.html",
        text: "Licensing"
    }, {
        href: "mailto:info@xodium.org",
        text: "Contact"
    }];
    return a$4($$_tpl_1$2, s$5(currentYear), u$7("a", {
        href: homePage,
        class: "link link-hover link-primary",
        children: "XODIUM™"
    }), s$5(footerLinks.map((link) => u$7("a", {
        href: link.href,
        class: "link link-hover link-primary",
        target: link.href.startsWith("http") ? "_blank" : void 0,
        rel: link.href.startsWith("http") ? "noopener noreferrer" : void 0,
        children: link.text
    }, link.text))));
}

const $$_tpl_1$1 = ['<div class="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none"></div>'];

function Grid() {
    return a$4($$_tpl_1$1);
}

const $$_tpl_2 = ['Documentation <span aria-hidden="true">→</span>'];
const $$_tpl_1 = ["<div>", '<section id="landing" class="relative isolate px-6 pt-14 lg:px-8 pb-24 sm:pb-32">', '<div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true"><div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-organic-blob"></div></div><div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"><div class="text-center"><h1 class="text-4xl font-bold tracking-tight text-base-content sm:text-6xl">CODING <span class="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">', '</span></h1><p class="mt-6 text-lg leading-8 text-base-content/70">Open-Source <strong class="text-primary">(CAD) </strong>Software Company</p><div class="mt-10 flex items-center justify-center gap-x-6">', "", '</div></div></div><div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]" aria-hidden="true"><div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob"></div></div></section><section id="projects" class="pb-24 sm:pb-32 px-6"><div class="mx-auto max-w-7xl"><div class="max-w-2xl mx-auto text-center mb-12"><h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">Our Projects</h2><p class="mt-6 text-lg leading-8 text-base-content/70">Explore our open-source projects and contributions.</p></div><div>', '</div></div></section><section id="team" class="pb-24 sm:pb-32"><div class="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3"><div class="max-w-2xl"><h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">Meet our team</h2><p class="mt-6 text-lg leading-8 text-base-content/70">No matter the project, our team can handle it.</p></div>', "</div></section>", "</div>"];
const index = define$1.page(() => a$4($$_tpl_1, u$7(Header, null), u$7(Grid, null), u$7(Typewriter, {
    text: ["MODULAR", "STRUCTURED", "EFFICIENT"],
    speed: 0.15,
    loop: true,
    pause: [1, 0],
    unwrite: true
}), u$7("a", {
    href: "https://github.com/XodiumSoftware",
    class: "btn btn-primary hover:btn-warning",
    children: "Get started"
}), u$7("a", {
    href: "https://wiki.xodium.org",
    class: "hover:text-primary",
    children: a$4($$_tpl_2)
}), u$7(ProjectGrid, null), u$7(TeamGrid, null), u$7(Footer, null)));
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___index = index;
export {
    config,
    css,
    _freshRoute___index as default,
    handler,
    handlers
};
