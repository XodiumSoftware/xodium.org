// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vueuse/nuxt"],
  compatibilityDate: "2024-09-10",
  ssr: true,
  site: {
    name: "Xodium | Open-Source (CAD) Software Company",
    url: "https://xodium.org",
  },
});
