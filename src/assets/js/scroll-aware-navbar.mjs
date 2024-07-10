var lastScrollTop = 0;
var navbar = document.querySelector(".navbar");
var navbarHeight = navbar.offsetHeight;

window.addEventListener("scroll", function () {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop) {
    navbar.style.top = -navbarHeight + "px";
  } else {
    navbar.style.top = "0";
  }
  lastScrollTop = scrollTop;
});

window.addEventListener("resize", function () {
  navbarHeight = navbar.offsetHeight;
});
