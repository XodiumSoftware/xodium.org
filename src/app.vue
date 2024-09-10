<script setup lang="ts">
useHead({
  title: "Xodium | Open-Source (CAD) Software Company",
  meta: [
    {
      name: "description",
      content:
        "Pioneering the future of engineering with innovative design and sustainable solutions.",
    },
    {
      property: "og:title",
      content: "Xodium | Open-Source (CAD) Software Company",
    },
    {
      property: "og:description",
      content:
        "Pioneering the future of engineering with innovative design and sustainable solutions.",
    },
    { property: "og:image", content: "/favicon.svg" },
    { property: "og:url", content: "https://www.xodium.org" },
    {
      name: "twitter:title",
      content: "Xodium | Open-Source (CAD) Software Company",
    },
    {
      name: "twitter:description",
      content:
        "Pioneering the future of engineering with innovative design and sustainable solutions.",
    },
    { name: "twitter:image", content: "/favicon.svg" },
    { name: "twitter:card", content: "summary" },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  htmlAttrs: {
    lang: "en",
  },
});
</script>

<template>
  <UContainer>
    <UCard class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1>Welcome to Nuxt UI Starter</h1>
          <ColorScheme
            ><USelect
              v-model="$colorMode.preference"
              :options="['system', 'light', 'dark']"
          /></ColorScheme>
        </div>
      </template>
      <UButton
        icon="i-heroicons-book-open"
        to="https://ui.nuxt.com"
        target="_blank"
        >Open Nuxt UI Documentation</UButton
      >
    </UCard>
  </UContainer>
</template>
