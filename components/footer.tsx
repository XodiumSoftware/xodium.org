export default function Footer() {
    const homePage = "/";
    const currentYear = new Date().getFullYear();
    const footerLinks = [
        {href: "https://github.com/XodiumSoftware", text: "About"},
        {href: "https://www.gnu.org/licenses/agpl-3.0.html", text: "Licensing"},
        {href: "mailto:info@xodium.org", text: "Contact"},
    ];

    return (
        <footer>
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm sm:text-center font-bold text-black dark:text-white">
          © {currentYear}&nbsp;
            <a href={homePage} className="hover:underline hover:text-[#CB2D3E]">
            XODIUM™
          </a>. Open-Source (CAD) Software Company.
        </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-black dark:text-white sm:mt-0">
                    {footerLinks.map((link, index) => (
                        <li key={index}>
                            <a
                                href={link.href}
                                className={`hover:underline hover:text-[#CB2D3E] ${
                                    index < footerLinks.length - 1 ? "me-4 md:me-6" : ""
                                }`}
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                rel={link.href.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined}
                            >
                                {link.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}
