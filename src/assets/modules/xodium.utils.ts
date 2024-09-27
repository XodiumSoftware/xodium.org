// xodium.utils.ts
const toolsButton = document.getElementById("tools-button");
const toolsMenu = document.getElementById("tools-menu");

if (toolsButton && toolsMenu) {
  toolsButton.addEventListener("click", () => {
    toolsMenu.classList.toggle("hidden");
  });
}
