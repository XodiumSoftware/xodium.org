import {defineConfig} from "vite";
import {fresh} from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import {cloudflare} from "npm:@cloudflare/vite-plugin@1.22.0"; // noinspection JSUnusedGlobalSymbols

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [fresh(), tailwindcss(), cloudflare()],
});
