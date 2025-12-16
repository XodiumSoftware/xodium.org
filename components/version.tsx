import {CONFIG} from "../utils.ts";

/**
 * Version Component
 *
 * A fixed-position component that displays the current application version.
 * Useful for development, debugging, and ensuring users know which version they're running.
 *
 * @component
 * @example
 * // Place in your main layout
 * function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <Version />
 *     </>
 *   );
 * }
 *
 * @dependencies
 * - Requires `CONFIG` object with `version` property from "../utils.ts"
 * - Uses Tailwind CSS for styling
 *
 * @styling
 * - Position: Fixed at bottom-left corner
 * - Text: Small, with 60% opacity using theme colours
 * - Margin: 2 units (m-2)
 *
 * @note
 * The version string should follow semantic versioning (e.g., "1.0.0", "2.1.3")
 * Consider removing or hiding this component in production builds.
 */
export default function Version() {
  return (
    <div className="fixed bottom-0 m-2 text-base-content/60 text-sm">
      v{CONFIG.version}
    </div>
  );
}
