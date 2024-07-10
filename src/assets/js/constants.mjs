// constants.mjs

// AutoType
export const AT_TARGET = ".autotype";
export const AT_STRINGS = ["MODULAR", "STRUCTURED", "EFFICIENT"];
export const AT_TYPE_SPEED = 150;
export const AT_BACK_SPEED = 100;
export const AT_LOOP = true;

// CodeMirror
export const CM_TARGET = "editor";
export const CM_INDENT_UNIT = 4;
export const CM_INDENT_WITH_TABS = true;
export const CM_LINE_NUMBERS = true;
export const CM_MODE = "python";
export const CM_THEME = "monokai";
export const CM_LINE_WRAPPING = true;
export const CM_READ_ONLY = true;

// ComponentsLoader
export const COMPONENTS = "../components/";
export const COMPONENTS_PLACEHOLDER = "-placeholder";
export const COMPONENTS_MAP = {
  header: `${COMPONENTS}header.html`,
  footer: `${COMPONENTS}footer.html`,
};
