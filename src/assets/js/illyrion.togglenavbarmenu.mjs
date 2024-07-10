// illyrion.togglenavbarmenu.mjs

function initializeNavbarBurgers() {
  const $navbarBurgers = Array.from(
    document.querySelectorAll(".navbar-burger")
  );

  $navbarBurgers.forEach((el) => {
    if (!el.dataset.initialized) {
      el.addEventListener("click", () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });

      el.dataset.initialized = true;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavbarBurgers();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        initializeNavbarBurgers();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
