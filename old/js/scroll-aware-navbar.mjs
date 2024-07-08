let lastScroll = 0;
const navbar = document.querySelector(".navbar");
let navbarHeight = navbar.offsetHeight;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  navbar.style.top = currentScroll > lastScroll ? -navbarHeight + "px" : "0";
  lastScroll = currentScroll;
});

window.addEventListener("resize", () => {
  navbarHeight = navbar.offsetHeight;
});
