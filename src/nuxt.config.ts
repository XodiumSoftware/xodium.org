// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  ssr: false,
  modules: ["@nuxtjs/color-mode", "@vueuse/nuxt"],
  site: {
    url: "https://xodium.org",
    name: "Xodium | Open-Source (CAD) Software Company",
  },
});
