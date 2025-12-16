import {ComponentChildren} from "preact";

/**
 * ButtonPrimary Component
 *
 * A customizable primary button component that renders as an anchor link.
 *
 * @component
 * @example
 * // Basic usage
 * <ButtonPrimary href="/projects">View Projects</ButtonPrimary>
 *
 * @example
 * // With icon
 * <ButtonPrimary href="/contact">
 *   <EnvelopeIcon className="w-5 h-5 mr-2" />
 *   Contact Us
 * </ButtonPrimary>
 */
export default function ButtonPrimary({
  children,
  href,
}: {
  children: ComponentChildren;
  href: string;
}) {
  return (
    <a
      href={href}
      className="px-4 py-2 text-base-content hover:bg-base-200/50 rounded-btn"
    >
      {children}
    </a>
  );
}
