import GithubIcon from "./icons/github.tsx";
import WikiIcon from "./icons/wiki.tsx";

export default function Header() {
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
  return (
    <header id="top" className="z-20 relative">
      <nav className="navbar max-w-7xl mx-auto">
        {/* Left side Header */}
        <div className="navbar-start gap-8">
          <a href="" className="btn btn-ghost p-0">
            <img
              src="/favicon.svg"
              alt="Xodium Icon"
              className="h-12 w-12"
            />
          </a>
          <a
            href="/#projects"
            className="btn btn-ghost text-sm font-semibold"
          >
            PROJECTS
          </a>
          <a
            href="/#team"
            className="btn btn-ghost text-sm font-semibold"
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
                  className="btn btn-ghost btn-circle"
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
