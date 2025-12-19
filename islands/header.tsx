import GithubIcon from "../components/icons/github.tsx";
import WikiIcon from "../components/icons/wiki.tsx";
import {useEffect, useState} from "preact/hooks";

/**
 * Header Component
 *
 * The main navigation header for the application.
 * Includes the site logo, navigation links to key sections,
 * and social media icons in the top right.
 *
 * @component
 * @example
 * // Basic usage
 * <Header />
 *
 * @remarks
 * - Uses DaisyUI's navbar component for responsive layout
 * - Social links open in new tabs with security attributes
 * - Fixed positioning ensures header stays visible while scrolling
 *
 * @styling
 * - Layout: Split between left (logo/nav) and right (social)
 * - Icons: Social icons use 24x24 (w-6 h-6) sizing
 * - Colours: Uses DaisyUI's btn-ghost for transparent buttons
 * - Spacing: Tailwind gap utilities for consistent spacing
 *
 * @accessibility
 * - All interactive elements have appropriate aria-labels
 * - Social icons include aria-hidden="true" on the SVG
 * - External links include rel="noopener noreferrer" for security
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const socialLinks = [
    {
      href: "https://wiki.xodium.org",
      label: "Wiki",
      Icon: WikiIcon,
      isExternal: true,
    },
    {
      href: "https://github.com/XodiumSoftware",
      label: "Github",
      Icon: GithubIcon,
      isExternal: true,
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(globalThis.scrollY > 0);

    globalThis.addEventListener("scroll", handleScroll);
    return () => globalThis.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="top"
      className={`z-20 relative sticky top-0 transition-all duration-300 ${
        isScrolled ? "glass shadow-2xl shadow-black" : "bg-transparent"
      }`}
    >
      <nav className="navbar max-w-7xl mx-auto">
        {/* Left side Header */}
        <div className="navbar-start gap-8">
          <a href="" className="p-0">
            <img
              src="/favicon.svg"
              alt="Xodium Icon"
              className="h-12 w-12"
            />
          </a>
          <a
              href="#projects"
            className="hover:text-primary text-sm font-semibold"
          >
            PROJECTS
          </a>
          <a
              href="#team"
            className="hover:text-primary text-sm font-semibold"
          >
            TEAM
          </a>
        </div>
        {/* Right side Header */}
        <div className="navbar-end">
          <ul className="menu menu-horizontal gap-2">
            {socialLinks.map(({ href, label, Icon, isExternal }) => (
              <li key={href}>
                <a
                  className="hover:text-primary hover:bg-transparent"
                  href={href}
                  aria-label={label}
                  title={label}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
