export default function Footer() {
  const homePage = "/";
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    { href: "https://github.com/XodiumSoftware", text: "About" },
    { href: "https://www.gnu.org/licenses/agpl-3.0.html", text: "Licensing" },
    { href: "mailto:info@xodium.org", text: "Contact" },
  ];

  return (
    <footer className="footer footer-center text-base-content p-4">
      <aside className="grid-flow-col items-center">
        <p className="font-bold">
          © {currentYear}{" "}
          <a href={homePage} className="link link-hover link-primary">
            XODIUM™
          </a>
          . Open-Source (CAD) Software Company.
        </p>
      </aside>
      <nav className="grid grid-flow-col gap-4">
        {footerLinks.map((link) => (
          <a
            key={link.text}
            href={link.href}
            className="link link-hover link-primary"
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http")
              ? "noopener noreferrer"
              : undefined}
          >
            {link.text}
          </a>
        ))}
      </nav>
    </footer>
  );
}
