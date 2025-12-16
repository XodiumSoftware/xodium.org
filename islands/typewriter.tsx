import {useEffect, useState} from "preact/hooks";

interface TypewriterProps {
  text: string[];
  speed?: number;
  loop?: boolean;
  pause?: number | [number, number];
  unwrite?: boolean;
}

/**
 * Typewriter Component
 *
 * An animated text display component that simulates a typewriter effect.
 * Types out text character by character, with optional deletion animation,
 * looping, and configurable timing.
 *
 * @component
 * @example
 * // Basic typewriter with multiple texts
 * <Typewriter text={["Hello", "World", "Welcome"]} />
 *
 * @example
 * // With unwrite effect and custom speed
 * <Typewriter
 *   text={["Loading...", "Processing...", "Complete!"]}
 *   speed={0.1}
 *   unwrite={true}
 *   loop={true}
 *   pause={[1, 0.5]}
 * />
 *
 * @param {TypewriterProps} props - Component properties
 * @param {string[]} props.text - Array of strings to type out sequentially
 * @param {number} [props.speed=0.05] - Typing speed in seconds per character (0.05 = 50ms)
 * @param {boolean} [props.loop=false] - Whether to loop through texts continuously
 * @param {number | [number, number]} [props.pause=1.5] - Pause duration in seconds
 *   between texts. Can be a single number or [startPause, endPause] array
 * @param {boolean} [props.unwrite=false] - Whether to delete text before moving to next
 */
export default function Typewriter({
  text,
  speed,
  loop,
  pause,
  unwrite,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [letterIndex, setLetterIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const effectiveSpeed = (speed ?? 0.05) * 1000;
  const [startPauseSec, endPauseSec] = Array.isArray(pause)
    ? pause
    : [pause ?? 1.5, pause ?? 1.5];
  const effectiveStartPause = startPauseSec * 1000;
  const effectiveEndPause = endPauseSec * 1000;

  const getDelay = () => effectiveSpeed * (0.85 + Math.random() * 0.3);

  useEffect(() => {
    if (text.length === 0) return;
    const currentText = text[currentWordIndex];

    const nextWord = () => {
      setCurrentWordIndex((prev) => (prev + 1) % text.length);
      setLetterIndex(0);
      setDisplayed("");
    };

    let timer: number;
    if (!isDeleting) {
      if (letterIndex < currentText.length) {
        timer = globalThis.setTimeout(() => {
          setDisplayed(currentText.slice(0, letterIndex + 1));
          setLetterIndex((i) => i + 1);
        }, getDelay());
      } else {
        timer = globalThis.setTimeout(() => {
          if (unwrite) {
            setIsDeleting(true);
          } else if (loop || currentWordIndex < text.length - 1) {
            nextWord();
          }
        }, effectiveStartPause);
      }
    } else {
      if (letterIndex > 0) {
        timer = globalThis.setTimeout(() => {
          setDisplayed(currentText.slice(0, letterIndex - 1));
          setLetterIndex((i) => i - 1);
        }, getDelay());
      } else {
        timer = globalThis.setTimeout(() => {
          setIsDeleting(false);
          if (loop || currentWordIndex < text.length - 1) {
            nextWord();
          }
        }, effectiveEndPause);
      }
    }

    return () => globalThis.clearTimeout(timer);
  }, [
    letterIndex,
    currentWordIndex,
    isDeleting,
    text,
    effectiveSpeed,
    effectiveStartPause,
    effectiveEndPause,
    loop,
    unwrite,
  ]);

  return (
    <div style={{ display: "inline-block" }}>
      {displayed}
      <span className="cursor">|</span>
      <style jsx>
        {`
        .cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}
      </style>
    </div>
  );
}
