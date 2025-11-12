import {defineConfig} from "vite";
import {fresh} from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [fresh(), tailwindcss()],
});
