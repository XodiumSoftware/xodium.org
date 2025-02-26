import { useEffect, useState } from "preact/hooks";

export interface TypewriterProps {
  text: string[];
  speed?: number;
  loop?: boolean;
  pause?: number;
  unwrite?: boolean;
}

export default function Typewriter({
  text,
  speed,
  loop,
  pause,
  unwrite,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState<string>("");
  const [letterIndex, setLetterIndex] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (text.length === 0) return;
    const currentText = text[currentWordIndex];

    let timer: number;

    if (!isDeleting) {
      if (letterIndex < currentText.length) {
        timer = globalThis.setTimeout(() => {
          setDisplayed(currentText.slice(0, letterIndex + 1));
          setLetterIndex(letterIndex + 1);
        }, speed);
      } else {
        if (unwrite) {
          timer = globalThis.setTimeout(() => {
            setIsDeleting(true);
          }, pause);
        } else {
          if (currentWordIndex === text.length - 1 && !loop) return;
          timer = globalThis.setTimeout(() => {
            const nextIndex = (currentWordIndex + 1) % text.length;
            setCurrentWordIndex(nextIndex);
            setLetterIndex(0);
            setDisplayed("");
          }, pause);
        }
      }
    } else {
      if (letterIndex > 0) {
        timer = globalThis.setTimeout(() => {
          setDisplayed(currentText.slice(0, letterIndex - 1));
          setLetterIndex(letterIndex - 1);
        }, speed);
      } else {
        setIsDeleting(false);
        if (currentWordIndex === text.length - 1 && !loop) {
          return;
        }
        timer = globalThis.setTimeout(() => {
          const nextIndex = (currentWordIndex + 1) % text.length;
          setCurrentWordIndex(nextIndex);
          setLetterIndex(0);
        }, pause);
      }
    }

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [
    letterIndex,
    currentWordIndex,
    isDeleting,
    text,
    speed,
    loop,
    pause,
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
