import {CONFIG} from "../utils.ts";

export default function Version() {
  return (
    <div className="fixed bottom-0 m-2 text-base-content/60 text-sm">
      v{CONFIG.version}
    </div>
  );
}
