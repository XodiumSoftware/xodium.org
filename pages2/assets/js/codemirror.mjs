// codemirror.mjs
import {
  CM_TARGET,
  CM_INDENT_UNIT,
  CM_INDENT_WITH_TABS,
  CM_LINE_NUMBERS,
  CM_MODE,
  CM_THEME,
  CM_LINE_WRAPPING,
  CM_READ_ONLY,
} from "./constants.mjs";

Array.from(document.getElementsByClassName(CM_TARGET)).forEach((editor) =>
  CodeMirror(editor, {
    indentUnit: CM_INDENT_UNIT,
    indentWithTabs: CM_INDENT_WITH_TABS,
    lineNumbers: CM_LINE_NUMBERS,
    mode: CM_MODE,
    theme: CM_THEME,
    lineWrapping: CM_LINE_WRAPPING,
    readOnly: CM_READ_ONLY,
  })
);
