import __Process$ from "node:process";

var __defProp = Object.defineProperty;
var __typeError = (msg) => {
    throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
    enumerable: true,
    configurable: true,
    writable: true,
    value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _internal, _buildCache, _additionalStyles, _getBuildCache, _commands, _onError, _a;

function checkWindows() {
    const global2 = globalThis;
    const os = global2.Deno?.build?.os;
    return typeof os === "string" ? os === "windows" : global2.navigator?.platform?.startsWith("Win") ?? global2.process?.platform?.startsWith("win") ?? false;
}

const isWindows = checkWindows();

function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
    }
}

function assertArg$1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol !== "file:") {
        throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
    }
    return url;
}

function fromFileUrl$2(url) {
    url = assertArg$1(url);
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}

const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;

function isPosixPathSeparator(code2) {
    return code2 === CHAR_FORWARD_SLASH;
}

function isPathSeparator(code2) {
    return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}

function isWindowsDeviceRoot(code2) {
    return code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z || code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z;
}

function fromFileUrl$1(url) {
    url = assertArg$1(url);
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname !== "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}

function fromFileUrl(url) {
    return isWindows ? fromFileUrl$1(url) : fromFileUrl$2(url);
}

function isAbsolute$2(path) {
    assertPath(path);
    return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}

function isAbsolute$1(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code2 = path.charCodeAt(0);
    if (isPathSeparator(code2)) {
        return true;
    } else if (isWindowsDeviceRoot(code2)) {
        if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}

function isAbsolute(path) {
    return isWindows ? isAbsolute$1(path) : isAbsolute$2(path);
}

function assertArg(path) {
    assertPath(path);
    if (path.length === 0) return ".";
}

function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code2;
    for (let i2 = 0; i2 <= path.length; ++i2) {
        if (i2 < path.length) code2 = path.charCodeAt(i2);
        else if (isPathSeparator2(code2)) break;
        else code2 = CHAR_FORWARD_SLASH;
        if (isPathSeparator2(code2)) {
            if (lastSlash === i2 - 1 || dots === 1) ;
            else if (lastSlash !== i2 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i2;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
                else res = path.slice(lastSlash + 1, i2);
                lastSegmentLength = i2 - lastSlash - 1;
            }
            lastSlash = i2;
            dots = 0;
        } else if (code2 === CHAR_DOT && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}

function normalize$1(path) {
    if (path instanceof URL) {
        path = fromFileUrl$2(path);
    }
    assertArg(path);
    const isAbsolute2 = isPosixPathSeparator(path.charCodeAt(0));
    const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
    path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute2) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute2) return `/${path}`;
    return path;
}

function join$2(path, ...paths) {
    if (path === void 0) return ".";
    if (path instanceof URL) {
        path = fromFileUrl$2(path);
    }
    paths = path ? [path, ...paths] : paths;
    paths.forEach((path2) => assertPath(path2));
    const joined = paths.filter((path2) => path2.length > 0).join("/");
    return joined === "" ? "." : normalize$1(joined);
}

function normalize(path) {
    if (path instanceof URL) {
        path = fromFileUrl$1(path);
    }
    assertArg(path);
    const len = path.length;
    let rootEnd = 0;
    let device;
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code2)) {
            isAbsolute2 = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j2 = 2;
                let last = j2;
                for (; j2 < len; ++j2) {
                    if (isPathSeparator(path.charCodeAt(j2))) break;
                }
                if (j2 < len && j2 !== last) {
                    const firstPart = path.slice(last, j2);
                    last = j2;
                    for (; j2 < len; ++j2) {
                        if (!isPathSeparator(path.charCodeAt(j2))) break;
                    }
                    if (j2 < len && j2 !== last) {
                        last = j2;
                        for (; j2 < len; ++j2) {
                            if (isPathSeparator(path.charCodeAt(j2))) break;
                        }
                        if (j2 === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j2 !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                            rootEnd = j2;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code2)) {
            if (path.charCodeAt(1) === CHAR_COLON) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute2 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code2)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute2) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === void 0) {
        if (isAbsolute2) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        }
        return tail;
    } else if (isAbsolute2) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    }
    return device + tail;
}

function join$1(path, ...paths) {
    if (path instanceof URL) {
        path = fromFileUrl$1(path);
    }
    paths = path ? [path, ...paths] : paths;
    paths.forEach((path2) => assertPath(path2));
    paths = paths.filter((path2) => path2.length > 0);
    if (paths.length === 0) return ".";
    let needsReplace = true;
    let slashCount = 0;
    const firstPart = paths[0];
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    let joined = paths.join("\\");
    if (needsReplace) {
        for (; slashCount < joined.length; ++slashCount) {
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}

function join(path, ...paths) {
    return isWindows ? join$1(path, ...paths) : join$2(path, ...paths);
}

function resolve$1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
        let path;
        if (i2 >= 0) path = pathSegments[i2];
        else {
            const {
                Deno: Deno2
            } = globalThis;
            if (typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a current working directory (CWD)");
            }
            path = Deno2.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}

function assertArgs(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
}

function relative$2(from, to) {
    assertArgs(from, to);
    from = resolve$1(from);
    to = resolve$1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for (; fromStart < fromEnd; ++fromStart) {
        if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for (; toStart < toEnd; ++toStart) {
        if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for (; i2 <= length; ++i2) {
        if (i2 === length) {
            if (toLen > length) {
                if (isPosixPathSeparator(to.charCodeAt(toStart + i2))) {
                    return to.slice(toStart + i2 + 1);
                } else if (i2 === 0) {
                    return to.slice(toStart + i2);
                }
            } else if (fromLen > length) {
                if (isPosixPathSeparator(from.charCodeAt(fromStart + i2))) {
                    lastCommonSep = i2;
                } else if (i2 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (isPosixPathSeparator(fromCode)) lastCommonSep = i2;
    }
    let out = "";
    for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
        if (i2 === fromEnd || isPosixPathSeparator(from.charCodeAt(i2))) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
        return to.slice(toStart);
    }
}

function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
        let path;
        const {
            Deno: Deno2
        } = globalThis;
        if (i2 >= 0) {
            path = pathSegments[i2];
        } else if (!resolvedDevice) {
            if (typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a current working directory (CWD)");
            }
            path = Deno2.cwd();
        } else {
            if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a current working directory (CWD)");
            }
            path = Deno2.cwd();
            if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute2 = false;
        const code2 = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code2)) {
                isAbsolute2 = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j2 = 2;
                    let last = j2;
                    for (; j2 < len; ++j2) {
                        if (isPathSeparator(path.charCodeAt(j2))) break;
                    }
                    if (j2 < len && j2 !== last) {
                        const firstPart = path.slice(last, j2);
                        last = j2;
                        for (; j2 < len; ++j2) {
                            if (!isPathSeparator(path.charCodeAt(j2))) break;
                        }
                        if (j2 < len && j2 !== last) {
                            last = j2;
                            for (; j2 < len; ++j2) {
                                if (isPathSeparator(path.charCodeAt(j2))) break;
                            }
                            if (j2 === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j2;
                            } else if (j2 !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                                rootEnd = j2;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code2)) {
                if (path.charCodeAt(1) === CHAR_COLON) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute2 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code2)) {
            rootEnd = 1;
            isAbsolute2 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute2;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}

function relative$1(from, to) {
    assertArgs(from, to);
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for (; fromStart < fromEnd; ++fromStart) {
        if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
    }
    for (; fromEnd - 1 > fromStart; --fromEnd) {
        if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for (; toStart < toEnd; ++toStart) {
        if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
    }
    for (; toEnd - 1 > toStart; --toEnd) {
        if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i2 = 0;
    for (; i2 <= length; ++i2) {
        if (i2 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH) {
                    return toOrig.slice(toStart + i2 + 1);
                } else if (i2 === 2) {
                    return toOrig.slice(toStart + i2);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH) {
                    lastCommonSep = i2;
                } else if (i2 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i2);
        const toCode = to.charCodeAt(toStart + i2);
        if (fromCode !== toCode) break;
        else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i2;
    }
    if (i2 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
        if (i2 === fromEnd || from.charCodeAt(i2) === CHAR_BACKWARD_SLASH) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}

function relative(from, to) {
    return isWindows ? relative$1(from, to) : relative$2(from, to);
}

var exports$M = {};
Object.defineProperty(exports$M, "__esModule", {
    value: true
});
Object.defineProperty(exports$M, "__esModule", {
    value: true
});
exports$M.VERSION = void 0;
exports$M.VERSION = "1.9.0";
var _VERSION = exports$M.VERSION;
const _default$K = exports$M.default ?? exports$M;
var __require$J = exports$M;
var __esModule$J = exports$M.__esModule;
const _mod2$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    VERSION: _VERSION,
    __esModule: __esModule$J,
    __require: __require$J,
    default: _default$K
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$L = {};
Object.defineProperty(exports$L, "__esModule", {
    value: true
});
Object.defineProperty(exports$L, "__esModule", {
    value: true
});
const version_1$1 = __require$J ?? _default$K ?? _mod2$6;
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;

function _makeCompatibilityCheck(ownVersion) {
    const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
    const rejectedVersions = /* @__PURE__ */ new Set();
    const myVersionMatch = ownVersion.match(re);
    if (!myVersionMatch) {
        return () => false;
    }
    const ownVersionParsed = {
        major: +myVersionMatch[1],
        minor: +myVersionMatch[2],
        patch: +myVersionMatch[3],
        prerelease: myVersionMatch[4]
    };
    if (ownVersionParsed.prerelease != null) {
        return function isExactmatch(globalVersion) {
            return globalVersion === ownVersion;
        };
    }

    function _reject(v2) {
        rejectedVersions.add(v2);
        return false;
    }

    function _accept(v2) {
        acceptedVersions.add(v2);
        return true;
    }

    return function isCompatible(globalVersion) {
        if (acceptedVersions.has(globalVersion)) {
            return true;
        }
        if (rejectedVersions.has(globalVersion)) {
            return false;
        }
        const globalVersionMatch = globalVersion.match(re);
        if (!globalVersionMatch) {
            return _reject(globalVersion);
        }
        const globalVersionParsed = {
            major: +globalVersionMatch[1],
            minor: +globalVersionMatch[2],
            patch: +globalVersionMatch[3],
            prerelease: globalVersionMatch[4]
        };
        if (globalVersionParsed.prerelease != null) {
            return _reject(globalVersion);
        }
        if (ownVersionParsed.major !== globalVersionParsed.major) {
            return _reject(globalVersion);
        }
        if (ownVersionParsed.major === 0) {
            if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
                return _accept(globalVersion);
            }
            return _reject(globalVersion);
        }
        if (ownVersionParsed.minor <= globalVersionParsed.minor) {
            return _accept(globalVersion);
        }
        return _reject(globalVersion);
    };
}

exports$L._makeCompatibilityCheck = _makeCompatibilityCheck;
exports$L.isCompatible = _makeCompatibilityCheck(version_1$1.VERSION);
var _makeCompatibilityCheck2 = exports$L._makeCompatibilityCheck;
var _isCompatible = exports$L.isCompatible;
const _default$J = exports$L.default ?? exports$L;
var __require$I = exports$L;
var __esModule$I = exports$L.__esModule;
const _mod3$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$I,
    __require: __require$I,
    _makeCompatibilityCheck: _makeCompatibilityCheck2,
    default: _default$J,
    isCompatible: _isCompatible
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$K = {};
Object.defineProperty(exports$K, "__esModule", {
    value: true
});
Object.defineProperty(exports$K, "__esModule", {
    value: true
});
exports$K._globalThis = void 0;
exports$K._globalThis = typeof globalThis === "object" ? globalThis : global;
var _globalThis = exports$K._globalThis;
const _default$I = exports$K.default ?? exports$K;
var __require$H = exports$K;
var __esModule$H = exports$K.__esModule;
const _ns$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$H,
    __require: __require$H,
    _globalThis,
    default: _default$I
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$J = {};
Object.defineProperty(exports$J, "__esModule", {
    value: true
});
Object.defineProperty(exports$J, "__esModule", {
    value: true
});
const _default$H = exports$J.default ?? exports$J;
for (var _k$1 in _ns$1) if (_k$1 !== "default" && _k$1 !== "__esModule" && Object.prototype.hasOwnProperty.call(_ns$1, _k$1)) _default$H[_k$1] = _ns$1[_k$1];
var __require$G = exports$J;
var __esModule$G = exports$J.__esModule;
const _ns = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$G,
    __require: __require$G,
    _globalThis,
    default: _default$H
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$I = {};
Object.defineProperty(exports$I, "__esModule", {
    value: true
});
Object.defineProperty(exports$I, "__esModule", {
    value: true
});
const _default$G = exports$I.default ?? exports$I;
for (var _k in _ns) if (_k !== "default" && _k !== "__esModule" && Object.prototype.hasOwnProperty.call(_ns, _k)) _default$G[_k] = _ns[_k];
var __require$F = exports$I;
var __esModule$F = exports$I.__esModule;
const _mod$c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$F,
    __require: __require$F,
    _globalThis,
    default: _default$G
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$H = {};
Object.defineProperty(exports$H, "__esModule", {
    value: true
});
Object.defineProperty(exports$H, "__esModule", {
    value: true
});
const platform_1 = __require$F ?? _default$G ?? _mod$c;
const version_1 = __require$J ?? _default$K ?? _mod2$6;
const semver_1 = __require$I ?? _default$J ?? _mod3$3;
const major = version_1.VERSION.split(".")[0];
const GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
const _global = platform_1._globalThis;

function registerGlobal(type, instance, diag2, allowOverride = false) {
    var _a2;
    const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a2 !== void 0 ? _a2 : {
        version: version_1.VERSION
    };
    if (!allowOverride && api[type]) {
        const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
        diag2.error(err.stack || err.message);
        return false;
    }
    if (api.version !== version_1.VERSION) {
        const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${version_1.VERSION}`);
        diag2.error(err.stack || err.message);
        return false;
    }
    api[type] = instance;
    diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${version_1.VERSION}.`);
    return true;
}

exports$H.registerGlobal = registerGlobal;

function getGlobal(type) {
    var _a2, _b;
    const globalVersion = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.version;
    if (!globalVersion || !(0, semver_1.isCompatible)(globalVersion)) {
        return;
    }
    return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}

exports$H.getGlobal = getGlobal;

function unregisterGlobal(type, diag2) {
    diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${version_1.VERSION}.`);
    const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
    if (api) {
        delete api[type];
    }
}

exports$H.unregisterGlobal = unregisterGlobal;
var _registerGlobal = exports$H.registerGlobal;
var _getGlobal = exports$H.getGlobal;
var _unregisterGlobal = exports$H.unregisterGlobal;
const _default$F = exports$H.default ?? exports$H;
var __require$E = exports$H;
var __esModule$E = exports$H.__esModule;
const _mod2$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$E,
    __require: __require$E,
    default: _default$F,
    getGlobal: _getGlobal,
    registerGlobal: _registerGlobal,
    unregisterGlobal: _unregisterGlobal
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$G = {};
Object.defineProperty(exports$G, "__esModule", {
    value: true
});
Object.defineProperty(exports$G, "__esModule", {
    value: true
});
exports$G.DiagLogLevel = void 0;
(function (DiagLogLevel) {
    DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
    DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
    DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
    DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
    DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
    DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
    DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(exports$G.DiagLogLevel || (exports$G.DiagLogLevel = {}));
var _DiagLogLevel = exports$G.DiagLogLevel;
const _default$E = exports$G.default ?? exports$G;
var __require$D = exports$G;
var __esModule$D = exports$G.__esModule;
const _mod4$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DiagLogLevel: _DiagLogLevel,
    __esModule: __esModule$D,
    __require: __require$D,
    default: _default$E
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$F = {};
Object.defineProperty(exports$F, "__esModule", {
    value: true
});
Object.defineProperty(exports$F, "__esModule", {
    value: true
});
exports$F.createLogLevelDiagLogger = void 0;
const types_1$2 = __require$D ?? _default$E ?? _mod4$2;

function createLogLevelDiagLogger(maxLevel, logger) {
    if (maxLevel < types_1$2.DiagLogLevel.NONE) {
        maxLevel = types_1$2.DiagLogLevel.NONE;
    } else if (maxLevel > types_1$2.DiagLogLevel.ALL) {
        maxLevel = types_1$2.DiagLogLevel.ALL;
    }
    logger = logger || {};

    function _filterFunc(funcName, theLevel) {
        const theFunc = logger[funcName];
        if (typeof theFunc === "function" && maxLevel >= theLevel) {
            return theFunc.bind(logger);
        }
        return function () {
        };
    }

    return {
        error: _filterFunc("error", types_1$2.DiagLogLevel.ERROR),
        warn: _filterFunc("warn", types_1$2.DiagLogLevel.WARN),
        info: _filterFunc("info", types_1$2.DiagLogLevel.INFO),
        debug: _filterFunc("debug", types_1$2.DiagLogLevel.DEBUG),
        verbose: _filterFunc("verbose", types_1$2.DiagLogLevel.VERBOSE)
    };
}

exports$F.createLogLevelDiagLogger = createLogLevelDiagLogger;
var _createLogLevelDiagLogger = exports$F.createLogLevelDiagLogger;
const _default$D = exports$F.default ?? exports$F;
var __require$C = exports$F;
var __esModule$C = exports$F.__esModule;
const _mod2$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$C,
    __require: __require$C,
    createLogLevelDiagLogger: _createLogLevelDiagLogger,
    default: _default$D
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$E = {};
Object.defineProperty(exports$E, "__esModule", {
    value: true
});
Object.defineProperty(exports$E, "__esModule", {
    value: true
});
exports$E.DiagComponentLogger = void 0;
const global_utils_1$5 = __require$E ?? _default$F ?? _mod2$5;

class DiagComponentLogger {
    constructor(props) {
        this._namespace = props.namespace || "DiagComponentLogger";
    }

    debug(...args) {
        return logProxy("debug", this._namespace, args);
    }

    error(...args) {
        return logProxy("error", this._namespace, args);
    }

    info(...args) {
        return logProxy("info", this._namespace, args);
    }

    warn(...args) {
        return logProxy("warn", this._namespace, args);
    }

    verbose(...args) {
        return logProxy("verbose", this._namespace, args);
    }
}

exports$E.DiagComponentLogger = DiagComponentLogger;

function logProxy(funcName, namespace, args) {
    const logger = (0, global_utils_1$5.getGlobal)("diag");
    if (!logger) {
        return;
    }
    args.unshift(namespace);
    return logger[funcName](...args);
}

var _DiagComponentLogger = exports$E.DiagComponentLogger;
const _default$C = exports$E.default ?? exports$E;
var __require$B = exports$E;
var __esModule$B = exports$E.__esModule;
const _mod$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DiagComponentLogger: _DiagComponentLogger,
    __esModule: __esModule$B,
    __require: __require$B,
    default: _default$C
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$D = {};
Object.defineProperty(exports$D, "__esModule", {
    value: true
});
Object.defineProperty(exports$D, "__esModule", {
    value: true
});
exports$D.DiagAPI = void 0;
const ComponentLogger_1 = __require$B ?? _default$C ?? _mod$b;
const logLevelLogger_1 = __require$C ?? _default$D ?? _mod2$4;
const types_1$1 = __require$D ?? _default$E ?? _mod4$2;
const global_utils_1$4 = __require$E ?? _default$F ?? _mod2$5;
const API_NAME$4 = "diag";

class DiagAPI {
    /**
     * Private internal constructor
     * @private
     */
    constructor() {
        function _logProxy(funcName) {
            return function (...args) {
                const logger = (0, global_utils_1$4.getGlobal)("diag");
                if (!logger) {
                    return;
                }
                return logger[funcName](...args);
            };
        }

        const self2 = this;
        const setLogger = (logger, optionsOrLogLevel = {
            logLevel: types_1$1.DiagLogLevel.INFO
        }) => {
            var _a2, _b, _c;
            if (logger === self2) {
                const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                self2.error((_a2 = err.stack) !== null && _a2 !== void 0 ? _a2 : err.message);
                return false;
            }
            if (typeof optionsOrLogLevel === "number") {
                optionsOrLogLevel = {
                    logLevel: optionsOrLogLevel
                };
            }
            const oldLogger = (0, global_utils_1$4.getGlobal)("diag");
            const newLogger = (0, logLevelLogger_1.createLogLevelDiagLogger)((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : types_1$1.DiagLogLevel.INFO, logger);
            if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
                const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
                oldLogger.warn(`Current logger will be overwritten from ${stack}`);
                newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
            }
            return (0, global_utils_1$4.registerGlobal)("diag", newLogger, self2, true);
        };
        self2.setLogger = setLogger;
        self2.disable = () => {
            (0, global_utils_1$4.unregisterGlobal)(API_NAME$4, self2);
        };
        self2.createComponentLogger = (options2) => {
            return new ComponentLogger_1.DiagComponentLogger(options2);
        };
        self2.verbose = _logProxy("verbose");
        self2.debug = _logProxy("debug");
        self2.info = _logProxy("info");
        self2.warn = _logProxy("warn");
        self2.error = _logProxy("error");
    }

    /** Get the singleton instance of the DiagAPI API */
    static instance() {
        if (!this._instance) {
            this._instance = new DiagAPI();
        }
        return this._instance;
    }
}

exports$D.DiagAPI = DiagAPI;
var _DiagAPI = exports$D.DiagAPI;
const _default$B = exports$D.default ?? exports$D;
var __require$A = exports$D;
var __esModule$A = exports$D.__esModule;
const _mod$a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DiagAPI: _DiagAPI,
    __esModule: __esModule$A,
    __require: __require$A,
    default: _default$B
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$C = {};
Object.defineProperty(exports$C, "__esModule", {
    value: true
});
Object.defineProperty(exports$C, "__esModule", {
    value: true
});

function createContextKey(description) {
    return Symbol.for(description);
}

exports$C.createContextKey = createContextKey;

class BaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
        const self2 = this;
        self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
        self2.getValue = (key) => self2._currentContext.get(key);
        self2.setValue = (key, value) => {
            const context = new BaseContext(self2._currentContext);
            context._currentContext.set(key, value);
            return context;
        };
        self2.deleteValue = (key) => {
            const context = new BaseContext(self2._currentContext);
            context._currentContext.delete(key);
            return context;
        };
    }
}

exports$C.ROOT_CONTEXT = new BaseContext();
var _createContextKey = exports$C.createContextKey;
var _ROOT_CONTEXT = exports$C.ROOT_CONTEXT;
const _default$A = exports$C.default ?? exports$C;
var __require$z = exports$C;
var __esModule$z = exports$C.__esModule;
const _mod2$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ROOT_CONTEXT: _ROOT_CONTEXT,
    __esModule: __esModule$z,
    __require: __require$z,
    createContextKey: _createContextKey,
    default: _default$A
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$B = {};
Object.defineProperty(exports$B, "__esModule", {
    value: true
});
Object.defineProperty(exports$B, "__esModule", {
    value: true
});
exports$B.NoopContextManager = void 0;
const context_1$5 = __require$z ?? _default$A ?? _mod2$3;

class NoopContextManager {
    active() {
        return context_1$5.ROOT_CONTEXT;
    }

    with(_context2, fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
    }

    bind(_context2, target) {
        return target;
    }

    enable() {
        return this;
    }

    disable() {
        return this;
    }
}

exports$B.NoopContextManager = NoopContextManager;
var _NoopContextManager = exports$B.NoopContextManager;
const _default$z = exports$B.default ?? exports$B;
var __require$y = exports$B;
var __esModule$y = exports$B.__esModule;
const _mod$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NoopContextManager: _NoopContextManager,
    __esModule: __esModule$y,
    __require: __require$y,
    default: _default$z
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$A = {};
Object.defineProperty(exports$A, "__esModule", {
    value: true
});
Object.defineProperty(exports$A, "__esModule", {
    value: true
});
exports$A.ContextAPI = void 0;
const NoopContextManager_1 = __require$y ?? _default$z ?? _mod$9;
const global_utils_1$3 = __require$E ?? _default$F ?? _mod2$5;
const diag_1$5 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$3 = "context";
const NOOP_CONTEXT_MANAGER = new NoopContextManager_1.NoopContextManager();

class ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }

    /** Get the singleton instance of the Context API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new ContextAPI();
        }
        return this._instance;
    }

    /**
     * Set the current context manager.
     *
     * @returns true if the context manager was successfully registered, else false
     */
    setGlobalContextManager(contextManager) {
        return (0, global_utils_1$3.registerGlobal)(API_NAME$3, contextManager, diag_1$5.DiagAPI.instance());
    }

    /**
     * Get the currently active context
     */
    active() {
        return this._getContextManager().active();
    }

    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context, fn, thisArg, ...args) {
        return this._getContextManager().with(context, fn, thisArg, ...args);
    }

    /**
     * Bind a context to a target function or event emitter
     *
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     * @param target function or event emitter to bind
     */
    bind(context, target) {
        return this._getContextManager().bind(context, target);
    }

    _getContextManager() {
        return (0, global_utils_1$3.getGlobal)(API_NAME$3) || NOOP_CONTEXT_MANAGER;
    }

    /** Disable and remove the global context manager */
    disable() {
        this._getContextManager().disable();
        (0, global_utils_1$3.unregisterGlobal)(API_NAME$3, diag_1$5.DiagAPI.instance());
    }
}

exports$A.ContextAPI = ContextAPI;
var _ContextAPI = exports$A.ContextAPI;
const _default$y = exports$A.default ?? exports$A;
var __require$x = exports$A;
var __esModule$x = exports$A.__esModule;
const _mod$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ContextAPI: _ContextAPI,
    __esModule: __esModule$x,
    __require: __require$x,
    default: _default$y
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$z = {};
Object.defineProperty(exports$z, "__esModule", {
    value: true
});
Object.defineProperty(exports$z, "__esModule", {
    value: true
});
exports$z.TraceFlags = void 0;
(function (TraceFlags) {
    TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
    TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(exports$z.TraceFlags || (exports$z.TraceFlags = {}));
var _TraceFlags = exports$z.TraceFlags;
const _default$x = exports$z.default ?? exports$z;
var __require$w = exports$z;
var __esModule$w = exports$z.__esModule;
const _mod11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    TraceFlags: _TraceFlags,
    __esModule: __esModule$w,
    __require: __require$w,
    default: _default$x
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$y = {};
Object.defineProperty(exports$y, "__esModule", {
    value: true
});
Object.defineProperty(exports$y, "__esModule", {
    value: true
});
const trace_flags_1$1 = __require$w ?? _default$x ?? _mod11;
exports$y.INVALID_SPANID = "0000000000000000";
exports$y.INVALID_TRACEID = "00000000000000000000000000000000";
exports$y.INVALID_SPAN_CONTEXT = {
    traceId: exports$y.INVALID_TRACEID,
    spanId: exports$y.INVALID_SPANID,
    traceFlags: trace_flags_1$1.TraceFlags.NONE
};
var _INVALID_SPANID = exports$y.INVALID_SPANID;
var _INVALID_TRACEID = exports$y.INVALID_TRACEID;
var _INVALID_SPAN_CONTEXT = exports$y.INVALID_SPAN_CONTEXT;
const _default$w = exports$y.default ?? exports$y;
var __require$v = exports$y;
var __esModule$v = exports$y.__esModule;
const _mod14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    INVALID_SPANID: _INVALID_SPANID,
    INVALID_SPAN_CONTEXT: _INVALID_SPAN_CONTEXT,
    INVALID_TRACEID: _INVALID_TRACEID,
    __esModule: __esModule$v,
    __require: __require$v,
    default: _default$w
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$x = {};
Object.defineProperty(exports$x, "__esModule", {
    value: true
});
Object.defineProperty(exports$x, "__esModule", {
    value: true
});
exports$x.NonRecordingSpan = void 0;
const invalid_span_constants_1$2 = __require$v ?? _default$w ?? _mod14;

class NonRecordingSpan {
    constructor(_spanContext = invalid_span_constants_1$2.INVALID_SPAN_CONTEXT) {
        this._spanContext = _spanContext;
    }

    // Returns a SpanContext.
    spanContext() {
        return this._spanContext;
    }

    // By default does nothing
    setAttribute(_key, _value) {
        return this;
    }

    // By default does nothing
    setAttributes(_attributes) {
        return this;
    }

    // By default does nothing
    addEvent(_name, _attributes) {
        return this;
    }

    addLink(_link) {
        return this;
    }

    addLinks(_links) {
        return this;
    }

    // By default does nothing
    setStatus(_status) {
        return this;
    }

    // By default does nothing
    updateName(_name) {
        return this;
    }

    // By default does nothing
    end(_endTime) {
    }

    // isRecording always returns false for NonRecordingSpan.
    isRecording() {
        return false;
    }

    // By default does nothing
    recordException(_exception, _time) {
    }
}

exports$x.NonRecordingSpan = NonRecordingSpan;
var _NonRecordingSpan = exports$x.NonRecordingSpan;
const _default$v = exports$x.default ?? exports$x;
var __require$u = exports$x;
var __esModule$u = exports$x.__esModule;
const _mod3$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NonRecordingSpan: _NonRecordingSpan,
    __esModule: __esModule$u,
    __require: __require$u,
    default: _default$v
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$w = {};
Object.defineProperty(exports$w, "__esModule", {
    value: true
});
Object.defineProperty(exports$w, "__esModule", {
    value: true
});
const context_1$4 = __require$z ?? _default$A ?? _mod2$3;
const NonRecordingSpan_1$2 = __require$u ?? _default$v ?? _mod3$2;
const context_2$1 = __require$x ?? _default$y ?? _mod$8;
const SPAN_KEY = (0, context_1$4.createContextKey)("OpenTelemetry Context Key SPAN");

function getSpan(context) {
    return context.getValue(SPAN_KEY) || void 0;
}

exports$w.getSpan = getSpan;

function getActiveSpan() {
    return getSpan(context_2$1.ContextAPI.getInstance().active());
}

exports$w.getActiveSpan = getActiveSpan;

function setSpan(context, span) {
    return context.setValue(SPAN_KEY, span);
}

exports$w.setSpan = setSpan;

function deleteSpan(context) {
    return context.deleteValue(SPAN_KEY);
}

exports$w.deleteSpan = deleteSpan;

function setSpanContext(context, spanContext) {
    return setSpan(context, new NonRecordingSpan_1$2.NonRecordingSpan(spanContext));
}

exports$w.setSpanContext = setSpanContext;

function getSpanContext(context) {
    var _a2;
    return (_a2 = getSpan(context)) === null || _a2 === void 0 ? void 0 : _a2.spanContext();
}

exports$w.getSpanContext = getSpanContext;
var _getSpan = exports$w.getSpan;
var _getActiveSpan = exports$w.getActiveSpan;
var _setSpan = exports$w.setSpan;
var _deleteSpan = exports$w.deleteSpan;
var _setSpanContext = exports$w.setSpanContext;
var _getSpanContext = exports$w.getSpanContext;
const _default$u = exports$w.default ?? exports$w;
var __require$t = exports$w;
var __esModule$t = exports$w.__esModule;
const _mod4$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$t,
    __require: __require$t,
    default: _default$u,
    deleteSpan: _deleteSpan,
    getActiveSpan: _getActiveSpan,
    getSpan: _getSpan,
    getSpanContext: _getSpanContext,
    setSpan: _setSpan,
    setSpanContext: _setSpanContext
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$v = {};
Object.defineProperty(exports$v, "__esModule", {
    value: true
});
Object.defineProperty(exports$v, "__esModule", {
    value: true
});
const invalid_span_constants_1$1 = __require$v ?? _default$w ?? _mod14;
const NonRecordingSpan_1$1 = __require$u ?? _default$v ?? _mod3$2;
const VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;

function isValidTraceId(traceId) {
    return VALID_TRACEID_REGEX.test(traceId) && traceId !== invalid_span_constants_1$1.INVALID_TRACEID;
}

exports$v.isValidTraceId = isValidTraceId;

function isValidSpanId(spanId) {
    return VALID_SPANID_REGEX.test(spanId) && spanId !== invalid_span_constants_1$1.INVALID_SPANID;
}

exports$v.isValidSpanId = isValidSpanId;

function isSpanContextValid(spanContext) {
    return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}

exports$v.isSpanContextValid = isSpanContextValid;

function wrapSpanContext(spanContext) {
    return new NonRecordingSpan_1$1.NonRecordingSpan(spanContext);
}

exports$v.wrapSpanContext = wrapSpanContext;
var _isValidTraceId = exports$v.isValidTraceId;
var _isValidSpanId = exports$v.isValidSpanId;
var _isSpanContextValid = exports$v.isSpanContextValid;
var _wrapSpanContext = exports$v.wrapSpanContext;
const _default$t = exports$v.default ?? exports$v;
var __require$s = exports$v;
var __esModule$s = exports$v.__esModule;
const _mod13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$s,
    __require: __require$s,
    default: _default$t,
    isSpanContextValid: _isSpanContextValid,
    isValidSpanId: _isValidSpanId,
    isValidTraceId: _isValidTraceId,
    wrapSpanContext: _wrapSpanContext
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$u = {};
Object.defineProperty(exports$u, "__esModule", {
    value: true
});
Object.defineProperty(exports$u, "__esModule", {
    value: true
});
exports$u.NoopTracer = void 0;
const context_1$3 = __require$x ?? _default$y ?? _mod$8;
const context_utils_1$1 = __require$t ?? _default$u ?? _mod4$1;
const NonRecordingSpan_1 = __require$u ?? _default$v ?? _mod3$2;
const spancontext_utils_1$2 = __require$s ?? _default$t ?? _mod13;
const contextApi = context_1$3.ContextAPI.getInstance();

class NoopTracer {
    // startSpan starts a noop span.
    startSpan(name, options2, context = contextApi.active()) {
        const root2 = Boolean(options2 === null || options2 === void 0 ? void 0 : options2.root);
        if (root2) {
            return new NonRecordingSpan_1.NonRecordingSpan();
        }
        const parentFromContext = context && (0, context_utils_1$1.getSpanContext)(context);
        if (isSpanContext(parentFromContext) && (0, spancontext_utils_1$2.isSpanContextValid)(parentFromContext)) {
            return new NonRecordingSpan_1.NonRecordingSpan(parentFromContext);
        } else {
            return new NonRecordingSpan_1.NonRecordingSpan();
        }
    }

    startActiveSpan(name, arg2, arg3, arg4) {
        let opts;
        let ctx;
        let fn;
        if (arguments.length < 2) {
            return;
        } else if (arguments.length === 2) {
            fn = arg2;
        } else if (arguments.length === 3) {
            opts = arg2;
            fn = arg3;
        } else {
            opts = arg2;
            ctx = arg3;
            fn = arg4;
        }
        const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
        const span = this.startSpan(name, opts, parentContext);
        const contextWithSpanSet = (0, context_utils_1$1.setSpan)(parentContext, span);
        return contextApi.with(contextWithSpanSet, fn, void 0, span);
    }
}

exports$u.NoopTracer = NoopTracer;

function isSpanContext(spanContext) {
    return typeof spanContext === "object" && typeof spanContext["spanId"] === "string" && typeof spanContext["traceId"] === "string" && typeof spanContext["traceFlags"] === "number";
}

var _NoopTracer = exports$u.NoopTracer;
const _default$s = exports$u.default ?? exports$u;
var __require$r = exports$u;
var __esModule$r = exports$u.__esModule;
const _mod$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NoopTracer: _NoopTracer,
    __esModule: __esModule$r,
    __require: __require$r,
    default: _default$s
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$t = {};
Object.defineProperty(exports$t, "__esModule", {
    value: true
});
Object.defineProperty(exports$t, "__esModule", {
    value: true
});
exports$t.NoopTracerProvider = void 0;
const NoopTracer_1$1 = __require$r ?? _default$s ?? _mod$7;

class NoopTracerProvider {
    getTracer(_name, _version, _options) {
        return new NoopTracer_1$1.NoopTracer();
    }
}

exports$t.NoopTracerProvider = NoopTracerProvider;
var _NoopTracerProvider = exports$t.NoopTracerProvider;
const _default$r = exports$t.default ?? exports$t;
var __require$q = exports$t;
var __esModule$q = exports$t.__esModule;
const _mod2$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NoopTracerProvider: _NoopTracerProvider,
    __esModule: __esModule$q,
    __require: __require$q,
    default: _default$r
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$s = {};
Object.defineProperty(exports$s, "__esModule", {
    value: true
});
Object.defineProperty(exports$s, "__esModule", {
    value: true
});
exports$s.ProxyTracer = void 0;
const NoopTracer_1 = __require$r ?? _default$s ?? _mod$7;
const NOOP_TRACER = new NoopTracer_1.NoopTracer();

class ProxyTracer {
    constructor(_provider, name, version2, options2) {
        this._provider = _provider;
        this.name = name;
        this.version = version2;
        this.options = options2;
    }

    startSpan(name, options2, context) {
        return this._getTracer().startSpan(name, options2, context);
    }

    startActiveSpan(_name, _options, _context2, _fn) {
        const tracer2 = this._getTracer();
        return Reflect.apply(tracer2.startActiveSpan, tracer2, arguments);
    }

    /**
     * Try to get a tracer from the proxy tracer provider.
     * If the proxy tracer provider has no delegate, return a noop tracer.
     */
    _getTracer() {
        if (this._delegate) {
            return this._delegate;
        }
        const tracer2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
        if (!tracer2) {
            return NOOP_TRACER;
        }
        this._delegate = tracer2;
        return this._delegate;
    }
}

exports$s.ProxyTracer = ProxyTracer;
var _ProxyTracer = exports$s.ProxyTracer;
const _default$q = exports$s.default ?? exports$s;
var __require$p = exports$s;
var __esModule$p = exports$s.__esModule;
const _mod8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ProxyTracer: _ProxyTracer,
    __esModule: __esModule$p,
    __require: __require$p,
    default: _default$q
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$r = {};
Object.defineProperty(exports$r, "__esModule", {
    value: true
});
Object.defineProperty(exports$r, "__esModule", {
    value: true
});
exports$r.ProxyTracerProvider = void 0;
const ProxyTracer_1$1 = __require$p ?? _default$q ?? _mod8;
const NoopTracerProvider_1 = __require$q ?? _default$r ?? _mod2$2;
const NOOP_TRACER_PROVIDER = new NoopTracerProvider_1.NoopTracerProvider();

class ProxyTracerProvider {
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name, version2, options2) {
        var _a2;
        return (_a2 = this.getDelegateTracer(name, version2, options2)) !== null && _a2 !== void 0 ? _a2 : new ProxyTracer_1$1.ProxyTracer(this, name, version2, options2);
    }

    getDelegate() {
        var _a2;
        return (_a2 = this._delegate) !== null && _a2 !== void 0 ? _a2 : NOOP_TRACER_PROVIDER;
    }

    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate) {
        this._delegate = delegate;
    }

    getDelegateTracer(name, version2, options2) {
        var _a2;
        return (_a2 = this._delegate) === null || _a2 === void 0 ? void 0 : _a2.getTracer(name, version2, options2);
    }
}

exports$r.ProxyTracerProvider = ProxyTracerProvider;
var _ProxyTracerProvider = exports$r.ProxyTracerProvider;
const _default$p = exports$r.default ?? exports$r;
var __require$o = exports$r;
var __esModule$o = exports$r.__esModule;
const _mod9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ProxyTracerProvider: _ProxyTracerProvider,
    __esModule: __esModule$o,
    __require: __require$o,
    default: _default$p
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$q = {};
Object.defineProperty(exports$q, "__esModule", {
    value: true
});
Object.defineProperty(exports$q, "__esModule", {
    value: true
});
exports$q.TraceAPI = void 0;
const global_utils_1$2 = __require$E ?? _default$F ?? _mod2$5;
const ProxyTracerProvider_1$1 = __require$o ?? _default$p ?? _mod9;
const spancontext_utils_1$1 = __require$s ?? _default$t ?? _mod13;
const context_utils_1 = __require$t ?? _default$u ?? _mod4$1;
const diag_1$4 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$2 = "trace";

class TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
        this.wrapSpanContext = spancontext_utils_1$1.wrapSpanContext;
        this.isSpanContextValid = spancontext_utils_1$1.isSpanContextValid;
        this.deleteSpan = context_utils_1.deleteSpan;
        this.getSpan = context_utils_1.getSpan;
        this.getActiveSpan = context_utils_1.getActiveSpan;
        this.getSpanContext = context_utils_1.getSpanContext;
        this.setSpan = context_utils_1.setSpan;
        this.setSpanContext = context_utils_1.setSpanContext;
    }

    /** Get the singleton instance of the Trace API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new TraceAPI();
        }
        return this._instance;
    }

    /**
     * Set the current global tracer.
     *
     * @returns true if the tracer provider was successfully registered, else false
     */
    setGlobalTracerProvider(provider) {
        const success = (0, global_utils_1$2.registerGlobal)(API_NAME$2, this._proxyTracerProvider, diag_1$4.DiagAPI.instance());
        if (success) {
            this._proxyTracerProvider.setDelegate(provider);
        }
        return success;
    }

    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
        return (0, global_utils_1$2.getGlobal)(API_NAME$2) || this._proxyTracerProvider;
    }

    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version2) {
        return this.getTracerProvider().getTracer(name, version2);
    }

    /** Remove the global tracer provider */
    disable() {
        (0, global_utils_1$2.unregisterGlobal)(API_NAME$2, diag_1$4.DiagAPI.instance());
        this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
    }
}

exports$q.TraceAPI = TraceAPI;
var _TraceAPI = exports$q.TraceAPI;
const _default$o = exports$q.default ?? exports$q;
var __require$n = exports$q;
var __esModule$n = exports$q.__esModule;
const _mod$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    TraceAPI: _TraceAPI,
    __esModule: __esModule$n,
    __require: __require$n,
    default: _default$o
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$p = {};
Object.defineProperty(exports$p, "__esModule", {
    value: true
});
Object.defineProperty(exports$p, "__esModule", {
    value: true
});
exports$p.trace = void 0;
const trace_1 = __require$n ?? _default$o ?? _mod$6;
exports$p.trace = trace_1.TraceAPI.getInstance();
var _trace$1 = exports$p.trace;
const _default$n = exports$p.default ?? exports$p;
var __require$m = exports$p;
var __esModule$m = exports$p.__esModule;
const _mod19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$m,
    __require: __require$m,
    default: _default$n,
    trace: _trace$1
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$o = {};
Object.defineProperty(exports$o, "__esModule", {
    value: true
});
Object.defineProperty(exports$o, "__esModule", {
    value: true
});
exports$o.baggageEntryMetadataSymbol = void 0;
exports$o.baggageEntryMetadataSymbol = /* @__PURE__ */ Symbol("BaggageEntryMetadata");
var _baggageEntryMetadataSymbol = exports$o.baggageEntryMetadataSymbol;
const _default$m = exports$o.default ?? exports$o;
var __require$l = exports$o;
var __esModule$l = exports$o.__esModule;
const _mod3$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$l,
    __require: __require$l,
    baggageEntryMetadataSymbol: _baggageEntryMetadataSymbol,
    default: _default$m
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$n = {};
Object.defineProperty(exports$n, "__esModule", {
    value: true
});
Object.defineProperty(exports$n, "__esModule", {
    value: true
});
exports$n.BaggageImpl = void 0;

class BaggageImpl {
    constructor(entries) {
        this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
    }

    getEntry(key) {
        const entry = this._entries.get(key);
        if (!entry) {
            return void 0;
        }
        return Object.assign({}, entry);
    }

    getAllEntries() {
        return Array.from(this._entries.entries()).map(([k2, v2]) => [k2, v2]);
    }

    setEntry(key, entry) {
        const newBaggage = new BaggageImpl(this._entries);
        newBaggage._entries.set(key, entry);
        return newBaggage;
    }

    removeEntry(key) {
        const newBaggage = new BaggageImpl(this._entries);
        newBaggage._entries.delete(key);
        return newBaggage;
    }

    removeEntries(...keys) {
        const newBaggage = new BaggageImpl(this._entries);
        for (const key of keys) {
            newBaggage._entries.delete(key);
        }
        return newBaggage;
    }

    clear() {
        return new BaggageImpl();
    }
}

exports$n.BaggageImpl = BaggageImpl;
var _BaggageImpl = exports$n.BaggageImpl;
const _default$l = exports$n.default ?? exports$n;
var __require$k = exports$n;
var __esModule$k = exports$n.__esModule;
const _mod2$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    BaggageImpl: _BaggageImpl,
    __esModule: __esModule$k,
    __require: __require$k,
    default: _default$l
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$m = {};
Object.defineProperty(exports$m, "__esModule", {
    value: true
});
Object.defineProperty(exports$m, "__esModule", {
    value: true
});
const diag_1$3 = __require$A ?? _default$B ?? _mod$a;
const baggage_impl_1 = __require$k ?? _default$l ?? _mod2$1;
const symbol_1 = __require$l ?? _default$m ?? _mod3$1;
const diag = diag_1$3.DiagAPI.instance();

function createBaggage(entries = {}) {
    return new baggage_impl_1.BaggageImpl(new Map(Object.entries(entries)));
}

exports$m.createBaggage = createBaggage;

function baggageEntryMetadataFromString(str) {
    if (typeof str !== "string") {
        diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
        str = "";
    }
    return {
        __TYPE__: symbol_1.baggageEntryMetadataSymbol,
        toString() {
            return str;
        }
    };
}

exports$m.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
var _createBaggage = exports$m.createBaggage;
var _baggageEntryMetadataFromString = exports$m.baggageEntryMetadataFromString;
const _default$k = exports$m.default ?? exports$m;
var __require$j = exports$m;
var __esModule$j = exports$m.__esModule;
const _mod$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$j,
    __require: __require$j,
    baggageEntryMetadataFromString: _baggageEntryMetadataFromString,
    createBaggage: _createBaggage,
    default: _default$k
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$l = {};
Object.defineProperty(exports$l, "__esModule", {
    value: true
});
Object.defineProperty(exports$l, "__esModule", {
    value: true
});
const context_1$2 = __require$x ?? _default$y ?? _mod$8;
const context_2 = __require$z ?? _default$A ?? _mod2$3;
const BAGGAGE_KEY = (0, context_2.createContextKey)("OpenTelemetry Baggage Key");

function getBaggage(context) {
    return context.getValue(BAGGAGE_KEY) || void 0;
}

exports$l.getBaggage = getBaggage;

function getActiveBaggage() {
    return getBaggage(context_1$2.ContextAPI.getInstance().active());
}

exports$l.getActiveBaggage = getActiveBaggage;

function setBaggage(context, baggage) {
    return context.setValue(BAGGAGE_KEY, baggage);
}

exports$l.setBaggage = setBaggage;

function deleteBaggage(context) {
    return context.deleteValue(BAGGAGE_KEY);
}

exports$l.deleteBaggage = deleteBaggage;
var _getBaggage = exports$l.getBaggage;
var _getActiveBaggage = exports$l.getActiveBaggage;
var _setBaggage = exports$l.setBaggage;
var _deleteBaggage = exports$l.deleteBaggage;
const _default$j = exports$l.default ?? exports$l;
var __require$i = exports$l;
var __esModule$i = exports$l.__esModule;
const _mod4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$i,
    __require: __require$i,
    default: _default$j,
    deleteBaggage: _deleteBaggage,
    getActiveBaggage: _getActiveBaggage,
    getBaggage: _getBaggage,
    setBaggage: _setBaggage
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$k = {};
Object.defineProperty(exports$k, "__esModule", {
    value: true
});
Object.defineProperty(exports$k, "__esModule", {
    value: true
});
exports$k.defaultTextMapGetter = {
    get(carrier, key) {
        if (carrier == null) {
            return void 0;
        }
        return carrier[key];
    },
    keys(carrier) {
        if (carrier == null) {
            return [];
        }
        return Object.keys(carrier);
    }
};
exports$k.defaultTextMapSetter = {
    set(carrier, key, value) {
        if (carrier == null) {
            return;
        }
        carrier[key] = value;
    }
};
var _defaultTextMapGetter = exports$k.defaultTextMapGetter;
var _defaultTextMapSetter = exports$k.defaultTextMapSetter;
const _default$i = exports$k.default ?? exports$k;
var __require$h = exports$k;
var __esModule$h = exports$k.__esModule;
const _mod7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$h,
    __require: __require$h,
    default: _default$i,
    defaultTextMapGetter: _defaultTextMapGetter,
    defaultTextMapSetter: _defaultTextMapSetter
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$j = {};
Object.defineProperty(exports$j, "__esModule", {
    value: true
});
Object.defineProperty(exports$j, "__esModule", {
    value: true
});
exports$j.NoopTextMapPropagator = void 0;

class NoopTextMapPropagator {
    /** Noop inject function does nothing */
    inject(_context2, _carrier) {
    }

    /** Noop extract function does nothing and returns the input context */
    extract(context, _carrier) {
        return context;
    }

    fields() {
        return [];
    }
}

exports$j.NoopTextMapPropagator = NoopTextMapPropagator;
var _NoopTextMapPropagator = exports$j.NoopTextMapPropagator;
const _default$h = exports$j.default ?? exports$j;
var __require$g = exports$j;
var __esModule$g = exports$j.__esModule;
const _mod2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NoopTextMapPropagator: _NoopTextMapPropagator,
    __esModule: __esModule$g,
    __require: __require$g,
    default: _default$h
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$i = {};
Object.defineProperty(exports$i, "__esModule", {
    value: true
});
Object.defineProperty(exports$i, "__esModule", {
    value: true
});
exports$i.PropagationAPI = void 0;
const global_utils_1$1 = __require$E ?? _default$F ?? _mod2$5;
const NoopTextMapPropagator_1 = __require$g ?? _default$h ?? _mod2;
const TextMapPropagator_1$1 = __require$h ?? _default$i ?? _mod7;
const context_helpers_1 = __require$i ?? _default$j ?? _mod4;
const utils_1$1 = __require$j ?? _default$k ?? _mod$5;
const diag_1$2 = __require$A ?? _default$B ?? _mod$a;
const API_NAME$1 = "propagation";
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator_1.NoopTextMapPropagator();

class PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this.createBaggage = utils_1$1.createBaggage;
        this.getBaggage = context_helpers_1.getBaggage;
        this.getActiveBaggage = context_helpers_1.getActiveBaggage;
        this.setBaggage = context_helpers_1.setBaggage;
        this.deleteBaggage = context_helpers_1.deleteBaggage;
    }

    /** Get the singleton instance of the Propagator API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new PropagationAPI();
        }
        return this._instance;
    }

    /**
     * Set the current propagator.
     *
     * @returns true if the propagator was successfully registered, else false
     */
    setGlobalPropagator(propagator) {
        return (0, global_utils_1$1.registerGlobal)(API_NAME$1, propagator, diag_1$2.DiagAPI.instance());
    }

    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param context Context carrying tracing data to inject
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     */
    inject(context, carrier, setter = TextMapPropagator_1$1.defaultTextMapSetter) {
        return this._getGlobalPropagator().inject(context, carrier, setter);
    }

    /**
     * Extract context from a carrier
     *
     * @param context Context which the newly created context will inherit from
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     */
    extract(context, carrier, getter = TextMapPropagator_1$1.defaultTextMapGetter) {
        return this._getGlobalPropagator().extract(context, carrier, getter);
    }

    /**
     * Return a list of all fields which may be used by the propagator.
     */
    fields() {
        return this._getGlobalPropagator().fields();
    }

    /** Remove the global propagator */
    disable() {
        (0, global_utils_1$1.unregisterGlobal)(API_NAME$1, diag_1$2.DiagAPI.instance());
    }

    _getGlobalPropagator() {
        return (0, global_utils_1$1.getGlobal)(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
    }
}

exports$i.PropagationAPI = PropagationAPI;
var _PropagationAPI = exports$i.PropagationAPI;
const _default$g = exports$i.default ?? exports$i;
var __require$f = exports$i;
var __esModule$f = exports$i.__esModule;
const _mod$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    PropagationAPI: _PropagationAPI,
    __esModule: __esModule$f,
    __require: __require$f,
    default: _default$g
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$h = {};
Object.defineProperty(exports$h, "__esModule", {
    value: true
});
Object.defineProperty(exports$h, "__esModule", {
    value: true
});
exports$h.propagation = void 0;
const propagation_1 = __require$f ?? _default$g ?? _mod$4;
exports$h.propagation = propagation_1.PropagationAPI.getInstance();
var _propagation = exports$h.propagation;
const _default$f = exports$h.default ?? exports$h;
var __require$e = exports$h;
var __esModule$e = exports$h.__esModule;
const _mod18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$e,
    __require: __require$e,
    default: _default$f,
    propagation: _propagation
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$g = {};
Object.defineProperty(exports$g, "__esModule", {
    value: true
});
Object.defineProperty(exports$g, "__esModule", {
    value: true
});

class NoopMeter {
    constructor() {
    }

    /**
     * @see {@link Meter.createGauge}
     */
    createGauge(_name, _options) {
        return exports$g.NOOP_GAUGE_METRIC;
    }

    /**
     * @see {@link Meter.createHistogram}
     */
    createHistogram(_name, _options) {
        return exports$g.NOOP_HISTOGRAM_METRIC;
    }

    /**
     * @see {@link Meter.createCounter}
     */
    createCounter(_name, _options) {
        return exports$g.NOOP_COUNTER_METRIC;
    }

    /**
     * @see {@link Meter.createUpDownCounter}
     */
    createUpDownCounter(_name, _options) {
        return exports$g.NOOP_UP_DOWN_COUNTER_METRIC;
    }

    /**
     * @see {@link Meter.createObservableGauge}
     */
    createObservableGauge(_name, _options) {
        return exports$g.NOOP_OBSERVABLE_GAUGE_METRIC;
    }

    /**
     * @see {@link Meter.createObservableCounter}
     */
    createObservableCounter(_name, _options) {
        return exports$g.NOOP_OBSERVABLE_COUNTER_METRIC;
    }

    /**
     * @see {@link Meter.createObservableUpDownCounter}
     */
    createObservableUpDownCounter(_name, _options) {
        return exports$g.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }

    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(_callback, _observables) {
    }

    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(_callback) {
    }
}

exports$g.NoopMeter = NoopMeter;

class NoopMetric {
}

exports$g.NoopMetric = NoopMetric;

class NoopCounterMetric extends NoopMetric {
    add(_value, _attributes) {
    }
}

exports$g.NoopCounterMetric = NoopCounterMetric;

class NoopUpDownCounterMetric extends NoopMetric {
    add(_value, _attributes) {
    }
}

exports$g.NoopUpDownCounterMetric = NoopUpDownCounterMetric;

class NoopGaugeMetric extends NoopMetric {
    record(_value, _attributes) {
    }
}

exports$g.NoopGaugeMetric = NoopGaugeMetric;

class NoopHistogramMetric extends NoopMetric {
    record(_value, _attributes) {
    }
}

exports$g.NoopHistogramMetric = NoopHistogramMetric;

class NoopObservableMetric {
    addCallback(_callback) {
    }

    removeCallback(_callback) {
    }
}

exports$g.NoopObservableMetric = NoopObservableMetric;

class NoopObservableCounterMetric extends NoopObservableMetric {
}

exports$g.NoopObservableCounterMetric = NoopObservableCounterMetric;

class NoopObservableGaugeMetric extends NoopObservableMetric {
}

exports$g.NoopObservableGaugeMetric = NoopObservableGaugeMetric;

class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
}

exports$g.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
exports$g.NOOP_METER = new NoopMeter();
exports$g.NOOP_COUNTER_METRIC = new NoopCounterMetric();
exports$g.NOOP_GAUGE_METRIC = new NoopGaugeMetric();
exports$g.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
exports$g.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
exports$g.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
exports$g.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
exports$g.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();

function createNoopMeter() {
    return exports$g.NOOP_METER;
}

exports$g.createNoopMeter = createNoopMeter;
var _NOOP_GAUGE_METRIC = exports$g.NOOP_GAUGE_METRIC;
var _NOOP_HISTOGRAM_METRIC = exports$g.NOOP_HISTOGRAM_METRIC;
var _NOOP_COUNTER_METRIC = exports$g.NOOP_COUNTER_METRIC;
var _NOOP_UP_DOWN_COUNTER_METRIC = exports$g.NOOP_UP_DOWN_COUNTER_METRIC;
var _NOOP_OBSERVABLE_GAUGE_METRIC = exports$g.NOOP_OBSERVABLE_GAUGE_METRIC;
var _NOOP_OBSERVABLE_COUNTER_METRIC = exports$g.NOOP_OBSERVABLE_COUNTER_METRIC;
var _NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = exports$g.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
var _NoopMeter = exports$g.NoopMeter;
var _NoopMetric = exports$g.NoopMetric;
var _NoopCounterMetric = exports$g.NoopCounterMetric;
var _NoopUpDownCounterMetric = exports$g.NoopUpDownCounterMetric;
var _NoopGaugeMetric = exports$g.NoopGaugeMetric;
var _NoopHistogramMetric = exports$g.NoopHistogramMetric;
var _NoopObservableMetric = exports$g.NoopObservableMetric;
var _NoopObservableCounterMetric = exports$g.NoopObservableCounterMetric;
var _NoopObservableGaugeMetric = exports$g.NoopObservableGaugeMetric;
var _NoopObservableUpDownCounterMetric = exports$g.NoopObservableUpDownCounterMetric;
var _NOOP_METER = exports$g.NOOP_METER;
var _createNoopMeter = exports$g.createNoopMeter;
const _default$e = exports$g.default ?? exports$g;
var __require$d = exports$g;
var __esModule$d = exports$g.__esModule;
const _mod5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NOOP_COUNTER_METRIC: _NOOP_COUNTER_METRIC,
    NOOP_GAUGE_METRIC: _NOOP_GAUGE_METRIC,
    NOOP_HISTOGRAM_METRIC: _NOOP_HISTOGRAM_METRIC,
    NOOP_METER: _NOOP_METER,
    NOOP_OBSERVABLE_COUNTER_METRIC: _NOOP_OBSERVABLE_COUNTER_METRIC,
    NOOP_OBSERVABLE_GAUGE_METRIC: _NOOP_OBSERVABLE_GAUGE_METRIC,
    NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC: _NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC,
    NOOP_UP_DOWN_COUNTER_METRIC: _NOOP_UP_DOWN_COUNTER_METRIC,
    NoopCounterMetric: _NoopCounterMetric,
    NoopGaugeMetric: _NoopGaugeMetric,
    NoopHistogramMetric: _NoopHistogramMetric,
    NoopMeter: _NoopMeter,
    NoopMetric: _NoopMetric,
    NoopObservableCounterMetric: _NoopObservableCounterMetric,
    NoopObservableGaugeMetric: _NoopObservableGaugeMetric,
    NoopObservableMetric: _NoopObservableMetric,
    NoopObservableUpDownCounterMetric: _NoopObservableUpDownCounterMetric,
    NoopUpDownCounterMetric: _NoopUpDownCounterMetric,
    __esModule: __esModule$d,
    __require: __require$d,
    createNoopMeter: _createNoopMeter,
    default: _default$e
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$f = {};
Object.defineProperty(exports$f, "__esModule", {
    value: true
});
Object.defineProperty(exports$f, "__esModule", {
    value: true
});
const NoopMeter_1$1 = __require$d ?? _default$e ?? _mod5;

class NoopMeterProvider {
    getMeter(_name, _version, _options) {
        return NoopMeter_1$1.NOOP_METER;
    }
}

exports$f.NoopMeterProvider = NoopMeterProvider;
exports$f.NOOP_METER_PROVIDER = new NoopMeterProvider();
var _NoopMeterProvider = exports$f.NoopMeterProvider;
var _NOOP_METER_PROVIDER = exports$f.NOOP_METER_PROVIDER;
const _default$d = exports$f.default ?? exports$f;
var __require$c = exports$f;
var __esModule$c = exports$f.__esModule;
const _mod$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    NOOP_METER_PROVIDER: _NOOP_METER_PROVIDER,
    NoopMeterProvider: _NoopMeterProvider,
    __esModule: __esModule$c,
    __require: __require$c,
    default: _default$d
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$e = {};
Object.defineProperty(exports$e, "__esModule", {
    value: true
});
Object.defineProperty(exports$e, "__esModule", {
    value: true
});
exports$e.MetricsAPI = void 0;
const NoopMeterProvider_1 = __require$c ?? _default$d ?? _mod$3;
const global_utils_1 = __require$E ?? _default$F ?? _mod2$5;
const diag_1$1 = __require$A ?? _default$B ?? _mod$a;
const API_NAME = "metrics";

class MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }

    /** Get the singleton instance of the Metrics API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new MetricsAPI();
        }
        return this._instance;
    }

    /**
     * Set the current global meter provider.
     * Returns true if the meter provider was successfully registered, else false.
     */
    setGlobalMeterProvider(provider) {
        return (0, global_utils_1.registerGlobal)(API_NAME, provider, diag_1$1.DiagAPI.instance());
    }

    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
        return (0, global_utils_1.getGlobal)(API_NAME) || NoopMeterProvider_1.NOOP_METER_PROVIDER;
    }

    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version2, options2) {
        return this.getMeterProvider().getMeter(name, version2, options2);
    }

    /** Remove the global meter provider */
    disable() {
        (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1$1.DiagAPI.instance());
    }
}

exports$e.MetricsAPI = MetricsAPI;
var _MetricsAPI = exports$e.MetricsAPI;
const _default$c = exports$e.default ?? exports$e;
var __require$b = exports$e;
var __esModule$b = exports$e.__esModule;
const _mod$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    MetricsAPI: _MetricsAPI,
    __esModule: __esModule$b,
    __require: __require$b,
    default: _default$c
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$d = {};
Object.defineProperty(exports$d, "__esModule", {
    value: true
});
Object.defineProperty(exports$d, "__esModule", {
    value: true
});
exports$d.metrics = void 0;
const metrics_1 = __require$b ?? _default$c ?? _mod$2;
exports$d.metrics = metrics_1.MetricsAPI.getInstance();
var _metrics = exports$d.metrics;
const _default$b = exports$d.default ?? exports$d;
var __require$a = exports$d;
var __esModule$a = exports$d.__esModule;
const _mod17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$a,
    __require: __require$a,
    default: _default$b,
    metrics: _metrics
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$c = {};
Object.defineProperty(exports$c, "__esModule", {
    value: true
});
Object.defineProperty(exports$c, "__esModule", {
    value: true
});
exports$c.diag = void 0;
const diag_1 = __require$A ?? _default$B ?? _mod$a;
exports$c.diag = diag_1.DiagAPI.instance();
var _diag = exports$c.diag;
const _default$a = exports$c.default ?? exports$c;
var __require$9 = exports$c;
var __esModule$9 = exports$c.__esModule;
const _mod16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$9,
    __require: __require$9,
    default: _default$a,
    diag: _diag
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$b = {};
Object.defineProperty(exports$b, "__esModule", {
    value: true
});
Object.defineProperty(exports$b, "__esModule", {
    value: true
});
exports$b.context = void 0;
const context_1$1 = __require$x ?? _default$y ?? _mod$8;
exports$b.context = context_1$1.ContextAPI.getInstance();
var _context = exports$b.context;
const _default$9 = exports$b.default ?? exports$b;
var __require$8 = exports$b;
var __esModule$8 = exports$b.__esModule;
const _mod15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$8,
    __require: __require$8,
    context: _context,
    default: _default$9
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$a = {};
Object.defineProperty(exports$a, "__esModule", {
    value: true
});
Object.defineProperty(exports$a, "__esModule", {
    value: true
});
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;

function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
}

exports$a.validateKey = validateKey;

function validateValue(value) {
    return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}

exports$a.validateValue = validateValue;
var _validateKey = exports$a.validateKey;
var _validateValue = exports$a.validateValue;
const _default$8 = exports$a.default ?? exports$a;
var __require$7 = exports$a;
var __esModule$7 = exports$a.__esModule;
const _mod$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$7,
    __require: __require$7,
    default: _default$8,
    validateKey: _validateKey,
    validateValue: _validateValue
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$9 = {};
Object.defineProperty(exports$9, "__esModule", {
    value: true
});
Object.defineProperty(exports$9, "__esModule", {
    value: true
});
exports$9.TraceStateImpl = void 0;
const tracestate_validators_1 = __require$7 ?? _default$8 ?? _mod$1;
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";

class TraceStateImpl {
    constructor(rawTraceState) {
        this._internalState = /* @__PURE__ */ new Map();
        if (rawTraceState) {
            this._parse(rawTraceState);
        }
    }

    set(key, value) {
        const traceState = this._clone();
        if (traceState._internalState.has(key)) {
            traceState._internalState.delete(key);
        }
        traceState._internalState.set(key, value);
        return traceState;
    }

    unset(key) {
        const traceState = this._clone();
        traceState._internalState.delete(key);
        return traceState;
    }

    get(key) {
        return this._internalState.get(key);
    }

    serialize() {
        return this._keys().reduce((agg, key) => {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
            return agg;
        }, []).join(LIST_MEMBERS_SEPARATOR);
    }

    _parse(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN) {
            return;
        }
        this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce((agg, part) => {
            const listMember = part.trim();
            const i2 = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i2 !== -1) {
                const key = listMember.slice(0, i2);
                const value = listMember.slice(i2 + 1, part.length);
                if ((0, tracestate_validators_1.validateKey)(key) && (0, tracestate_validators_1.validateValue)(value)) {
                    agg.set(key, value);
                }
            }
            return agg;
        }, /* @__PURE__ */ new Map());
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
        }
    }

    _keys() {
        return Array.from(this._internalState.keys()).reverse();
    }

    _clone() {
        const traceState = new TraceStateImpl();
        traceState._internalState = new Map(this._internalState);
        return traceState;
    }
}

exports$9.TraceStateImpl = TraceStateImpl;
var _TraceStateImpl = exports$9.TraceStateImpl;
const _default$7 = exports$9.default ?? exports$9;
var __require$6 = exports$9;
var __esModule$6 = exports$9.__esModule;
const _mod = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    TraceStateImpl: _TraceStateImpl,
    __esModule: __esModule$6,
    __require: __require$6,
    default: _default$7
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$8 = {};
Object.defineProperty(exports$8, "__esModule", {
    value: true
});
Object.defineProperty(exports$8, "__esModule", {
    value: true
});
exports$8.createTraceState = void 0;
const tracestate_impl_1 = __require$6 ?? _default$7 ?? _mod;

function createTraceState(rawTraceState) {
    return new tracestate_impl_1.TraceStateImpl(rawTraceState);
}

exports$8.createTraceState = createTraceState;
var _createTraceState = exports$8.createTraceState;
const _default$6 = exports$8.default ?? exports$8;
var __require$5 = exports$8;
var __esModule$5 = exports$8.__esModule;
const _mod12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    __esModule: __esModule$5,
    __require: __require$5,
    createTraceState: _createTraceState,
    default: _default$6
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$7 = {};
Object.defineProperty(exports$7, "__esModule", {
    value: true
});
Object.defineProperty(exports$7, "__esModule", {
    value: true
});
exports$7.SpanStatusCode = void 0;
(function (SpanStatusCode) {
    SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
    SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
    SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(exports$7.SpanStatusCode || (exports$7.SpanStatusCode = {}));
var _SpanStatusCode$1 = exports$7.SpanStatusCode;
const _default$5 = exports$7.default ?? exports$7;
var __require$4 = exports$7;
var __esModule$4 = exports$7.__esModule;
const _mod10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    SpanStatusCode: _SpanStatusCode$1,
    __esModule: __esModule$4,
    __require: __require$4,
    default: _default$5
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$6 = {};
Object.defineProperty(exports$6, "__esModule", {
    value: true
});
Object.defineProperty(exports$6, "__esModule", {
    value: true
});
exports$6.SpanKind = void 0;
(function (SpanKind) {
    SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
    SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
    SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
    SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
    SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(exports$6.SpanKind || (exports$6.SpanKind = {}));
var _SpanKind = exports$6.SpanKind;
const _default$4 = exports$6.default ?? exports$6;
var __require$3 = exports$6;
var __esModule$3 = exports$6.__esModule;
const _mod1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    SpanKind: _SpanKind,
    __esModule: __esModule$3,
    __require: __require$3,
    default: _default$4
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$5 = {};
Object.defineProperty(exports$5, "__esModule", {
    value: true
});
Object.defineProperty(exports$5, "__esModule", {
    value: true
});
exports$5.SamplingDecision = void 0;
(function (SamplingDecision) {
    SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
    SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(exports$5.SamplingDecision || (exports$5.SamplingDecision = {}));
var _SamplingDecision = exports$5.SamplingDecision;
const _default$3 = exports$5.default ?? exports$5;
var __require$2 = exports$5;
var __esModule$2 = exports$5.__esModule;
const _mod0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    SamplingDecision: _SamplingDecision,
    __esModule: __esModule$2,
    __require: __require$2,
    default: _default$3
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$4 = {};
Object.defineProperty(exports$4, "__esModule", {
    value: true
});
Object.defineProperty(exports$4, "__esModule", {
    value: true
});
exports$4.ValueType = void 0;
(function (ValueType) {
    ValueType[ValueType["INT"] = 0] = "INT";
    ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(exports$4.ValueType || (exports$4.ValueType = {}));
var _ValueType = exports$4.ValueType;
const _default$2 = exports$4.default ?? exports$4;
var __require$1 = exports$4;
var __esModule$1 = exports$4.__esModule;
const _mod6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ValueType: _ValueType,
    __esModule: __esModule$1,
    __require: __require$1,
    default: _default$2
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$3 = {};
Object.defineProperty(exports$3, "__esModule", {
    value: true
});
Object.defineProperty(exports$3, "__esModule", {
    value: true
});
exports$3.DiagConsoleLogger = void 0;
const consoleMap = [{
    n: "error",
    c: "error"
}, {
    n: "warn",
    c: "warn"
}, {
    n: "info",
    c: "info"
}, {
    n: "debug",
    c: "debug"
}, {
    n: "verbose",
    c: "trace"
}];

class DiagConsoleLogger {
    constructor() {
        function _consoleFunc(funcName) {
            return function (...args) {
                if (console) {
                    let theFunc = console[funcName];
                    if (typeof theFunc !== "function") {
                        theFunc = console.log;
                    }
                    if (typeof theFunc === "function") {
                        return theFunc.apply(console, args);
                    }
                }
            };
        }

        for (let i2 = 0; i2 < consoleMap.length; i2++) {
            this[consoleMap[i2].n] = _consoleFunc(consoleMap[i2].c);
        }
    }
}

exports$3.DiagConsoleLogger = DiagConsoleLogger;
var _DiagConsoleLogger = exports$3.DiagConsoleLogger;
const _default$1 = exports$3.default ?? exports$3;
var __require = exports$3;
var __esModule = exports$3.__esModule;
const _mod3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DiagConsoleLogger: _DiagConsoleLogger,
    __esModule,
    __require,
    default: _default$1
}, Symbol.toStringTag, {
    value: "Module"
}));
var exports$2 = {};
Object.defineProperty(exports$2, "__esModule", {
    value: true
});
Object.defineProperty(exports$2, "__esModule", {
    value: true
});
var utils_1 = __require$j ?? _default$k ?? _mod$5;
exports$2.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;
var context_1 = __require$z ?? _default$A ?? _mod2$3;
exports$2.createContextKey = context_1.createContextKey;
exports$2.ROOT_CONTEXT = context_1.ROOT_CONTEXT;
var consoleLogger_1 = __require ?? _default$1 ?? _mod3;
exports$2.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
var types_1 = __require$D ?? _default$E ?? _mod4$2;
exports$2.DiagLogLevel = types_1.DiagLogLevel;
var NoopMeter_1 = __require$d ?? _default$e ?? _mod5;
exports$2.createNoopMeter = NoopMeter_1.createNoopMeter;
var Metric_1 = __require$1 ?? _default$2 ?? _mod6;
exports$2.ValueType = Metric_1.ValueType;
var TextMapPropagator_1 = __require$h ?? _default$i ?? _mod7;
exports$2.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports$2.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;
var ProxyTracer_1 = __require$p ?? _default$q ?? _mod8;
exports$2.ProxyTracer = ProxyTracer_1.ProxyTracer;
var ProxyTracerProvider_1 = __require$o ?? _default$p ?? _mod9;
exports$2.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
var SamplingResult_1 = __require$2 ?? _default$3 ?? _mod0;
exports$2.SamplingDecision = SamplingResult_1.SamplingDecision;
var span_kind_1 = __require$3 ?? _default$4 ?? _mod1;
exports$2.SpanKind = span_kind_1.SpanKind;
var status_1 = __require$4 ?? _default$5 ?? _mod10;
exports$2.SpanStatusCode = status_1.SpanStatusCode;
var trace_flags_1 = __require$w ?? _default$x ?? _mod11;
exports$2.TraceFlags = trace_flags_1.TraceFlags;
var utils_2 = __require$5 ?? _default$6 ?? _mod12;
exports$2.createTraceState = utils_2.createTraceState;
var spancontext_utils_1 = __require$s ?? _default$t ?? _mod13;
exports$2.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports$2.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports$2.isValidSpanId = spancontext_utils_1.isValidSpanId;
var invalid_span_constants_1 = __require$v ?? _default$w ?? _mod14;
exports$2.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports$2.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports$2.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;
const context_api_1 = __require$8 ?? _default$9 ?? _mod15;
exports$2.context = context_api_1.context;
const diag_api_1 = __require$9 ?? _default$a ?? _mod16;
exports$2.diag = diag_api_1.diag;
const metrics_api_1 = __require$a ?? _default$b ?? _mod17;
exports$2.metrics = metrics_api_1.metrics;
const propagation_api_1 = __require$e ?? _default$f ?? _mod18;
exports$2.propagation = propagation_api_1.propagation;
const trace_api_1 = __require$m ?? _default$n ?? _mod19;
exports$2.trace = trace_api_1.trace;
exports$2.default = {
    context: context_api_1.context,
    diag: diag_api_1.diag,
    metrics: metrics_api_1.metrics,
    propagation: propagation_api_1.propagation,
    trace: trace_api_1.trace
};
exports$2.baggageEntryMetadataFromString;
exports$2.createContextKey;
exports$2.ROOT_CONTEXT;
exports$2.DiagConsoleLogger;
exports$2.DiagLogLevel;
exports$2.createNoopMeter;
exports$2.ValueType;
exports$2.defaultTextMapGetter;
exports$2.defaultTextMapSetter;
exports$2.ProxyTracer;
exports$2.ProxyTracerProvider;
exports$2.SamplingDecision;
exports$2.SpanKind;
var _SpanStatusCode = exports$2.SpanStatusCode;
exports$2.TraceFlags;
exports$2.createTraceState;
exports$2.isSpanContextValid;
exports$2.isValidTraceId;
exports$2.isValidSpanId;
exports$2.INVALID_SPANID;
exports$2.INVALID_TRACEID;
exports$2.INVALID_SPAN_CONTEXT;
exports$2.context;
exports$2.diag;
exports$2.metrics;
exports$2.propagation;
var _trace = exports$2.trace;
exports$2.default ?? exports$2;
exports$2.__esModule;
let BUILD_ID = "904d23463297ec274c25c3e17ca0cdde39555020";
const DENO_DEPLOYMENT_ID = void 0;

function setBuildId(id) {
    BUILD_ID = id;
}

const {
    Deno: Deno$1
} = globalThis;
const noColor = typeof Deno$1?.noColor === "boolean" ? Deno$1.noColor : false;
let enabled = !noColor;

function code(open, close) {
    return {
        open: `\x1B[${open.join(";")}m`,
        close: `\x1B[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}

function run(str, code2) {
    return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}

function bold(str) {
    return run(str, code([1], 22));
}

function cyan(str) {
    return run(str, code([36], 39));
}

function clampAndTruncate(n2, max = 255, min = 0) {
    return Math.trunc(Math.max(Math.min(n2, max), min));
}

function rgb8(str, color) {
    return run(str, code([38, 5, clampAndTruncate(color)], 39));
}

function bgRgb8(str, color) {
    return run(str, code([48, 5, clampAndTruncate(color)], 49));
}

var n$1, l$7, u$8, t$2, i$4, r$3, o$4, e$2, f$6, c$5, s$6, a$5, h$8, p$6 = {}, v$5 = [],
    y$7 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, w$5 = Array.isArray;

function d$9(n2, l2) {
    for (var u2 in l2) n2[u2] = l2[u2];
    return n2;
}

function g$7(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}

function _$2(l2, u2, t2) {
    var i2, r2, o2, e2 = {};
    for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
    if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$1.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
    return m$7(l2, e2, i2, r2, null);
}

function m$7(n2, t2, i2, r2, o2) {
    var e2 = {
        type: n2,
        props: t2,
        key: i2,
        ref: r2,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: null == o2 ? ++u$8 : o2,
        __i: -1,
        __u: 0
    };
    return null == o2 && null != l$7.vnode && l$7.vnode(e2), e2;
}

function k$2(n2) {
    return n2.children;
}

function x$5(n2, l2) {
    this.props = n2, this.context = l2;
}

function S$1(n2, l2) {
    if (null == l2) return n2.__ ? S$1(n2.__, n2.__i + 1) : null;
    for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
    return "function" == typeof n2.type ? S$1(n2) : null;
}

function C$2(n2) {
    var l2, u2;
    if (null != (n2 = n2.__) && null != n2.__c) {
        for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
            n2.__e = n2.__c.base = u2.__e;
            break;
        }
        return C$2(n2);
    }
}

function M$2(n2) {
    (!n2.__d && (n2.__d = true) && i$4.push(n2) && !$$2.__r++ || r$3 != l$7.debounceRendering) && ((r$3 = l$7.debounceRendering) || o$4)($$2);
}

function $$2() {
    for (var n2, u2, t2, r2, o2, f2, c2, s2 = 1; i$4.length;) i$4.length > s2 && i$4.sort(e$2), n2 = i$4.shift(), s2 = i$4.length, n2.__d && (t2 = void 0, r2 = void 0, o2 = (r2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t2 = d$9({}, r2)).__v = r2.__v + 1, l$7.vnode && l$7.vnode(t2), O$2(u2.__P, t2, r2, u2.__n, u2.__P.namespaceURI, 32 & r2.__u ? [o2] : null, f2, null == o2 ? S$1(r2) : o2, !!(32 & r2.__u), c2), t2.__v = r2.__v, t2.__.__k[t2.__i] = t2, N$1(f2, t2, c2), r2.__e = r2.__ = null, t2.__e != o2 && C$2(t2)));
    $$2.__r = 0;
}

function I$3(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
    var a2, h2, y2, w2, d2, g2, _2, m2 = t2 && t2.__k || v$5, b2 = l2.length;
    for (f2 = P$2(u2, l2, m2, f2, b2), a2 = 0; a2 < b2; a2++) null != (y2 = u2.__k[a2]) && (h2 = -1 == y2.__i ? p$6 : m2[y2.__i] || p$6, y2.__i = a2, g2 = O$2(n2, y2, h2, i2, r2, o2, e2, f2, c2, s2), w2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && B$2(h2.ref, null, y2), s2.push(y2.ref, y2.__c || w2, y2)), null == d2 && null != w2 && (d2 = w2), (_2 = !!(4 & y2.__u)) || h2.__k === y2.__k ? f2 = A$4(y2, f2, n2, _2) : "function" == typeof y2.type && void 0 !== g2 ? f2 = g2 : w2 && (f2 = w2.nextSibling), y2.__u &= -7);
    return u2.__e = d2, f2;
}

function P$2(n2, l2, u2, t2, i2) {
    var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
    for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = m$7(null, o2, null, null, null) : w$5(o2) ? o2 = n2.__k[r2] = m$7(k$2, {
        children: o2
    }, null, null, null) : null == o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = m$7(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, -1 != (c2 = o2.__i = L(o2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
    if (a2) for (r2 = 0; r2 < s2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S$1(e2)), D$4(e2, e2));
    return t2;
}

function A$4(n2, l2, u2, t2) {
    var i2, r2;
    if ("function" == typeof n2.type) {
        for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = A$4(i2[r2], l2, u2, t2));
        return l2;
    }
    n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = S$1(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
    do {
        l2 = l2 && l2.nextSibling;
    } while (null != l2 && 8 == l2.nodeType);
    return l2;
}

function L(n2, l2, u2, t2) {
    var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
    if (null === c2 && null == e2 || s2 && e2 == c2.key && f2 == c2.type) return u2;
    if (t2 > (s2 ? 1 : 0)) {
        for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length;) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
    }
    return -1;
}

function T$2(n2, l2, u2) {
    "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || y$7.test(l2) ? u2 : u2 + "px";
}

function j$4(n2, l2, u2, t2, i2) {
    var r2, o2;
    n: if ("style" == l2) {
        if ("string" == typeof u2) n2.style.cssText = u2;
        else {
            if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || T$2(n2.style, l2, "");
            if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || T$2(n2.style, l2, u2[l2]);
        }
    } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(f$6, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c$5, n2.addEventListener(l2, r2 ? a$5 : s$6, r2)) : n2.removeEventListener(l2, r2 ? a$5 : s$6, r2);
    else {
        if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
            n2[l2] = null == u2 ? "" : u2;
            break n;
        } catch (n3) {
        }
        "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
    }
}

function F$4(n2) {
    return function (u2) {
        if (this.l) {
            var t2 = this.l[u2.type + n2];
            if (null == u2.t) u2.t = c$5++;
            else if (u2.t < t2.u) return;
            return t2(l$7.event ? l$7.event(u2) : u2);
        }
    };
}

function O$2(n2, u2, t2, i2, r2, o2, e2, f2, c2, s2) {
    var a2, h2, p2, v2, y2, _2, m2, b2, S2, C2, M2, $2, P2, A2, H2, L2, T2, j2 = u2.type;
    if (null != u2.constructor) return null;
    128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (a2 = l$7.__b) && a2(u2);
    n: if ("function" == typeof j2) try {
        if (b2 = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t2.__c ? m2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b2, M2) : (u2.__c = h2 = new x$5(b2, M2), h2.constructor = j2, h2.render = E$3), C2 && C2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && null == h2.__s && (h2.__s = h2.state), S2 && null != j2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = d$9({}, h2.__s)), d$9(h2.__s, j2.getDerivedStateFromProps(b2, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) S2 && null == j2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), S2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
        else {
            if (S2 && null == j2.getDerivedStateFromProps && b2 !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(b2, M2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(b2, h2.__s, M2)) {
                for (u2.__v != t2.__v && (h2.props = b2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function (n3) {
                    n3 && (n3.__ = u2);
                }), $2 = 0; $2 < h2._sb.length; $2++) h2.__h.push(h2._sb[$2]);
                h2._sb = [], h2.__h.length && e2.push(h2);
                break n;
            }
            null != h2.componentWillUpdate && h2.componentWillUpdate(b2, h2.__s, M2), S2 && null != h2.componentDidUpdate && h2.__h.push(function () {
                h2.componentDidUpdate(v2, y2, _2);
            });
        }
        if (h2.context = M2, h2.props = b2, h2.__P = n2, h2.__e = false, P2 = l$7.__r, A2 = 0, S2) {
            for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H2 = 0; H2 < h2._sb.length; H2++) h2.__h.push(h2._sb[H2]);
            h2._sb = [];
        } else do {
            h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
        } while (h2.__d && ++A2 < 25);
        h2.state = h2.__s, null != h2.getChildContext && (i2 = d$9(d$9({}, i2), h2.getChildContext())), S2 && !p2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(v2, y2)), L2 = a2, null != a2 && a2.type === k$2 && null == a2.key && (L2 = V$2(a2.props.children)), f2 = I$3(n2, w$5(L2) ? L2 : [L2], u2, t2, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
    } catch (n3) {
        if (u2.__v = null, c2 || null != o2) {
            if (n3.then) {
                for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling;) f2 = f2.nextSibling;
                o2[o2.indexOf(f2)] = null, u2.__e = f2;
            } else {
                for (T2 = o2.length; T2--;) g$7(o2[T2]);
                z$2(u2);
            }
        } else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || z$2(u2);
        l$7.__e(n3, u2, t2);
    }
    else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = q$2(t2.__e, u2, t2, i2, r2, o2, e2, c2, s2);
    return (a2 = l$7.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
}

function z$2(n2) {
    n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z$2);
}

function N$1(n2, u2, t2) {
    for (var i2 = 0; i2 < t2.length; i2++) B$2(t2[i2], t2[++i2], t2[++i2]);
    l$7.__c && l$7.__c(u2, n2), n2.some(function (u3) {
        try {
            n2 = u3.__h, u3.__h = [], n2.some(function (n3) {
                n3.call(u3);
            });
        } catch (n3) {
            l$7.__e(n3, u3.__v);
        }
    });
}

function V$2(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : w$5(n2) ? n2.map(V$2) : d$9({}, n2);
}

function q$2(u2, t2, i2, r2, o2, e2, f2, c2, s2) {
    var a2, h2, v2, y2, d2, _2, m2, b2 = i2.props || p$6, k2 = t2.props, x2 = t2.type;
    if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
        for (a2 = 0; a2 < e2.length; a2++) if ((d2 = e2[a2]) && "setAttribute" in d2 == !!x2 && (x2 ? d2.localName == x2 : 3 == d2.nodeType)) {
            u2 = d2, e2[a2] = null;
            break;
        }
    }
    if (null == u2) {
        if (null == x2) return document.createTextNode(k2);
        u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$7.__m && l$7.__m(t2, e2), c2 = false), e2 = null;
    }
    if (null == x2) b2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
    else {
        if (e2 = e2 && n$1.call(u2.childNodes), !c2 && null != e2) for (b2 = {}, a2 = 0; a2 < u2.attributes.length; a2++) b2[(d2 = u2.attributes[a2]).name] = d2.value;
        for (a2 in b2) if (d2 = b2[a2], "children" == a2) ;
        else if ("dangerouslySetInnerHTML" == a2) v2 = d2;
        else if (!(a2 in k2)) {
            if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
            j$4(u2, a2, null, d2, o2);
        }
        for (a2 in k2) d2 = k2[a2], "children" == a2 ? y2 = d2 : "dangerouslySetInnerHTML" == a2 ? h2 = d2 : "value" == a2 ? _2 = d2 : "checked" == a2 ? m2 = d2 : c2 && "function" != typeof d2 || b2[a2] === d2 || j$4(u2, a2, d2, b2[a2], o2);
        if (h2) c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
        else if (v2 && (u2.innerHTML = ""), I$3("template" == t2.type ? u2.content : u2, w$5(y2) ? y2 : [y2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && S$1(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--;) g$7(e2[a2]);
        c2 || (a2 = "value", "progress" == x2 && null == _2 ? u2.removeAttribute("value") : null != _2 && (_2 !== u2[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b2[a2]) && j$4(u2, a2, _2, b2[a2], o2), a2 = "checked", null != m2 && m2 != u2[a2] && j$4(u2, a2, m2, b2[a2], o2));
    }
    return u2;
}

function B$2(n2, u2, t2) {
    try {
        if ("function" == typeof n2) {
            var i2 = "function" == typeof n2.__u;
            i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
        } else n2.current = u2;
    } catch (n3) {
        l$7.__e(n3, t2);
    }
}

function D$4(n2, u2, t2) {
    var i2, r2;
    if (l$7.unmount && l$7.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || B$2(i2, null, u2)), null != (i2 = n2.__c)) {
        if (i2.componentWillUnmount) try {
            i2.componentWillUnmount();
        } catch (n3) {
            l$7.__e(n3, u2);
        }
        i2.base = i2.__P = null;
    }
    if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && D$4(i2[r2], u2, t2 || "function" != typeof n2.type);
    t2 || g$7(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}

function E$3(n2, l2, u2) {
    return this.constructor(n2, u2);
}

function Q(n2) {
    function l2(n3) {
        var u2, t2;
        return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function () {
            return t2;
        }, this.componentWillUnmount = function () {
            u2 = null;
        }, this.shouldComponentUpdate = function (n4) {
            this.props.value != n4.value && u2.forEach(function (n5) {
                n5.__e = true, M$2(n5);
            });
        }, this.sub = function (n4) {
            u2.add(n4);
            var l3 = n4.componentWillUnmount;
            n4.componentWillUnmount = function () {
                u2 && u2.delete(n4), l3 && l3.call(n4);
            };
        }), n3.children;
    }

    return l2.__c = "__cC" + h$8++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function (n3, l3) {
        return n3.children(l3);
    }).contextType = l2, l2;
}

n$1 = v$5.slice, l$7 = {
    __e: function (n2, l2, u2, t2) {
        for (var i2, r2, o2; l2 = l2.__;) if ((i2 = l2.__c) && !i2.__) try {
            if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
        } catch (l3) {
            n2 = l3;
        }
        throw n2;
    }
}, u$8 = 0, t$2 = function (n2) {
    return null != n2 && null == n2.constructor;
}, x$5.prototype.setState = function (n2, l2) {
    var u2;
    u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = d$9({}, this.state), "function" == typeof n2 && (n2 = n2(d$9({}, u2), this.props)), n2 && d$9(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M$2(this));
}, x$5.prototype.forceUpdate = function (n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), M$2(this));
}, x$5.prototype.render = k$2, i$4 = [], o$4 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$2 = function (n2, l2) {
    return n2.__v.__b - l2.__v.__b;
}, $$2.__r = 0, f$6 = /(PointerCapture)$|Capture$/i, c$5 = 0, s$6 = F$4(false), a$5 = F$4(true), h$8 = 0;
var t$1 = /["&<]/;

function n(r2) {
    if (0 === r2.length || false === t$1.test(r2)) return r2;
    for (var e2 = 0, n2 = 0, o2 = "", f2 = ""; n2 < r2.length; n2++) {
        switch (r2.charCodeAt(n2)) {
            case 34:
                f2 = "&quot;";
                break;
            case 38:
                f2 = "&amp;";
                break;
            case 60:
                f2 = "&lt;";
                break;
            default:
                continue;
        }
        n2 !== e2 && (o2 += r2.slice(e2, n2)), o2 += f2, e2 = n2 + 1;
    }
    return n2 !== e2 && (o2 += r2.slice(e2, n2)), o2;
}

var o$3 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, f$5 = 0, i$3 = Array.isArray;

function u$7(e2, t2, n2, o2, i2, u2) {
    t2 || (t2 = {});
    var a2, c2, p2 = t2;
    if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
    var l2 = {
        type: e2,
        props: p2,
        key: n2,
        ref: a2,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: --f$5,
        __i: -1,
        __u: 0,
        __source: i2,
        __self: u2
    };
    if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
    return l$7.vnode && l$7.vnode(l2), l2;
}

function a$4(r2) {
    var t2 = u$7(k$2, {
        tpl: r2,
        exprs: [].slice.call(arguments, 1)
    });
    return t2.key = t2.__v, t2;
}

var c$4 = {}, p$5 = /[A-Z]/g;

function l$6(e2, t2) {
    if (l$7.attr) {
        var f2 = l$7.attr(e2, t2);
        if ("string" == typeof f2) return f2;
    }
    if (t2 = (function (r2) {
        return null !== r2 && "object" == typeof r2 && "function" == typeof r2.valueOf ? r2.valueOf() : r2;
    })(t2), "ref" === e2 || "key" === e2) return "";
    if ("style" === e2 && "object" == typeof t2) {
        var i2 = "";
        for (var u2 in t2) {
            var a2 = t2[u2];
            if (null != a2 && "" !== a2) {
                var l2 = "-" == u2[0] ? u2 : c$4[u2] || (c$4[u2] = u2.replace(p$5, "-$&").toLowerCase()), s2 = ";";
                "number" != typeof a2 || l2.startsWith("--") || o$3.test(l2) || (s2 = "px;"), i2 = i2 + l2 + ":" + a2 + s2;
            }
        }
        return e2 + '="' + n(i2) + '"';
    }
    return null == t2 || false === t2 || "function" == typeof t2 || "object" == typeof t2 ? "" : true === t2 ? e2 : e2 + '="' + n("" + t2) + '"';
}

function s$5(r2) {
    if (null == r2 || "boolean" == typeof r2 || "function" == typeof r2) return null;
    if ("object" == typeof r2) {
        if (void 0 === r2.constructor) return r2;
        if (i$3(r2)) {
            for (var e2 = 0; e2 < r2.length; e2++) r2[e2] = s$5(r2[e2]);
            return r2;
        }
    }
    return n("" + r2);
}

const INTERNAL_PREFIX = "/_frsh";
const DEV_ERROR_OVERLAY_URL = `${INTERNAL_PREFIX}/error_overlay`;
const PARTIAL_SEARCH_PARAM = "fresh-partial";
const ASSET_CACHE_BUST_KEY = "__frsh_c";
const DATA_CURRENT = "data-current";
const DATA_ANCESTOR = "data-ancestor";
const DATA_FRESH_KEY = "data-frsh-key";
const CLIENT_NAV_ATTR = "f-client-nav";
var OptionsType = /* @__PURE__ */ (function (OptionsType2) {
    OptionsType2["ATTR"] = "attr";
    OptionsType2["VNODE"] = "vnode";
    OptionsType2["HOOK"] = "__h";
    OptionsType2["DIFF"] = "__b";
    OptionsType2["RENDER"] = "__r";
    OptionsType2["DIFFED"] = "diffed";
    OptionsType2["ERROR"] = "__e";
    return OptionsType2;
})({});

function matchesUrl(current, needle) {
    let href = new URL(needle, "http://localhost").pathname;
    if (href !== "/" && href.endsWith("/")) {
        href = href.slice(0, -1);
    }
    if (current !== "/" && current.endsWith("/")) {
        current = current.slice(0, -1);
    }
    if (current === href) {
        return 2;
    } else if (current.startsWith(href + "/") || href === "/") {
        return 1;
    }
    return 0;
}

function setActiveUrl(vnode, pathname) {
    const props = vnode.props;
    const hrefProp = props.href;
    if (typeof hrefProp === "string" && hrefProp.startsWith("/")) {
        const match = matchesUrl(pathname, hrefProp);
        if (match === 2) {
            props[DATA_CURRENT] = "true";
            props["aria-current"] = "page";
        } else if (match === 1) {
            props[DATA_ANCESTOR] = "true";
            props["aria-current"] = "true";
        }
    }
}

var PartialMode = /* @__PURE__ */ (function (PartialMode2) {
    PartialMode2[PartialMode2["Replace"] = 0] = "Replace";
    PartialMode2[PartialMode2["Append"] = 1] = "Append";
    PartialMode2[PartialMode2["Prepend"] = 2] = "Prepend";
    return PartialMode2;
})({});

function assetInternal(path, buildId) {
    if (!path.startsWith("/") || path.startsWith("//")) return path;
    try {
        const url = new URL(path, "https://freshassetcache.local");
        if (url.protocol !== "https:" || url.host !== "freshassetcache.local" || url.searchParams.has(ASSET_CACHE_BUST_KEY)) {
            return path;
        }
        url.searchParams.set(ASSET_CACHE_BUST_KEY, buildId);
        return url.pathname + url.search + url.hash;
    } catch (err) {
        console.warn(`Failed to create asset() URL, falling back to regular path ('${path}'):`, err);
        return path;
    }
}

function assetSrcSetInternal(srcset, buildId) {
    if (srcset.includes("(")) return srcset;
    const parts = srcset.split(",");
    const constructed = [];
    for (const part of parts) {
        const trimmed = part.trimStart();
        const leadingWhitespace = part.length - trimmed.length;
        if (trimmed === "") return srcset;
        let urlEnd = trimmed.indexOf(" ");
        if (urlEnd === -1) urlEnd = trimmed.length;
        const leading = part.substring(0, leadingWhitespace);
        const url = trimmed.substring(0, urlEnd);
        const trailing = trimmed.substring(urlEnd);
        constructed.push(leading + assetInternal(url, buildId) + trailing);
    }
    return constructed.join(",");
}

function assetHashingHook(vnode, buildId) {
    if (vnode.type === "img" || vnode.type === "source") {
        const {
            props
        } = vnode;
        if (props["data-fresh-disable-lock"]) return;
        if (typeof props.src === "string") {
            props.src = assetInternal(props.src, buildId);
        }
        if (typeof props.srcset === "string") {
            props.srcset = assetSrcSetInternal(props.srcset, buildId);
        }
    }
}

const HeadContext = Q(false);

function asset(path) {
    return assetInternal(path, BUILD_ID);
}

function Partial(props) {
    return props.children;
}

Partial.displayName = "Partial";
const UNDEFINED = -1;
const NULL = -2;
const NAN = -3;
const INFINITY_POS = -4;
const INFINITY_NEG = -5;
const ZERO_NEG = -6;
const HOLE = -7;

function stringify(data, custom) {
    const out = [];
    const indexes = /* @__PURE__ */ new Map();
    const res = serializeInner(out, indexes, data, custom);
    if (res < 0) {
        return String(res);
    }
    return `[${out.join(",")}]`;
}

function serializeInner(out, indexes, value, custom) {
    const seenIdx = indexes.get(value);
    if (seenIdx !== void 0) return seenIdx;
    if (value === void 0) return UNDEFINED;
    if (value === null) return NULL;
    if (Number.isNaN(value)) return NAN;
    if (value === Infinity) return INFINITY_POS;
    if (value === -Infinity) return INFINITY_NEG;
    if (value === 0 && 1 / value < 0) return ZERO_NEG;
    const idx = out.length;
    out.push("");
    indexes.set(value, idx);
    let str = "";
    if (typeof value === "number") {
        str += String(value);
    } else if (typeof value === "boolean") {
        str += String(value);
    } else if (typeof value === "bigint") {
        str += `["BigInt","${value}"]`;
    } else if (typeof value === "string") {
        str += JSON.stringify(value);
    } else if (Array.isArray(value)) {
        str += "[";
        for (let i2 = 0; i2 < value.length; i2++) {
            if (i2 in value) {
                str += serializeInner(out, indexes, value[i2], custom);
            } else {
                str += HOLE;
            }
            if (i2 < value.length - 1) {
                str += ",";
            }
        }
        str += "]";
    } else if (typeof value === "object") {
        if (custom !== void 0) {
            for (const k2 in custom) {
                const fn = custom[k2];
                if (fn === void 0) continue;
                const res = fn(value);
                if (res === void 0) continue;
                const innerIdx = serializeInner(out, indexes, res.value, custom);
                str = `["${k2}",${innerIdx}]`;
                out[idx] = str;
                return idx;
            }
        }
        if (value instanceof URL) {
            str += `["URL","${value.href}"]`;
        } else if (value instanceof Date) {
            str += `["Date","${value.toISOString()}"]`;
        } else if (value instanceof RegExp) {
            str += `["RegExp",${JSON.stringify(value.source)}, "${value.flags}"]`;
        } else if (value instanceof Uint8Array) {
            str += `["Uint8Array","${b64encode(value.buffer)}"]`;
        } else if (value instanceof Set) {
            const items = new Array(value.size);
            let i2 = 0;
            value.forEach((v2) => {
                items[i2++] = serializeInner(out, indexes, v2, custom);
            });
            str += `["Set",[${items.join(",")}]]`;
        } else if (value instanceof Map) {
            const items = new Array(value.size * 2);
            let i2 = 0;
            value.forEach((v2, k2) => {
                items[i2++] = serializeInner(out, indexes, k2, custom);
                items[i2++] = serializeInner(out, indexes, v2, custom);
            });
            str += `["Map",[${items.join(",")}]]`;
        } else {
            str += "{";
            const keys = Object.keys(value);
            for (let i2 = 0; i2 < keys.length; i2++) {
                const key = keys[i2];
                str += JSON.stringify(key) + ":";
                str += serializeInner(out, indexes, value[key], custom);
                if (i2 < keys.length - 1) {
                    str += ",";
                }
            }
            str += "}";
        }
    } else if (typeof value === "function") {
        throw new Error(`Serializing functions is not supported.`);
    }
    out[idx] = str;
    return idx;
}

const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];

function b64encode(buffer) {
    const uint8 = new Uint8Array(buffer);
    let result = "", i2;
    const l2 = uint8.length;
    for (i2 = 2; i2 < l2; i2 += 3) {
        result += base64abc[uint8[i2 - 2] >> 2];
        result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
        result += base64abc[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
        result += base64abc[uint8[i2] & 63];
    }
    if (i2 === l2 + 1) {
        result += base64abc[uint8[i2 - 2] >> 2];
        result += base64abc[(uint8[i2 - 2] & 3) << 4];
        result += "==";
    }
    if (i2 === l2) {
        result += base64abc[uint8[i2 - 2] >> 2];
        result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
        result += base64abc[(uint8[i2 - 1] & 15) << 2];
        result += "=";
    }
    return result;
}

const rawToEntityEntries = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
Object.fromEntries([...rawToEntityEntries.map(([raw, entity]) => [entity, raw]), ["&apos;", "'"], ["&nbsp;", " "]]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");

function escape(str) {
    return str.replaceAll(rawRe, (m2) => rawToEntity.get(m2));
}

const STATUS_CODE = {
    /** RFC 7231, 6.2.1 */
    Continue: 100,
    /** RFC 7231, 6.2.2 */
    SwitchingProtocols: 101,
    /** RFC 2518, 10.1 */
    Processing: 102,
    /** RFC 8297 **/
    EarlyHints: 103,
    /** RFC 7231, 6.3.1 */
    OK: 200,
    /** RFC 7231, 6.3.2 */
    Created: 201,
    /** RFC 7231, 6.3.3 */
    Accepted: 202,
    /** RFC 7231, 6.3.4 */
    NonAuthoritativeInfo: 203,
    /** RFC 7231, 6.3.5 */
    NoContent: 204,
    /** RFC 7231, 6.3.6 */
    ResetContent: 205,
    /** RFC 7233, 4.1 */
    PartialContent: 206,
    /** RFC 4918, 11.1 */
    MultiStatus: 207,
    /** RFC 5842, 7.1 */
    AlreadyReported: 208,
    /** RFC 3229, 10.4.1 */
    IMUsed: 226,
    /** RFC 7231, 6.4.1 */
    MultipleChoices: 300,
    /** RFC 7231, 6.4.2 */
    MovedPermanently: 301,
    /** RFC 7231, 6.4.3 */
    Found: 302,
    /** RFC 7231, 6.4.4 */
    SeeOther: 303,
    /** RFC 7232, 4.1 */
    NotModified: 304,
    /** RFC 7231, 6.4.5 */
    UseProxy: 305,
    /** RFC 7231, 6.4.7 */
    TemporaryRedirect: 307,
    /** RFC 7538, 3 */
    PermanentRedirect: 308,
    /** RFC 7231, 6.5.1 */
    BadRequest: 400,
    /** RFC 7235, 3.1 */
    Unauthorized: 401,
    /** RFC 7231, 6.5.2 */
    PaymentRequired: 402,
    /** RFC 7231, 6.5.3 */
    Forbidden: 403,
    /** RFC 7231, 6.5.4 */
    NotFound: 404,
    /** RFC 7231, 6.5.5 */
    MethodNotAllowed: 405,
    /** RFC 7231, 6.5.6 */
    NotAcceptable: 406,
    /** RFC 7235, 3.2 */
    ProxyAuthRequired: 407,
    /** RFC 7231, 6.5.7 */
    RequestTimeout: 408,
    /** RFC 7231, 6.5.8 */
    Conflict: 409,
    /** RFC 7231, 6.5.9 */
    Gone: 410,
    /** RFC 7231, 6.5.10 */
    LengthRequired: 411,
    /** RFC 7232, 4.2 */
    PreconditionFailed: 412,
    /** RFC 7231, 6.5.11 */
    ContentTooLarge: 413,
    /** RFC 7231, 6.5.12 */
    URITooLong: 414,
    /** RFC 7231, 6.5.13 */
    UnsupportedMediaType: 415,
    /** RFC 7233, 4.4 */
    RangeNotSatisfiable: 416,
    /** RFC 7231, 6.5.14 */
    ExpectationFailed: 417,
    /** RFC 7168, 2.3.3 */
    Teapot: 418,
    /** RFC 7540, 9.1.2 */
    MisdirectedRequest: 421,
    /** RFC 4918, 11.2 */
    UnprocessableEntity: 422,
    /** RFC 4918, 11.3 */
    Locked: 423,
    /** RFC 4918, 11.4 */
    FailedDependency: 424,
    /** RFC 8470, 5.2 */
    TooEarly: 425,
    /** RFC 7231, 6.5.15 */
    UpgradeRequired: 426,
    /** RFC 6585, 3 */
    PreconditionRequired: 428,
    /** RFC 6585, 4 */
    TooManyRequests: 429,
    /** RFC 6585, 5 */
    RequestHeaderFieldsTooLarge: 431,
    /** RFC 7725, 3 */
    UnavailableForLegalReasons: 451,
    /** RFC 7231, 6.6.1 */
    InternalServerError: 500,
    /** RFC 7231, 6.6.2 */
    NotImplemented: 501,
    /** RFC 7231, 6.6.3 */
    BadGateway: 502,
    /** RFC 7231, 6.6.4 */
    ServiceUnavailable: 503,
    /** RFC 7231, 6.6.5 */
    GatewayTimeout: 504,
    /** RFC 7231, 6.6.6 */
    HTTPVersionNotSupported: 505,
    /** RFC 2295, 8.1 */
    VariantAlsoNegotiates: 506,
    /** RFC 4918, 11.5 */
    InsufficientStorage: 507,
    /** RFC 5842, 7.2 */
    LoopDetected: 508,
    /** RFC 2774, 7 */
    NotExtended: 510,
    /** RFC 6585, 6 */
    NetworkAuthenticationRequired: 511
};
const STATUS_TEXT = {
    [STATUS_CODE.Accepted]: "Accepted",
    [STATUS_CODE.AlreadyReported]: "Already Reported",
    [STATUS_CODE.BadGateway]: "Bad Gateway",
    [STATUS_CODE.BadRequest]: "Bad Request",
    [STATUS_CODE.Conflict]: "Conflict",
    [STATUS_CODE.Continue]: "Continue",
    [STATUS_CODE.Created]: "Created",
    [STATUS_CODE.EarlyHints]: "Early Hints",
    [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
    [STATUS_CODE.FailedDependency]: "Failed Dependency",
    [STATUS_CODE.Forbidden]: "Forbidden",
    [STATUS_CODE.Found]: "Found",
    [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
    [STATUS_CODE.Gone]: "Gone",
    [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
    [STATUS_CODE.IMUsed]: "IM Used",
    [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
    [STATUS_CODE.InternalServerError]: "Internal Server Error",
    [STATUS_CODE.LengthRequired]: "Length Required",
    [STATUS_CODE.Locked]: "Locked",
    [STATUS_CODE.LoopDetected]: "Loop Detected",
    [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
    [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
    [STATUS_CODE.MovedPermanently]: "Moved Permanently",
    [STATUS_CODE.MultiStatus]: "Multi Status",
    [STATUS_CODE.MultipleChoices]: "Multiple Choices",
    [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
    [STATUS_CODE.NoContent]: "No Content",
    [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
    [STATUS_CODE.NotAcceptable]: "Not Acceptable",
    [STATUS_CODE.NotExtended]: "Not Extended",
    [STATUS_CODE.NotFound]: "Not Found",
    [STATUS_CODE.NotImplemented]: "Not Implemented",
    [STATUS_CODE.NotModified]: "Not Modified",
    [STATUS_CODE.OK]: "OK",
    [STATUS_CODE.PartialContent]: "Partial Content",
    [STATUS_CODE.PaymentRequired]: "Payment Required",
    [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
    [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
    [STATUS_CODE.PreconditionRequired]: "Precondition Required",
    [STATUS_CODE.Processing]: "Processing",
    [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
    [STATUS_CODE.ContentTooLarge]: "Content Too Large",
    [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
    [STATUS_CODE.RequestTimeout]: "Request Timeout",
    [STATUS_CODE.URITooLong]: "URI Too Long",
    [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
    [STATUS_CODE.ResetContent]: "Reset Content",
    [STATUS_CODE.SeeOther]: "See Other",
    [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
    [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
    [STATUS_CODE.Teapot]: "I'm a teapot",
    [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
    [STATUS_CODE.TooEarly]: "Too Early",
    [STATUS_CODE.TooManyRequests]: "Too Many Requests",
    [STATUS_CODE.Unauthorized]: "Unauthorized",
    [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
    [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
    [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
    [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
    [STATUS_CODE.UseProxy]: "Use Proxy",
    [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates"
};

class HttpError extends Error {
    /**
     * The HTTP status code.
     *
     * @example Basic usage
     * ```ts
     * import { App, HttpError } from "fresh";
     * import { expect } from "@std/expect";
     *
     * const app = new App()
     *   .get("/", () => new Response("ok"))
     *   .get("/not-found", () => {
     *      throw new HttpError(404, "Nothing here");
     *    });
     *
     * const handler = app.handler();
     *
     * try {
     *   await handler(new Request("http://localhost/not-found"))
     * } catch (error) {
     *   expect(error).toBeInstanceOf(HttpError);
     *   expect(error.status).toBe(404);
     *   expect(error.message).toBe("Nothing here");
     * }
     * ```
     */
    status;

    /**
     * Constructs a new instance.
     *
     * @param status The HTTP status code.
     * @param message The error message. Defaults to the status text of the given
     * status code.
     * @param options Optional error options.
     */
    constructor(status, message = STATUS_TEXT[status], options2) {
        super(message, options2);
        this.name = this.constructor.name;
        this.status = status;
    }
}

function tabs2Spaces(str) {
    return str.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
}

function createCodeFrame(text, lineNum, columnNum) {
    const before = 2;
    const after = 3;
    const lines = text.split("\n");
    if (lines.length <= lineNum || lines[lineNum].length < columnNum) {
        return;
    }
    const start = Math.max(0, lineNum - before);
    const end = Math.min(lines.length, lineNum + after + 1);
    const maxLineNum = String(end).length;
    const padding = " ".repeat(maxLineNum);
    const spaceLines = [];
    let maxLineLen = 0;
    for (let i2 = start; i2 < end; i2++) {
        const line = tabs2Spaces(lines[i2]);
        spaceLines.push(line);
        if (line.length > maxLineLen) maxLineLen = line.length;
    }
    const activeLine = spaceLines[lineNum - start];
    const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
    const sep = "|";
    let out = "";
    for (let i2 = 0; i2 < spaceLines.length; i2++) {
        const line = spaceLines[i2];
        const currentLine = (padding + (i2 + start + 1)).slice(-maxLineNum);
        if (i2 === lineNum - start) {
            out += `> ${currentLine} ${sep} ${line}
`;
            const columnMarker = "^";
            out += `  ${padding} ${sep} ${" ".repeat(count)}${columnMarker}
`;
        } else {
            out += `  ${currentLine} ${sep} ${line}
`;
        }
    }
    return out;
}

const STACK_FRAME = /^\s*at\s+(?:(.*)\s+)?\((.*):(\d+):(\d+)\)$/;

function getFirstUserFile(stack, rootDir) {
    const lines = stack.split("\n");
    for (let i2 = 0; i2 < lines.length; i2++) {
        const match = lines[i2].match(STACK_FRAME);
        if (match) {
            const fnName = match[1] ?? "";
            const file = match[2];
            const line = +match[3];
            const column = +match[4];
            if (file.startsWith("file://")) {
                const filePath = fromFileUrl(file);
                if (relative(rootDir, filePath).startsWith(".")) {
                    continue;
                }
                return {
                    fnName,
                    file,
                    line,
                    column
                };
            }
        }
    }
}

function getCodeFrame(stack, rootDir) {
    const file = getFirstUserFile(stack, rootDir);
    if (file) {
        try {
            const filePath = fromFileUrl(file.file);
            const text = Deno.readTextFileSync(filePath);
            return createCodeFrame(text, file.line - 1, file.column - 1);
        } catch {
        }
    }
}

const SCRIPT_ESCAPE = /<\/(style|script)/gi;
const COMMENT_ESCAPE = /<!--/gi;

function escapeScript(content, options2 = {}) {
    return content.replaceAll(SCRIPT_ESCAPE, "<\\/$1").replaceAll(COMMENT_ESCAPE, options2.json ? "\\u003C!--" : "\\x3C!--");
}

class UniqueNamer {
    #seen = /* @__PURE__ */ new Map();

    getUniqueName(name) {
        name = name.replaceAll(/([^A-Za-z0-9_$]+)/g, "_");
        if (/^\d/.test(name) || JS_RESERVED.has(name)) {
            name = "_" + name;
        }
        const count = this.#seen.get(name);
        if (count === void 0) {
            this.#seen.set(name, 1);
        } else {
            this.#seen.set(name, count + 1);
            name = `${name}_${count}`;
        }
        return name;
    }
}

const JS_RESERVED = /* @__PURE__ */ new Set([
    // Reserved keywords
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "let",
    "static",
    "yield",
    "await",
    "enum",
    "implements",
    "interface",
    "package",
    "private",
    "protected",
    "public",
    "abstract",
    "boolean",
    "byte",
    "char",
    "double",
    "final",
    "float",
    "goto",
    "int",
    "long",
    "native",
    "short",
    "synchronized",
    "throws",
    "transient",
    "volatile",
    "arguments",
    "as",
    "async",
    "eval",
    "from",
    "get",
    "of",
    "set",
    // JavaScript built-in objects that could cause shadowing bugs
    "Array",
    "ArrayBuffer",
    "Boolean",
    "DataView",
    "Date",
    "Error",
    "EvalError",
    "Float32Array",
    "Float64Array",
    "Function",
    "Infinity",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Intl",
    "JSON",
    "Map",
    "Math",
    "NaN",
    "Number",
    "Object",
    "Promise",
    "Proxy",
    "RangeError",
    "ReferenceError",
    "Reflect",
    "RegExp",
    "Set",
    "String",
    "Symbol",
    "SyntaxError",
    "TypeError",
    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "URIError",
    "WeakMap",
    "WeakSet",
    "BigInt",
    "BigInt64Array",
    "BigUint64Array",
    // Web APIs commonly used in islands
    "console",
    "fetch",
    "Request",
    "Response",
    "Headers",
    "URL",
    "URLSearchParams",
    "Event",
    "EventTarget",
    "AbortController",
    "AbortSignal",
    "FormData",
    "Blob",
    "File",
    "FileReader",
    "TextEncoder",
    "TextDecoder",
    "ReadableStream",
    "WritableStream",
    "TransformStream",
    "WebSocket",
    "Worker",
    "MessageChannel",
    "MessagePort",
    "BroadcastChannel",
    "crypto",
    "atob",
    "btoa",
    "setTimeout",
    "setInterval",
    "clearTimeout",
    "clearInterval",
    "queueMicrotask",
    "structuredClone",
    // Browser-specific globals
    "document",
    "window",
    "navigator",
    "location",
    "history",
    "localStorage",
    "sessionStorage",
    // Deno-specific globals
    "Deno",
    // Node.js compatibility globals (for Deno's Node compat mode)
    "process",
    "global",
    "Buffer"
]);

function isLazy(value) {
    return typeof value === "function";
}

var t, r$2, u$6, i$2, o$2 = 0, f$4 = [], c$3 = l$7, e$1 = c$3.__b, a$3 = c$3.__r, v$4 = c$3.diffed, l$5 = c$3.__c,
    m$6 = c$3.unmount, s$4 = c$3.__;

function p$4(n2, t2) {
    c$3.__h && c$3.__h(r$2, n2, o$2 || t2), o$2 = 0;
    var u2 = r$2.__H || (r$2.__H = {
        __: [],
        __h: []
    });
    return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}

function d$8(n2) {
    return o$2 = 1, h$7(D$3, n2);
}

function h$7(n2, u2, i2) {
    var o2 = p$4(t++, 2);
    if (o2.t = n2, !o2.__c && (o2.__ = [D$3(void 0, u2), function (n3) {
        var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
        t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
    }], o2.__c = r$2, !r$2.__f)) {
        var f2 = function (n3, t2, r2) {
            if (!o2.__c.__H) return true;
            var u3 = o2.__c.__H.__.filter(function (n4) {
                return !!n4.__c;
            });
            if (u3.every(function (n4) {
                return !n4.__N;
            })) return !c2 || c2.call(this, n3, t2, r2);
            var i3 = o2.__c.props !== n3;
            return u3.forEach(function (n4) {
                if (n4.__N) {
                    var t3 = n4.__[0];
                    n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
                }
            }), c2 && c2.call(this, n3, t2, r2) || i3;
        };
        r$2.__f = true;
        var c2 = r$2.shouldComponentUpdate, e2 = r$2.componentWillUpdate;
        r$2.componentWillUpdate = function (n3, t2, r2) {
            if (this.__e) {
                var u3 = c2;
                c2 = void 0, f2(n3, t2, r2), c2 = u3;
            }
            e2 && e2.call(this, n3, t2, r2);
        }, r$2.shouldComponentUpdate = f2;
    }
    return o2.__N || o2.__;
}

function y$6(n2, u2) {
    var i2 = p$4(t++, 3);
    !c$3.__s && C$1(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$2.__H.__h.push(i2));
}

function x$4(n2) {
    var u2 = r$2.context[n2.__c], i2 = p$4(t++, 9);
    return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r$2)), u2.props.value) : n2.__;
}

function j$3() {
    for (var n2; n2 = f$4.shift();) if (n2.__P && n2.__H) try {
        n2.__H.__h.forEach(z$1), n2.__H.__h.forEach(B$1), n2.__H.__h = [];
    } catch (t2) {
        n2.__H.__h = [], c$3.__e(t2, n2.__v);
    }
}

c$3.__b = function (n2) {
    r$2 = null, e$1 && e$1(n2);
}, c$3.__ = function (n2, t2) {
    n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s$4 && s$4(n2, t2);
}, c$3.__r = function (n2) {
    a$3 && a$3(n2), t = 0;
    var i2 = (r$2 = n2.__c).__H;
    i2 && (u$6 === r$2 ? (i2.__h = [], r$2.__h = [], i2.__.forEach(function (n3) {
        n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i2.__h.forEach(z$1), i2.__h.forEach(B$1), i2.__h = [], t = 0)), u$6 = r$2;
}, c$3.diffed = function (n2) {
    v$4 && v$4(n2);
    var t2 = n2.__c;
    t2 && t2.__H && (t2.__H.__h.length && (1 !== f$4.push(t2) && i$2 === c$3.requestAnimationFrame || ((i$2 = c$3.requestAnimationFrame) || w$4)(j$3)), t2.__H.__.forEach(function (n3) {
        n3.u && (n3.__H = n3.u), n3.u = void 0;
    })), u$6 = r$2 = null;
}, c$3.__c = function (n2, t2) {
    t2.some(function (n3) {
        try {
            n3.__h.forEach(z$1), n3.__h = n3.__h.filter(function (n4) {
                return !n4.__ || B$1(n4);
            });
        } catch (r2) {
            t2.some(function (n4) {
                n4.__h && (n4.__h = []);
            }), t2 = [], c$3.__e(r2, n3.__v);
        }
    }), l$5 && l$5(n2, t2);
}, c$3.unmount = function (n2) {
    m$6 && m$6(n2);
    var t2, r2 = n2.__c;
    r2 && r2.__H && (r2.__H.__.forEach(function (n3) {
        try {
            z$1(n3);
        } catch (n4) {
            t2 = n4;
        }
    }), r2.__H = void 0, t2 && c$3.__e(t2, r2.__v));
};
var k$1 = "function" == typeof requestAnimationFrame;

function w$4(n2) {
    var t2, r2 = function () {
        clearTimeout(u2), k$1 && cancelAnimationFrame(t2), setTimeout(n2);
    }, u2 = setTimeout(r2, 35);
    k$1 && (t2 = requestAnimationFrame(r2));
}

function z$1(n2) {
    var t2 = r$2, u2 = n2.__c;
    "function" == typeof u2 && (n2.__c = void 0, u2()), r$2 = t2;
}

function B$1(n2) {
    var t2 = r$2;
    n2.__c = n2.__(), r$2 = t2;
}

function C$1(n2, t2) {
    return !n2 || n2.length !== t2.length || t2.some(function (t3, r2) {
        return t3 !== n2[r2];
    });
}

function D$3(n2, t2) {
    return "function" == typeof t2 ? t2(n2) : t2;
}

const options = l$7;

class RenderState {
    ctx;
    buildCache;
    partialId;
    nonce;
    partialDepth;
    partialCount;
    error;
    // deno-lint-ignore no-explicit-any
    slots;
    // deno-lint-ignore no-explicit-any
    islandProps;
    islands;
    islandAssets;
    // deno-lint-ignore no-explicit-any
    encounteredPartials;
    owners;
    ownerStack;
    headComponents;
    // TODO: merge into bitmask field
    renderedHtmlTag;
    renderedHtmlBody;
    renderedHtmlHead;
    hasRuntimeScript;

    constructor(ctx, buildCache, partialId) {
        this.ctx = ctx;
        this.buildCache = buildCache;
        this.partialId = partialId;
        this.partialDepth = 0;
        this.partialCount = 0;
        this.error = null;
        this.slots = [];
        this.islandProps = [];
        this.islands = /* @__PURE__ */ new Set();
        this.islandAssets = /* @__PURE__ */ new Set();
        this.encounteredPartials = /* @__PURE__ */ new Set();
        this.owners = /* @__PURE__ */ new Map();
        this.ownerStack = [];
        this.headComponents = /* @__PURE__ */ new Map();
        this.renderedHtmlTag = false;
        this.renderedHtmlBody = false;
        this.renderedHtmlHead = false;
        this.hasRuntimeScript = false;
        this.nonce = crypto.randomUUID().replace(/-/g, "");
    }

    clear() {
        this.islands.clear();
        this.encounteredPartials.clear();
        this.owners.clear();
        this.slots = [];
        this.islandProps = [];
        this.ownerStack = [];
    }
}

let RENDER_STATE = null;

function setRenderState(state) {
    RENDER_STATE = state;
}

const oldVNodeHook = options[OptionsType.VNODE];
options[OptionsType.VNODE] = (vnode) => {
    if (RENDER_STATE !== null) {
        RENDER_STATE.owners.set(vnode, RENDER_STATE.ownerStack.at(-1));
        if (vnode.type === "a") {
            setActiveUrl(vnode, RENDER_STATE.ctx.url.pathname);
        }
    }
    assetHashingHook(vnode, BUILD_ID);
    if (typeof vnode.type === "function") {
        if (vnode.type === Partial) {
            const props = vnode.props;
            const key = normalizeKey(vnode.key);
            const mode = !props.mode || props.mode === "replace" ? PartialMode.Replace : props.mode === "append" ? PartialMode.Append : PartialMode.Prepend;
            props.children = wrapWithMarker(props.children, "partial", `${props.name}:${mode}:${key}`);
        }
    } else if (typeof vnode.type === "string") {
        if (vnode.type === "body") {
            const scripts = _$2(FreshScripts, null);
            if (vnode.props.children == null) {
                vnode.props.children = scripts;
            } else if (Array.isArray(vnode.props.children)) {
                vnode.props.children.push(scripts);
            } else {
                vnode.props.children = [vnode.props.children, scripts];
            }
        }
        if (CLIENT_NAV_ATTR in vnode.props) {
            vnode.props[CLIENT_NAV_ATTR] = String(vnode.props[CLIENT_NAV_ATTR]);
        }
    }
    oldVNodeHook?.(vnode);
};
const oldAttrHook = options[OptionsType.ATTR];
options[OptionsType.ATTR] = (name, value) => {
    if (name === CLIENT_NAV_ATTR) {
        return `${CLIENT_NAV_ATTR}="${String(Boolean(value))}"`;
    } else if (name === "key") {
        return `${DATA_FRESH_KEY}="${escape(String(value))}"`;
    }
    return oldAttrHook?.(name, value);
};
const PATCHED = /* @__PURE__ */ new WeakSet();

function normalizeKey(key) {
    const value = key ?? "";
    const s2 = typeof value !== "string" ? String(value) : value;
    return s2.replaceAll(":", "_");
}

const oldDiff = options[OptionsType.DIFF];
options[OptionsType.DIFF] = (vnode) => {
    if (RENDER_STATE !== null) {
        patcher: if (typeof vnode.type === "function" && vnode.type !== k$2) {
            if (vnode.type === Partial) {
                RENDER_STATE.partialDepth++;
                const name = vnode.props.name;
                if (typeof name === "string") {
                    if (RENDER_STATE.encounteredPartials.has(name)) {
                        throw new Error(`Rendered response contains duplicate partial name: "${name}"`);
                    }
                    RENDER_STATE.encounteredPartials.add(name);
                }
                if (hasIslandOwner(RENDER_STATE, vnode)) {
                    throw new Error(`<Partial> components cannot be used inside islands.`);
                }
            } else if (!PATCHED.has(vnode)) {
                const island = RENDER_STATE.buildCache.islandRegistry.get(vnode.type);
                const insideIsland = hasIslandOwner(RENDER_STATE, vnode);
                if (island === void 0) {
                    if (insideIsland) break patcher;
                    if (vnode.key !== void 0) {
                        const key = normalizeKey(vnode.key);
                        const originalType2 = vnode.type;
                        vnode.type = (props) => {
                            const child = _$2(originalType2, props);
                            PATCHED.add(child);
                            return wrapWithMarker(child, "key", key);
                        };
                    }
                    break patcher;
                }
                const {
                    islands: islands2,
                    islandProps,
                    islandAssets
                } = RENDER_STATE;
                if (insideIsland) {
                    for (let i2 = 0; i2 < island.css.length; i2++) {
                        const css2 = island.css[i2];
                        islandAssets.add(css2);
                    }
                    break patcher;
                }
                islands2.add(island);
                const originalType = vnode.type;
                vnode.type = (props) => {
                    for (const name in props) {
                        const value = props[name];
                        if (name === "children" || t$2(value) && !isSignal(value)) {
                            const slotId = RENDER_STATE.slots.length;
                            RENDER_STATE.slots.push({
                                id: slotId,
                                name,
                                vnode: value
                            });
                            props[name] = _$2(Slot, {
                                name,
                                id: slotId
                            }, value);
                        }
                    }
                    const propsIdx = islandProps.push({
                        slots: [],
                        props
                    }) - 1;
                    const child = _$2(originalType, props);
                    PATCHED.add(child);
                    const key = normalizeKey(vnode.key);
                    return wrapWithMarker(child, "island", `${island.name}:${propsIdx}:${key}`);
                };
            }
        } else if (typeof vnode.type === "string") {
            switch (vnode.type) {
                case "html":
                    RENDER_STATE.renderedHtmlTag = true;
                    break;
                case "head": {
                    RENDER_STATE.renderedHtmlHead = true;
                    const entryAssets2 = RENDER_STATE.buildCache.getEntryAssets();
                    const items = [];
                    if (entryAssets2.length > 0) {
                        for (let i2 = 0; i2 < entryAssets2.length; i2++) {
                            const id = entryAssets2[i2];
                            if (id.endsWith(".css")) {
                                items.push(
                                    // deno-lint-ignore no-explicit-any
                                    _$2("link", {
                                        rel: "stylesheet",
                                        href: asset(id)
                                    })
                                );
                            }
                        }
                    }
                    items.push(_$2(RemainingHead, null));
                    if (Array.isArray(vnode.props.children)) {
                        vnode.props.children.push(...items);
                    } else if (vnode.props.children !== null && typeof vnode.props.children === "object") {
                        items.unshift(vnode.props.children);
                        vnode.props.children = items;
                    } else {
                        vnode.props.children = items;
                    }
                    break;
                }
                case "body":
                    RENDER_STATE.renderedHtmlBody = true;
                    break;
                case "title":
                case "meta":
                case "link":
                case "script":
                case "style":
                case "base":
                case "noscript":
                case "template": {
                    if (PATCHED.has(vnode)) {
                        break;
                    }
                    const originalType = vnode.type;
                    let cacheKey = vnode.key ?? (originalType === "title" ? "title" : null);
                    if (cacheKey === null) {
                        const props = vnode.props;
                        const keys = Object.keys(vnode.props);
                        keys.sort();
                        cacheKey = `${originalType}`;
                        for (let i2 = 0; i2 < keys.length; i2++) {
                            const key = keys[i2];
                            if (key === "children" || key === "nonce" || key === "ref") {
                                continue;
                            } else if (key === "dangerouslySetInnerHTML") {
                                cacheKey += String(props[key].__html);
                                continue;
                            } else if (originalType === "meta" && key === "content") {
                                continue;
                            }
                            cacheKey += `::${props[key]}`;
                        }
                    }
                    const originalKey = vnode.key;
                    vnode.type = (props) => {
                        const value = x$4(HeadContext);
                        if (originalKey) {
                            props["data-key"] = originalKey;
                        }
                        const vnode2 = _$2(originalType, props);
                        PATCHED.add(vnode2);
                        if (RENDER_STATE !== null) {
                            if (value) {
                                RENDER_STATE.headComponents.set(cacheKey, vnode2);
                                return null;
                            } else if (value !== void 0) {
                                const cached = RENDER_STATE.headComponents.get(cacheKey);
                                if (cached !== void 0) {
                                    RENDER_STATE.headComponents.delete(cacheKey);
                                    return cached;
                                }
                            }
                        }
                        return vnode2;
                    };
                }
                    break;
            }
            if (vnode.key !== void 0 && (RENDER_STATE.partialDepth > 0 || hasIslandOwner(RENDER_STATE, vnode))) {
                vnode.props[DATA_FRESH_KEY] = String(vnode.key);
            }
        }
    }
    oldDiff?.(vnode);
};
const oldRender = options[OptionsType.RENDER];
options[OptionsType.RENDER] = (vnode) => {
    if (typeof vnode.type === "function" && vnode.type !== k$2 && RENDER_STATE !== null) {
        RENDER_STATE.ownerStack.push(vnode);
    }
    oldRender?.(vnode);
};
const oldDiffed = options[OptionsType.DIFFED];
options[OptionsType.DIFFED] = (vnode) => {
    if (typeof vnode.type === "function" && vnode.type !== k$2 && RENDER_STATE !== null) {
        RENDER_STATE.ownerStack.pop();
        if (vnode.type === Partial) {
            RENDER_STATE.partialDepth--;
        }
    }
    oldDiffed?.(vnode);
};

function RemainingHead() {
    if (RENDER_STATE !== null) {
        const items = [];
        if (RENDER_STATE.headComponents.size > 0) {
            items.push(...RENDER_STATE.headComponents.values());
        }
        RENDER_STATE.islands.forEach((island) => {
            if (island.css.length > 0) {
                for (let i2 = 0; i2 < island.css.length; i2++) {
                    const css2 = island.css[i2];
                    items.push(_$2("link", {
                        rel: "stylesheet",
                        href: css2
                    }));
                }
            }
        });
        RENDER_STATE.islandAssets.forEach((css2) => {
            items.push(_$2("link", {
                rel: "stylesheet",
                href: css2
            }));
        });
        if (items.length > 0) {
            return _$2(k$2, null, items);
        }
    }
    return null;
}

function Slot(props) {
    if (RENDER_STATE !== null) {
        RENDER_STATE.slots[props.id] = null;
    }
    return wrapWithMarker(props.children, "slot", `${props.id}:${props.name}`);
}

function hasIslandOwner(current, vnode) {
    let tmpVNode = vnode;
    let owner;
    while ((owner = current.owners.get(tmpVNode)) !== void 0) {
        if (current.buildCache.islandRegistry.has(owner.type)) {
            return true;
        }
        tmpVNode = owner;
    }
    return false;
}

function wrapWithMarker(vnode, kind, markerText) {
    return _$2(k$2, null, _$2(k$2, {
        // @ts-ignore unstable property is not typed
        UNSTABLE_comment: `frsh:${kind}:${markerText}`
    }), vnode, _$2(k$2, {
        // @ts-ignore unstable property is not typed
        UNSTABLE_comment: "/frsh:" + kind
    }));
}

function isSignal(x2) {
    return x2 !== null && typeof x2 === "object" && typeof x2.peek === "function" && "value" in x2;
}

function isComputedSignal(x2) {
    return isSignal(x2) && ("x" in x2 && typeof x2.x === "function" || "_fn" in x2 && typeof x2._fn === "function");
}

function isVNode(x2) {
    return x2 !== null && typeof x2 === "object" && "type" in x2 && "ref" in x2 && "__k" in x2 && t$2(x2);
}

const stringifiers = {
    Computed: (value) => {
        return isComputedSignal(value) ? {
            value: value.peek()
        } : void 0;
    },
    Signal: (value) => {
        return isSignal(value) ? {
            value: value.peek()
        } : void 0;
    },
    Slot: (value) => {
        if (isVNode(value) && value.type === Slot) {
            const props = value.props;
            return {
                value: {
                    name: props.name,
                    id: props.id
                }
            };
        }
    }
};

function FreshScripts() {
    if (RENDER_STATE === null) return null;
    if (RENDER_STATE.hasRuntimeScript) {
        return null;
    }
    RENDER_STATE.hasRuntimeScript = true;
    const {
        slots
    } = RENDER_STATE;
    return _$2(k$2, null, slots.map((slot) => {
        if (slot === null) return null;
        return _$2("template", {
            key: slot.id,
            id: `frsh-${slot.id}-${slot.name}`
        }, slot.vnode);
    }), _$2(FreshRuntimeScript, null));
}

function FreshRuntimeScript() {
    const {
        islands: islands2,
        nonce,
        ctx,
        islandProps,
        partialId,
        buildCache
    } = RENDER_STATE;
    const basePath = ctx.config.basePath;
    const islandArr = Array.from(islands2);
    if (ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
        const islands22 = islandArr.map((island) => {
            return {
                exportName: island.exportName,
                chunk: island.file,
                name: island.name
            };
        });
        const serializedProps = stringify(islandProps, stringifiers);
        const json = {
            islands: islands22,
            props: serializedProps
        };
        return _$2("script", {
            id: `__FRSH_STATE_${partialId}`,
            type: "application/json",
            dangerouslySetInnerHTML: {
                __html: escapeScript(JSON.stringify(json), {
                    json: true
                })
            }
        });
    } else {
        const islandImports = islandArr.map((island) => {
            const named = island.exportName === "default" ? island.name : island.exportName === island.name ? `{ ${island.exportName} }` : `{ ${island.exportName} as ${island.name} }`;
            const islandSpec = island.file.startsWith(".") ? island.file.slice(1) : island.file;
            return `import ${named} from "${basePath}${islandSpec}";`;
        }).join("");
        const islandObj = "{" + islandArr.map((island) => island.name).join(",") + "}";
        const serializedProps = escapeScript(JSON.stringify(stringify(islandProps, stringifiers)), {
            json: true
        });
        const runtimeUrl = buildCache.clientEntry.startsWith(".") ? buildCache.clientEntry.slice(1) : buildCache.clientEntry;
        const scriptContent = `import { boot } from "${basePath}${runtimeUrl}";${islandImports}boot(${islandObj},${serializedProps});`;
        return _$2(k$2, null, _$2("script", {
            type: "module",
            nonce,
            dangerouslySetInnerHTML: {
                __html: scriptContent
            }
        }), buildCache.features.errorOverlay ? _$2(ShowErrorOverlay, null) : null);
    }
}

function ShowErrorOverlay() {
    if (RENDER_STATE === null) return null;
    const {
        ctx
    } = RENDER_STATE;
    const error = ctx.error;
    if (error === null || error === void 0) return null;
    if (error instanceof HttpError && error.status < 500) {
        return null;
    }
    const basePath = ctx.config.basePath;
    const searchParams = new URLSearchParams();
    if (typeof error === "object") {
        if ("message" in error) {
            searchParams.append("message", String(error.message));
        }
        if ("stack" in error && typeof error.stack === "string") {
            searchParams.append("stack", error.stack);
            const codeFrame = getCodeFrame(error.stack, ctx.config.root);
            if (codeFrame !== void 0) {
                searchParams.append("code-frame", codeFrame);
            }
        }
    } else {
        searchParams.append("message", String(error));
    }
    return _$2("iframe", {
        id: "fresh-error-overlay",
        src: `${basePath}${DEV_ERROR_OVERLAY_URL}?${searchParams.toString()}`,
        style: "unset: all; position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%; border: none;"
    });
}

const version$1 = "2.2.0";
const denoJson = {
    version: version$1
};
const CURRENT_FRESH_VERSION = denoJson.version;
const tracer = _trace.getTracer("fresh", CURRENT_FRESH_VERSION);

function recordSpanError(span, err) {
    if (err instanceof Error) {
        span.recordException(err);
    } else {
        span.setStatus({
            code: _SpanStatusCode.ERROR,
            message: String(err)
        });
    }
}

function isAsyncAnyComponent(fn) {
    return typeof fn === "function" && fn.constructor.name === "AsyncFunction";
}

async function renderAsyncAnyComponent(fn, props) {
    return await tracer.startActiveSpan("invoke async component", async (span) => {
        span.setAttribute("fresh.span_type", "fs_routes/async_component");
        try {
            const result = await fn(props);
            span.setAttribute("fresh.component_response", result instanceof Response ? "http" : "jsx");
            return result;
        } catch (err) {
            recordSpanError(span, err);
            throw err;
        } finally {
            span.end();
        }
    });
}

async function renderRouteComponent(ctx, def, child) {
    const vnodeProps = {
        Component: child,
        config: ctx.config,
        data: def.props,
        error: ctx.error,
        info: ctx.info,
        isPartial: ctx.isPartial,
        params: ctx.params,
        req: ctx.req,
        state: ctx.state,
        url: ctx.url,
        route: ctx.route
    };
    if (isAsyncAnyComponent(def.component)) {
        const result = await renderAsyncAnyComponent(def.component, vnodeProps);
        if (result instanceof Response) {
            return result;
        }
        return result;
    }
    return _$2(def.component, vnodeProps);
}

var r$1 = "diffed", o$1 = "__c", i$1 = "__s", a$2 = "__c", c$2 = "__k", u$5 = "__d", s$3 = "__s",
    l$4 = /[\s\n\\/='"\0<>]/, f$3 = /^(xlink|xmlns|xml)([A-Z])/,
    p$3 = /^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/,
    h$6 = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/,
    d$7 = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);

function v$3(e2) {
    void 0 !== e2.__g ? e2.__g |= 8 : e2[u$5] = true;
}

function m$5(e2) {
    void 0 !== e2.__g ? e2.__g &= -9 : e2[u$5] = false;
}

function y$5(e2) {
    return void 0 !== e2.__g ? !!(8 & e2.__g) : true === e2[u$5];
}

var _$1 = /["&<]/;

function g$6(e2) {
    if (0 === e2.length || false === _$1.test(e2)) return e2;
    for (var t2 = 0, n2 = 0, r2 = "", o2 = ""; n2 < e2.length; n2++) {
        switch (e2.charCodeAt(n2)) {
            case 34:
                o2 = "&quot;";
                break;
            case 38:
                o2 = "&amp;";
                break;
            case 60:
                o2 = "&lt;";
                break;
            default:
                continue;
        }
        n2 !== t2 && (r2 += e2.slice(t2, n2)), r2 += o2, t2 = n2 + 1;
    }
    return n2 !== t2 && (r2 += e2.slice(t2, n2)), r2;
}

var b$3 = {},
    x$3 = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]),
    k = /[A-Z]/g;

function w$3(e2) {
    var t2 = "";
    for (var n2 in e2) {
        var r2 = e2[n2];
        if (null != r2 && "" !== r2) {
            var o2 = "-" == n2[0] ? n2 : b$3[n2] || (b$3[n2] = n2.replace(k, "-$&").toLowerCase()), i2 = ";";
            "number" != typeof r2 || o2.startsWith("--") || x$3.has(o2) || (i2 = "px;"), t2 = t2 + o2 + ":" + r2 + i2;
        }
    }
    return t2 || void 0;
}

function C() {
    this.__d = true;
}

function A$3(e2, t2) {
    return {
        __v: e2,
        context: t2,
        props: e2.props,
        setState: C,
        forceUpdate: C,
        __d: true,
        __h: new Array(0)
    };
}

var D$2, P$1, $$1, U$2, F$3 = {}, M$1 = [], W = Array.isArray, z = Object.assign, H = "", N = "<!--$s-->",
    q$1 = "<!--/$s-->";

function B(a2, u2, s2) {
    var l2 = l$7[i$1];
    l$7[i$1] = true, D$2 = l$7.__b, P$1 = l$7[r$1], $$1 = l$7.__r, U$2 = l$7.unmount;
    var f2 = _$2(k$2, null);
    f2[c$2] = [a2];
    try {
        var p2 = O$1(a2, u2 || F$3, false, void 0, f2, false, s2);
        return W(p2) ? p2.join(H) : p2;
    } catch (e2) {
        if (e2.then) throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
        throw e2;
    } finally {
        l$7[o$1] && l$7[o$1](a2, M$1), l$7[i$1] = l2, M$1.length = 0;
    }
}

function I$2(e2, t2) {
    var n2, r2 = e2.type, o2 = true;
    return e2[a$2] ? (o2 = false, (n2 = e2[a$2]).state = n2[s$3]) : n2 = new r2(e2.props, t2), e2[a$2] = n2, n2.__v = e2, n2.props = e2.props, n2.context = t2, v$3(n2), null == n2.state && (n2.state = F$3), null == n2[s$3] && (n2[s$3] = n2.state), r2.getDerivedStateFromProps ? n2.state = z({}, n2.state, r2.getDerivedStateFromProps(n2.props, n2.state)) : o2 && n2.componentWillMount ? (n2.componentWillMount(), n2.state = n2[s$3] !== n2.state ? n2[s$3] : n2.state) : !o2 && n2.componentWillUpdate && n2.componentWillUpdate(), $$1 && $$1(e2), n2.render(n2.props, n2.state, t2);
}

function O$1(t2, r2, o2, i2, u2, _2, b2) {
    if (null == t2 || true === t2 || false === t2 || t2 === H) return H;
    var x2 = typeof t2;
    if ("object" != x2) return "function" == x2 ? H : "string" == x2 ? g$6(t2) : t2 + H;
    if (W(t2)) {
        var k2, C2 = H;
        u2[c$2] = t2;
        for (var S2 = t2.length, L2 = 0; L2 < S2; L2++) {
            var E2 = t2[L2];
            if (null != E2 && "boolean" != typeof E2) {
                var j2, T2 = O$1(E2, r2, o2, i2, u2, _2, b2);
                "string" == typeof T2 ? C2 += T2 : (k2 || (k2 = new Array(S2)), C2 && k2.push(C2), C2 = H, W(T2) ? (j2 = k2).push.apply(j2, T2) : k2.push(T2));
            }
        }
        return k2 ? (C2 && k2.push(C2), k2) : C2;
    }
    if (void 0 !== t2.constructor) return H;
    t2.__ = u2, D$2 && D$2(t2);
    var Z = t2.type, M2 = t2.props;
    if ("function" == typeof Z) {
        var B2, V2, K, J = r2;
        if (Z === k$2) {
            if ("tpl" in M2) {
                for (var Q2 = H, X = 0; X < M2.tpl.length; X++) if (Q2 += M2.tpl[X], M2.exprs && X < M2.exprs.length) {
                    var Y = M2.exprs[X];
                    if (null == Y) continue;
                    "object" != typeof Y || void 0 !== Y.constructor && !W(Y) ? Q2 += Y : Q2 += O$1(Y, r2, o2, i2, t2, _2, b2);
                }
                return Q2;
            }
            if ("UNSTABLE_comment" in M2) return "<!--" + g$6(M2.UNSTABLE_comment) + "-->";
            V2 = M2.children;
        } else {
            if (null != (B2 = Z.contextType)) {
                var ee = r2[B2.__c];
                J = ee ? ee.props.value : B2.__;
            }
            var te = Z.prototype && "function" == typeof Z.prototype.render;
            if (te) V2 = /**#__NOINLINE__**/
                I$2(t2, J), K = t2[a$2];
            else {
                t2[a$2] = K = /**#__NOINLINE__**/
                    A$3(t2, J);
                for (var ne = 0; y$5(K) && ne++ < 25;) {
                    m$5(K), $$1 && $$1(t2);
                    try {
                        V2 = Z.call(K, M2, J);
                    } catch (e2) {
                        throw e2;
                    }
                }
                v$3(K);
            }
            if (null != K.getChildContext && (r2 = z({}, r2, K.getChildContext())), te && l$7.errorBoundaries && (Z.getDerivedStateFromError || K.componentDidCatch)) {
                V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
                try {
                    return O$1(V2, r2, o2, i2, t2, _2, false);
                } catch (e2) {
                    return Z.getDerivedStateFromError && (K[s$3] = Z.getDerivedStateFromError(e2)), K.componentDidCatch && K.componentDidCatch(e2, F$3), y$5(K) ? (V2 = I$2(t2, r2), null != (K = t2[a$2]).getChildContext && (r2 = z({}, r2, K.getChildContext())), O$1(V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2, r2, o2, i2, t2, _2, b2)) : H;
                } finally {
                    P$1 && P$1(t2), U$2 && U$2(t2);
                }
            }
        }
        V2 = null != V2 && V2.type === k$2 && null == V2.key && null == V2.props.tpl ? V2.props.children : V2;
        try {
            var re2 = O$1(V2, r2, o2, i2, t2, _2, b2);
            return P$1 && P$1(t2), l$7.unmount && l$7.unmount(t2), t2._suspended ? "string" == typeof re2 ? N + re2 + q$1 : W(re2) ? (re2.unshift(N), re2.push(q$1), re2) : re2.then(function (e2) {
                return N + e2 + q$1;
            }) : re2;
        } catch (n2) {
            if (b2 && b2.onError) {
                var oe = (function e2(n3) {
                    return b2.onError(n3, t2, function (t3, n4) {
                        try {
                            return O$1(t3, r2, o2, i2, n4, _2, b2);
                        } catch (t4) {
                            return e2(t4);
                        }
                    });
                })(n2);
                if (void 0 !== oe) return oe;
                var ie = l$7.__e;
                return ie && ie(n2, t2), H;
            }
            throw n2;
        }
    }
    var ae, ce = "<" + Z, ue = H;
    for (var se in M2) {
        var le = M2[se];
        if ("function" != typeof (le = G(le) ? le.value : le) || "class" === se || "className" === se) {
            switch (se) {
                case "children":
                    ae = le;
                    continue;
                case "key":
                case "ref":
                case "__self":
                case "__source":
                    continue;
                case "htmlFor":
                    if ("for" in M2) continue;
                    se = "for";
                    break;
                case "className":
                    if ("class" in M2) continue;
                    se = "class";
                    break;
                case "defaultChecked":
                    se = "checked";
                    break;
                case "defaultSelected":
                    se = "selected";
                    break;
                case "defaultValue":
                case "value":
                    switch (se = "value", Z) {
                        case "textarea":
                            ae = le;
                            continue;
                        case "select":
                            i2 = le;
                            continue;
                        case "option":
                            i2 != le || "selected" in M2 || (ce += " selected");
                    }
                    break;
                case "dangerouslySetInnerHTML":
                    ue = le && le.__html;
                    continue;
                case "style":
                    "object" == typeof le && (le = w$3(le));
                    break;
                case "acceptCharset":
                    se = "accept-charset";
                    break;
                case "httpEquiv":
                    se = "http-equiv";
                    break;
                default:
                    if (f$3.test(se)) se = se.replace(f$3, "$1:$2").toLowerCase();
                    else {
                        if (l$4.test(se)) continue;
                        "-" !== se[4] && !d$7.has(se) || null == le ? o2 ? h$6.test(se) && (se = "panose1" === se ? "panose-1" : se.replace(/([A-Z])/g, "-$1").toLowerCase()) : p$3.test(se) && (se = se.toLowerCase()) : le += H;
                    }
            }
            null != le && false !== le && (ce = true === le || le === H ? ce + " " + se : ce + " " + se + '="' + ("string" == typeof le ? g$6(le) : le + H) + '"');
        }
    }
    if (l$4.test(Z)) throw new Error(Z + " is not a valid HTML tag name in " + ce + ">");
    if (ue || ("string" == typeof ae ? ue = g$6(ae) : null != ae && false !== ae && true !== ae && (ue = O$1(ae, r2, "svg" === Z || "foreignObject" !== Z && o2, i2, t2, _2, b2))), P$1 && P$1(t2), U$2 && U$2(t2), !ue && R$2.has(Z)) return ce + "/>";
    var fe = "</" + Z + ">", pe = ce + ">";
    return W(ue) ? [pe].concat(ue, [fe]) : "string" != typeof ue ? [pe, ue, fe] : pe + ue + fe;
}

var R$2 = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);

function G(e2) {
    return null !== e2 && "object" == typeof e2 && "function" == typeof e2.peek && "value" in e2;
}

const ENCODER = new TextEncoder();
let getBuildCache;
let getInternals;
let setAdditionalStyles;

class Context {
    constructor(req, url, info, route, params, config2, next, buildCache) {
        __privateAdd(this, _internal, {
            app: null,
            layouts: []
        });
        __publicField(this, "config");
        __publicField(this, "url");
        __publicField(this, "req");
        __publicField(this, "route");
        __publicField(this, "params");
        __publicField(this, "state", {});
        __publicField(this, "data");
        __publicField(this, "error", null);
        __publicField(this, "info");
        __publicField(this, "isPartial");
        __publicField(this, "next");
        __privateAdd(this, _buildCache);
        __privateAdd(this, _additionalStyles, null);
        __publicField(this, "Component");
        this.url = url;
        this.req = req;
        this.info = info;
        this.params = params;
        this.route = route;
        this.config = config2;
        this.isPartial = url.searchParams.has(PARTIAL_SEARCH_PARAM);
        this.next = next;
        __privateSet(this, _buildCache, buildCache);
    }

    /**
     * Return a redirect response to the specified path. This is the
     * preferred way to do redirects in Fresh.
     *
     * ```ts
     * ctx.redirect("/foo/bar") // redirect user to "<yoursite>/foo/bar"
     *
     * // Disallows protocol relative URLs for improved security. This
     * // redirects the user to `<yoursite>/evil.com` which is safe,
     * // instead of redirecting to `http://evil.com`.
     * ctx.redirect("//evil.com/");
     * ```
     */
    redirect(pathOrUrl, status = 302) {
        let location2 = pathOrUrl;
        if (pathOrUrl !== "/" && pathOrUrl.startsWith("/")) {
            let idx = pathOrUrl.indexOf("?");
            if (idx === -1) {
                idx = pathOrUrl.indexOf("#");
            }
            const pathname = idx > -1 ? pathOrUrl.slice(0, idx) : pathOrUrl;
            const search = idx > -1 ? pathOrUrl.slice(idx) : "";
            location2 = `${pathname.replaceAll(/\/+/g, "/")}${search}`;
        }
        return new Response(null, {
            status,
            headers: {
                location: location2
            }
        });
    }

    /**
     * Render JSX and return an HTML `Response` instance.
     * ```tsx
     * ctx.render(<h1>hello world</h1>);
     * ```
     */
    async render(vnode, init = {}, config2 = {}) {
        if (arguments.length === 0) {
            throw new Error(`No arguments passed to: ctx.render()`);
        } else if (vnode !== null && !t$2(vnode)) {
            throw new Error(`Non-JSX element passed to: ctx.render()`);
        }
        const defs = config2.skipInheritedLayouts ? [] : __privateGet(this, _internal).layouts;
        const appDef = config2.skipAppWrapper ? null : __privateGet(this, _internal).app;
        const props = this;
        for (let i2 = defs.length - 1; i2 >= 0; i2--) {
            const child = vnode;
            props.Component = () => child;
            const def = defs[i2];
            const result = await renderRouteComponent(this, def, () => child);
            if (result instanceof Response) {
                return result;
            }
            vnode = result;
        }
        let appChild = vnode;
        let appVNode;
        let hasApp = true;
        if (isAsyncAnyComponent(appDef)) {
            props.Component = () => appChild;
            const result = await renderAsyncAnyComponent(appDef, props);
            if (result instanceof Response) {
                return result;
            }
            appVNode = result;
        } else if (appDef !== null) {
            appVNode = _$2(appDef, {
                Component: () => appChild,
                config: this.config,
                data: null,
                error: this.error,
                info: this.info,
                isPartial: this.isPartial,
                params: this.params,
                req: this.req,
                state: this.state,
                url: this.url,
                route: this.route
            });
        } else {
            hasApp = false;
            appVNode = appChild ?? _$2(k$2, null);
        }
        const headers = getHeadersFromInit(init);
        headers.set("Content-Type", "text/html; charset=utf-8");
        const responseInit = {
            status: init.status ?? 200,
            headers,
            statusText: init.statusText
        };
        let partialId = "";
        if (this.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
            partialId = crypto.randomUUID();
            headers.set("X-Fresh-Id", partialId);
        }
        const html = tracer.startActiveSpan("render", (span) => {
            span.setAttribute("fresh.span_type", "render");
            const state = new RenderState(this, __privateGet(this, _buildCache), partialId);
            if (__privateGet(this, _additionalStyles) !== null) {
                for (let i2 = 0; i2 < __privateGet(this, _additionalStyles).length; i2++) {
                    const css2 = __privateGet(this, _additionalStyles)[i2];
                    state.islandAssets.add(css2);
                }
            }
            try {
                setRenderState(state);
                let html2 = B(vnode ?? _$2(k$2, null));
                if (hasApp) {
                    appChild = a$4([html2]);
                    html2 = B(appVNode);
                }
                if (!state.renderedHtmlBody || !state.renderedHtmlHead || !state.renderedHtmlTag) {
                    let fallback = a$4([html2]);
                    if (!state.renderedHtmlBody) {
                        let scripts = null;
                        if (this.url.pathname !== this.config.basePath + DEV_ERROR_OVERLAY_URL) {
                            scripts = _$2(FreshScripts, null);
                        }
                        fallback = _$2("body", null, fallback, scripts);
                    }
                    if (!state.renderedHtmlHead) {
                        fallback = _$2(k$2, null, _$2("head", null, _$2("meta", {
                            charset: "utf-8"
                        })), fallback);
                    }
                    if (!state.renderedHtmlTag) {
                        fallback = _$2("html", null, fallback);
                    }
                    html2 = B(fallback);
                }
                return `<!DOCTYPE html>${html2}`;
            } catch (err) {
                if (err instanceof Error) {
                    span.recordException(err);
                } else {
                    span.setStatus({
                        code: _SpanStatusCode.ERROR,
                        message: String(err)
                    });
                }
                throw err;
            } finally {
                const basePath = this.config.basePath;
                const runtimeUrl = state.buildCache.clientEntry.startsWith(".") ? state.buildCache.clientEntry.slice(1) : state.buildCache.clientEntry;
                let link = `<${encodeURI(`${basePath}${runtimeUrl}`)}>; rel="modulepreload"; as="script"`;
                state.islands.forEach((island) => {
                    const specifier = `${basePath}${island.file.startsWith(".") ? island.file.slice(1) : island.file}`;
                    link += `, <${encodeURI(specifier)}>; rel="modulepreload"; as="script"`;
                });
                if (link !== "") {
                    headers.append("Link", link);
                }
                state.clear();
                setRenderState(null);
                span.end();
            }
        });
        return new Response(html, responseInit);
    }

    /**
     * Respond with text. Sets `Content-Type: text/plain`.
     * ```tsx
     * app.use(ctx => ctx.text("Hello World!"));
     * ```
     */
    text(content, init) {
        return new Response(content, init);
    }

    /**
     * Respond with html string. Sets `Content-Type: text/html`.
     * ```tsx
     * app.get("/", ctx => ctx.html("<h1>foo</h1>"));
     * ```
     */
    html(content, init) {
        const headers = getHeadersFromInit(init);
        headers.set("Content-Type", "text/html; charset=utf-8");
        return new Response(content, {
            ...init,
            headers
        });
    }

    /**
     * Respond with json string, same as `Response.json()`. Sets
     * `Content-Type: application/json`.
     * ```tsx
     * app.get("/", ctx => ctx.json({ foo: 123 }));
     * ```
     */
    // deno-lint-ignore no-explicit-any
    json(content, init) {
        return Response.json(content, init);
    }

    /**
     * Helper to stream a sync or async iterable and encode text
     * automatically.
     *
     * ```tsx
     * function* gen() {
     *   yield "foo";
     *   yield "bar";
     * }
     *
     * app.use(ctx => ctx.stream(gen()))
     * ```
     *
     * Or pass in the function directly:
     *
     * ```tsx
     * app.use(ctx => {
     *   return ctx.stream(function* gen() {
     *     yield "foo";
     *     yield "bar";
     *   });
     * );
     * ```
     */
    stream(stream, init) {
        const raw = typeof stream === "function" ? stream() : stream;
        const body = ReadableStream.from(raw).pipeThrough(new TransformStream({
            transform(chunk, controller) {
                if (chunk instanceof Uint8Array) {
                    controller.enqueue(chunk);
                } else if (chunk === void 0) {
                    controller.enqueue(void 0);
                } else {
                    const raw2 = ENCODER.encode(String(chunk));
                    controller.enqueue(raw2);
                }
            }
        }));
        return new Response(body, init);
    }
}

_internal = /* @__PURE__ */ new WeakMap();
_buildCache = /* @__PURE__ */ new WeakMap();
_additionalStyles = /* @__PURE__ */ new WeakMap();
getInternals = (ctx) => __privateGet(ctx, _internal);
getBuildCache = (ctx) => __privateGet(ctx, _buildCache);
setAdditionalStyles = (ctx, css2) => __privateSet(ctx, _additionalStyles, css2);

function getHeadersFromInit(init) {
    if (init === void 0) {
        return new Headers();
    }
    return init.headers !== void 0 ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
}

async function runMiddlewares(middlewares, ctx, onError) {
    return await tracer.startActiveSpan("middlewares", {
        attributes: {
            "fresh.middleware.count": middlewares.length
        }
    }, async (span) => {
        try {
            let fn = ctx.next;
            let i2 = middlewares.length;
            while (i2--) {
                const local = fn;
                let next = middlewares[i2];
                const idx = i2;
                fn = async () => {
                    const internals = getInternals(ctx);
                    const {
                        app: prevApp,
                        layouts: prevLayouts
                    } = internals;
                    ctx.next = local;
                    try {
                        const result = await next(ctx);
                        if (typeof result === "function") {
                            middlewares[idx] = result;
                            next = result;
                            return await result(ctx);
                        }
                        return result;
                    } catch (err) {
                        if (ctx.error !== err) {
                            ctx.error = err;
                            if (onError !== void 0) {
                                onError(err);
                            }
                        }
                        throw err;
                    } finally {
                        internals.app = prevApp;
                        internals.layouts = prevLayouts;
                    }
                };
            }
            return await fn();
        } catch (err) {
            recordSpanError(span, err);
            throw err;
        } finally {
            span.end();
        }
    });
}

function newByMethod() {
    return {
        GET: [],
        POST: [],
        PATCH: [],
        DELETE: [],
        PUT: [],
        HEAD: [],
        OPTIONS: []
    };
}

const IS_PATTERN = /[*:{}+?()]/;
const EMPTY = [];

class UrlPatternRouter {
    #statics = /* @__PURE__ */ new Map();
    #dynamics = /* @__PURE__ */ new Map();
    #dynamicArr = [];
    #allowed = /* @__PURE__ */ new Map();

    getAllowedMethods(pattern) {
        const allowed = this.#allowed.get(pattern);
        if (allowed === void 0) return EMPTY;
        return Array.from(allowed);
    }

    add(method, pathname, handlers2) {
        let allowed = this.#allowed.get(pathname);
        if (allowed === void 0) {
            allowed = /* @__PURE__ */ new Set();
            this.#allowed.set(pathname, allowed);
        }
        allowed.add(method);
        let byMethod;
        if (IS_PATTERN.test(pathname)) {
            let def = this.#dynamics.get(pathname);
            if (def === void 0) {
                def = {
                    pattern: new URLPattern({
                        pathname
                    }),
                    byMethod: newByMethod()
                };
                this.#dynamics.set(pathname, def);
                this.#dynamicArr.push(def);
            }
            byMethod = def.byMethod;
        } else {
            let def = this.#statics.get(pathname);
            if (def === void 0) {
                def = {
                    pattern: pathname,
                    byMethod: newByMethod()
                };
                this.#statics.set(pathname, def);
            }
            byMethod = def.byMethod;
        }
        byMethod[method].push(...handlers2);
    }

    match(method, url, init = []) {
        const result = {
            params: /* @__PURE__ */ Object.create(null),
            handlers: init,
            methodMatch: false,
            pattern: null
        };
        const staticMatch = this.#statics.get(url.pathname);
        if (staticMatch !== void 0) {
            result.pattern = url.pathname;
            let handlers2 = staticMatch.byMethod[method];
            if (method === "HEAD" && handlers2.length === 0) {
                handlers2 = staticMatch.byMethod.GET;
            }
            if (handlers2.length > 0) {
                result.methodMatch = true;
                result.handlers.push(...handlers2);
            }
            return result;
        }
        for (let i2 = 0; i2 < this.#dynamicArr.length; i2++) {
            const route = this.#dynamicArr[i2];
            const match = route.pattern.exec(url);
            if (match === null) continue;
            result.pattern = route.pattern.pathname;
            let handlers2 = route.byMethod[method];
            if (method === "HEAD" && handlers2.length === 0) {
                handlers2 = route.byMethod.GET;
            }
            if (handlers2.length > 0) {
                result.methodMatch = true;
                result.handlers.push(...handlers2);
                for (const [key, value] of Object.entries(match.pathname.groups)) {
                    result.params[key] = value === void 0 ? "" : decodeURI(value);
                }
            }
            break;
        }
        return result;
    }
}

function patternToSegments(path, root2, includeLast = false) {
    const out = [root2];
    if (path === "/" || path === "*" || path === "/*") return out;
    let start = -1;
    for (let i2 = 0; i2 < path.length; i2++) {
        const ch = path[i2];
        if (ch === "/") {
            if (i2 > 0) {
                const raw = path.slice(start + 1, i2);
                out.push(raw);
            }
            start = i2;
        }
    }
    if (includeLast && start < path.length - 1) {
        out.push(path.slice(start + 1));
    }
    return out;
}

function mergePath(basePath, path, isMounting) {
    if (basePath.endsWith("*")) basePath = basePath.slice(0, -1);
    if (basePath === "/") basePath = "";
    if (path === "*") path = isMounting ? "" : "/*";
    else if (path === "/*") path = "/*";
    const s2 = basePath !== "" && path === "/" ? "" : path;
    return basePath + s2;
}

function toRoutePath(path) {
    if (path === "") return "*";
    return path;
}

function isHandlerByMethod(handler2) {
    return handler2 !== null && !Array.isArray(handler2) && typeof handler2 === "object";
}

function newSegment(pattern, parent) {
    return {
        pattern,
        middlewares: [],
        layout: null,
        app: null,
        errorRoute: null,
        notFound: null,
        parent,
        children: /* @__PURE__ */ new Map()
    };
}

function getOrCreateSegment(root2, path, includeLast) {
    let current = root2;
    const segments = patternToSegments(path, root2.pattern, includeLast);
    for (let i2 = 0; i2 < segments.length; i2++) {
        const seg = segments[i2];
        if (seg === root2.pattern) {
            current = root2;
        } else {
            let child = current.children.get(seg);
            if (child === void 0) {
                child = newSegment(seg, current);
                current.children.set(seg, child);
            }
            current = child;
        }
    }
    return current;
}

function segmentToMiddlewares(segment) {
    const result = [];
    const stack = [];
    let current = segment;
    while (current !== null) {
        stack.push(current);
        current = current.parent;
    }
    const root2 = stack.at(-1);
    for (let i2 = stack.length - 1; i2 >= 0; i2--) {
        const seg = stack[i2];
        const {
            layout,
            app: app2,
            errorRoute
        } = seg;
        result.push(async function segmentMiddleware(ctx) {
            const internals = getInternals(ctx);
            const prevApp = internals.app;
            const prevLayouts = internals.layouts;
            if (app2 !== null) {
                internals.app = app2;
            }
            if (layout !== null) {
                if (layout.config?.skipAppWrapper) {
                    internals.app = null;
                }
                const def = {
                    props: null,
                    component: layout.component
                };
                if (layout.config?.skipInheritedLayouts) {
                    internals.layouts = [def];
                } else {
                    internals.layouts = [...internals.layouts, def];
                }
            }
            try {
                return await ctx.next();
            } catch (err) {
                const status = err instanceof HttpError ? err.status : 500;
                if (root2.notFound !== null && status === 404) {
                    return await root2.notFound(ctx);
                }
                if (errorRoute !== null) {
                    return await renderRoute(ctx, errorRoute, status);
                }
                throw err;
            } finally {
                internals.app = prevApp;
                internals.layouts = prevLayouts;
            }
        });
        if (seg.middlewares.length > 0) {
            result.push(...seg.middlewares);
        }
    }
    return result;
}

async function renderRoute(ctx, route, status = 200) {
    const internals = getInternals(ctx);
    if (route.config?.skipAppWrapper) {
        internals.app = null;
    }
    if (route.config?.skipInheritedLayouts) {
        internals.layouts = [];
    }
    const method = ctx.req.method.toUpperCase();
    const handlers2 = route.handler;
    if (handlers2 === void 0) {
        throw new Error(`Unexpected missing handlers`);
    }
    const headers = new Headers();
    headers.set("Content-Type", "text/html;charset=utf-8");
    const res = await tracer.startActiveSpan("handler", {
        attributes: {
            "fresh.span_type": "fs_routes/handler"
        }
    }, async (span) => {
        try {
            let fn = null;
            if (isHandlerByMethod(handlers2)) {
                if (handlers2[method] !== void 0) {
                    fn = handlers2[method];
                } else if (method === "HEAD" && handlers2.GET !== void 0) {
                    fn = handlers2.GET;
                }
            } else {
                fn = handlers2;
            }
            if (fn === null) return await ctx.next();
            return await fn(ctx);
        } catch (err) {
            recordSpanError(span, err);
            throw err;
        } finally {
            span.end();
        }
    });
    if (res instanceof Response) {
        return res;
    }
    if (typeof res.status === "number") {
        status = res.status;
    }
    if (res.headers !== void 0) {
        if (res.headers instanceof Headers) {
            res.headers.forEach((value, key) => {
                headers.set(key, value);
            });
        } else if (Array.isArray(res.headers)) {
            for (let i2 = 0; i2 < res.headers.length; i2++) {
                const entry = res.headers[i2];
                headers.set(entry[0], entry[1]);
            }
        } else {
            for (const [name, value] of Object.entries(res.headers)) {
                headers.set(name, value);
            }
        }
    }
    let vnode = null;
    if (route.component !== void 0) {
        const result = await renderRouteComponent(ctx, {
            component: route.component,
            // deno-lint-ignore no-explicit-any
            props: res.data
        }, () => null);
        if (result instanceof Response) {
            return result;
        }
        vnode = result;
    }
    return ctx.render(vnode, {
        headers,
        status
    });
}

const DEFAULT_NOT_FOUND = () => {
    throw new HttpError(404);
};
const DEFAULT_NOT_ALLOWED_METHOD = () => {
    throw new HttpError(405);
};
const DEFAULT_RENDER = () => (
    // deno-lint-ignore no-explicit-any
    Promise.resolve({
        data: {}
    })
);

function ensureHandler(route) {
    if (route.handler === void 0) {
        route.handler = route.component !== void 0 ? DEFAULT_RENDER : DEFAULT_NOT_FOUND;
    } else if (isHandlerByMethod(route.handler)) {
        if (route.component !== void 0 && !route.handler.GET) {
            route.handler.GET = DEFAULT_RENDER;
        }
    }
}

var CommandType = /* @__PURE__ */ (function (CommandType2) {
    CommandType2["Middleware"] = "middleware";
    CommandType2["Layout"] = "layout";
    CommandType2["App"] = "app";
    CommandType2["Route"] = "route";
    CommandType2["Error"] = "error";
    CommandType2["NotFound"] = "notFound";
    CommandType2["Handler"] = "handler";
    CommandType2["FsRoute"] = "fsRoute";
    return CommandType2;
})({});

function newErrorCmd(pattern, routeOrMiddleware, includeLastSegment) {
    const route = typeof routeOrMiddleware === "function" ? {
        handler: routeOrMiddleware
    } : routeOrMiddleware;
    ensureHandler(route);
    return {
        type: "error",
        pattern,
        item: route,
        includeLastSegment
    };
}

function newAppCmd(component) {
    return {
        type: "app",
        component
    };
}

function newLayoutCmd(pattern, component, config2, includeLastSegment) {
    return {
        type: "layout",
        pattern,
        component,
        config: config2,
        includeLastSegment
    };
}

function newMiddlewareCmd(pattern, fns, includeLastSegment) {
    return {
        type: "middleware",
        pattern,
        fns,
        includeLastSegment
    };
}

function newNotFoundCmd(routeOrMiddleware) {
    const route = typeof routeOrMiddleware === "function" ? {
        handler: routeOrMiddleware
    } : routeOrMiddleware;
    ensureHandler(route);
    return {
        type: "notFound",
        fn: (ctx) => renderRoute(ctx, route)
    };
}

function newRouteCmd(pattern, route, config2, includeLastSegment) {
    let normalized;
    if (isLazy(route)) {
        normalized = async () => {
            const result = await route();
            ensureHandler(result);
            return result;
        };
    } else {
        ensureHandler(route);
        normalized = route;
    }
    return {
        type: "route",
        pattern,
        route: normalized,
        config: config2,
        includeLastSegment
    };
}

function newHandlerCmd(method, pattern, fns, includeLastSegment) {
    return {
        type: "handler",
        pattern,
        method,
        fns,
        includeLastSegment
    };
}

function applyCommands(router, commands, basePath) {
    const root2 = newSegment("", null);
    applyCommandsInner(root2, router, commands, basePath);
    return {
        rootMiddlewares: segmentToMiddlewares(root2)
    };
}

function applyCommandsInner(root2, router, commands, basePath) {
    for (let i2 = 0; i2 < commands.length; i2++) {
        const cmd = commands[i2];
        switch (cmd.type) {
            case "middleware": {
                const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
                segment.middlewares.push(...cmd.fns);
                break;
            }
            case "notFound": {
                root2.notFound = cmd.fn;
                break;
            }
            case "error": {
                const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
                segment.errorRoute = cmd.item;
                break;
            }
            case "app": {
                root2.app = cmd.component;
                break;
            }
            case "layout": {
                const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
                segment.layout = {
                    component: cmd.component,
                    config: cmd.config ?? null
                };
                break;
            }
            case "route": {
                const {
                    pattern,
                    route,
                    config: config2
                } = cmd;
                const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
                const fns = segmentToMiddlewares(segment);
                if (isLazy(route)) {
                    const routePath = mergePath(basePath, config2?.routeOverride ?? pattern, false);
                    let def;
                    fns.push(async (ctx) => {
                        if (def === void 0) {
                            def = await route();
                        }
                        if (def.css !== void 0) {
                            setAdditionalStyles(ctx, def.css);
                        }
                        return renderRoute(ctx, def);
                    });
                    if (config2 === void 0 || config2.methods === "ALL") {
                        router.add("GET", routePath, fns);
                        router.add("DELETE", routePath, fns);
                        router.add("HEAD", routePath, fns);
                        router.add("OPTIONS", routePath, fns);
                        router.add("PATCH", routePath, fns);
                        router.add("POST", routePath, fns);
                        router.add("PUT", routePath, fns);
                    } else if (Array.isArray(config2.methods)) {
                        for (let i3 = 0; i3 < config2.methods.length; i3++) {
                            const method = config2.methods[i3];
                            router.add(method, routePath, fns);
                        }
                    }
                } else {
                    fns.push((ctx) => renderRoute(ctx, route));
                    const routePath = toRoutePath(mergePath(basePath, route.config?.routeOverride ?? pattern, false));
                    if (typeof route.handler === "function") {
                        router.add("GET", routePath, fns);
                        router.add("DELETE", routePath, fns);
                        router.add("HEAD", routePath, fns);
                        router.add("OPTIONS", routePath, fns);
                        router.add("PATCH", routePath, fns);
                        router.add("POST", routePath, fns);
                        router.add("PUT", routePath, fns);
                    } else if (isHandlerByMethod(route.handler)) {
                        for (const method of Object.keys(route.handler)) {
                            router.add(method, routePath, fns);
                        }
                    }
                }
                break;
            }
            case "handler": {
                const {
                    pattern,
                    fns,
                    method
                } = cmd;
                const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
                const result = segmentToMiddlewares(segment);
                result.push(...fns);
                const resPath = toRoutePath(mergePath(basePath, pattern, false));
                if (method === "ALL") {
                    router.add("GET", resPath, result);
                    router.add("DELETE", resPath, result);
                    router.add("HEAD", resPath, result);
                    router.add("OPTIONS", resPath, result);
                    router.add("PATCH", resPath, result);
                    router.add("POST", resPath, result);
                    router.add("PUT", resPath, result);
                } else {
                    router.add(method, resPath, result);
                }
                break;
            }
            case "fsRoute": {
                const items = cmd.getItems();
                const base = mergePath(basePath, cmd.pattern, true);
                applyCommandsInner(root2, router, items, base);
                break;
            }
            default:
                throw new Error(`Unknown command: ${JSON.stringify(cmd)}`);
        }
    }
}

function isFreshFile(mod, commandType) {
    if (mod === null || typeof mod !== "object") return false;
    return typeof mod.default === "function" || commandType === CommandType.Middleware && Array.isArray(mod.default) || typeof mod.config === "object" || typeof mod.handlers === "object" || typeof mod.handlers === "function" || typeof mod.handler === "object" || typeof mod.handler === "function";
}

function fsItemsToCommands(items) {
    const commands = [];
    for (let i2 = 0; i2 < items.length; i2++) {
        const item = items[i2];
        const {
            filePath,
            type,
            mod: rawMod,
            pattern,
            routePattern
        } = item;
        switch (type) {
            case CommandType.Middleware: {
                if (isLazy(rawMod)) continue;
                const {
                    handlers: handlers2,
                    mod
                } = validateFsMod(filePath, rawMod, type);
                let middlewares = handlers2 ?? mod.default ?? null;
                if (middlewares === null) continue;
                if (isHandlerByMethod(middlewares)) {
                    warnInvalidRoute(`Middleware does not support object handlers with GET, POST, etc. in ${filePath}`);
                    continue;
                }
                if (!Array.isArray(middlewares)) {
                    middlewares = [middlewares];
                }
                commands.push(newMiddlewareCmd(pattern, middlewares, true));

            }
            case CommandType.Layout: {
                const {
                    handlers: handlers2,
                    mod
                } = validateFsMod(filePath, rawMod, type);
                if (handlers2 !== null) {
                    warnInvalidRoute("Layout does not support handlers");
                }
                if (!mod.default) continue;
                commands.push(newLayoutCmd(pattern, mod.default, mod.config, true));

            }
            case CommandType.Error: {
                const {
                    handlers: handlers2,
                    mod
                } = validateFsMod(filePath, rawMod, type);
                commands.push(newErrorCmd(pattern, {
                    component: mod.default ?? void 0,
                    config: mod.config ?? void 0,
                    // deno-lint-ignore no-explicit-any
                    handler: handlers2 ?? void 0
                }, true));

            }
            case CommandType.NotFound: {
                const {
                    handlers: handlers2,
                    mod
                } = validateFsMod(filePath, rawMod, type);
                commands.push(newNotFoundCmd({
                    config: mod.config,
                    component: mod.default,
                    // deno-lint-ignore no-explicit-any
                    handler: handlers2 ?? void 0
                }));

            }
            case CommandType.App: {
                const {
                    mod
                } = validateFsMod(filePath, rawMod, type);
                if (mod.default === void 0) continue;
                commands.push(newAppCmd(mod.default));

            }
            case CommandType.Route: {
                let normalized;
                let config2 = {};
                if (isLazy(rawMod)) {
                    normalized = async () => {
                        return await tracer.startActiveSpan("lazy-route", {
                            attributes: {
                                "fresh.route_name": rawMod.name ?? "anonymous"
                            }
                        }, async (span) => {
                            try {
                                const result = await rawMod();
                                return normalizeRoute(filePath, result, routePattern, type);
                            } catch (err) {
                                recordSpanError(span, err);
                                throw err;
                            } finally {
                                span.end();
                            }
                        });
                    };
                    config2.methods = item.overrideConfig?.methods ?? "ALL";
                    config2.routeOverride = item.overrideConfig?.routeOverride ?? routePattern;
                } else {
                    normalized = normalizeRoute(filePath, rawMod, routePattern, type);
                    if (rawMod.config) {
                        config2 = rawMod.config;
                    }
                }
                commands.push(newRouteCmd(pattern, normalized, config2, false));

            }
            case CommandType.Handler:
                throw new Error(`Not supported`);
            case CommandType.FsRoute:
                throw new Error(`Nested FsRoutes are not supported`);
            default:
                throw new Error(`Unknown command type: ${type}`);
        }
    }
    return commands;
}

function warnInvalidRoute(message) {
    console.warn(`🍋 %c[WARNING] Unsupported route config: ${message}`, "color:rgb(251, 184, 0)");
}

function validateFsMod(filePath, mod, commandType) {
    if (!isFreshFile(mod, commandType)) {
        throw new Error(`Expected a route, middleware, layout or error template, but couldn't find relevant exports in: ${filePath}`);
    }
    const handlers2 = mod.handlers ?? mod.handler ?? null;
    if (typeof handlers2 === "function" && handlers2.length > 1) {
        throw new Error(`Handlers must only have one argument but found more than one. Check the function signature in: ${filePath}`);
    }
    return {
        handlers: handlers2,
        mod
    };
}

function normalizeRoute(filePath, rawMod, routePattern, commandType) {
    const {
        handlers: handlers2,
        mod
    } = validateFsMod(filePath, rawMod, commandType);
    return {
        config: {
            ...mod.config,
            routeOverride: mod.config?.routeOverride ?? routePattern
        },
        // deno-lint-ignore no-explicit-any
        handler: handlers2 ?? void 0,
        component: mod.default,
        css: rawMod.css
    };
}

class MockBuildCache {
    #files;
    root = "";
    clientEntry = "";
    islandRegistry = /* @__PURE__ */ new Map();
    features = {
        errorOverlay: false
    };

    constructor(files, mode) {
        this.features.errorOverlay = mode === "development";
        this.#files = files;
    }

    getEntryAssets() {
        return [];
    }

    getFsRoutes() {
        return fsItemsToCommands(this.#files);
    }

    readFile(_pathname) {
        return Promise.resolve(null);
    }
}

const DEFAULT_CONN_INFO = {
    localAddr: {
        transport: "tcp",
        hostname: "localhost",
        port: 8080
    },
    remoteAddr: {
        transport: "tcp",
        hostname: "localhost",
        port: 1234
    }
};
const defaultOptionsHandler = (methods) => {
    return () => Promise.resolve(new Response(null, {
        status: 204,
        headers: {
            Allow: methods.join(", ")
        }
    }));
};
const DEFAULT_ERROR_HANDLER = async (ctx) => {
    const {
        error
    } = ctx;
    if (error instanceof HttpError) {
        if (error.status >= 500) {
            console.error(error);
        }
        return new Response(error.message, {
            status: error.status
        });
    }
    console.error(error);
    return new Response("Internal server error", {
        status: 500
    });
};

function createOnListen(basePath, options2) {
    return (params) => {
        const pathname = basePath + "/";
        const protocol = "key" in options2 && options2.key && options2.cert ? "https:" : "http:";
        let hostname = params.hostname;
        if (Deno.build.os === "windows" && (hostname === "0.0.0.0" || hostname === "::")) {
            hostname = "localhost";
        }
        hostname = hostname.startsWith("::") ? `[${hostname}]` : hostname;
        console.log();
        console.log(bgRgb8(rgb8(" 🍋 Fresh ready   ", 0), 121));
        const sep = options2.remoteAddress ? "" : "\n";
        const space = options2.remoteAddress ? " " : "";
        const localLabel = bold("Local:");
        const address = cyan(`${protocol}//${hostname}:${params.port}${pathname}`);
        const helper = hostname === "0.0.0.0" || hostname === "::" ? cyan(` (${protocol}//localhost:${params.port}${pathname})`) : "";
        console.log(`    ${localLabel}  ${space}${address}${helper}${sep}`);
        if (options2.remoteAddress) {
            const remoteLabel = bold("Remote:");
            const remoteAddress = cyan(options2.remoteAddress);
            console.log(`    ${remoteLabel}  ${remoteAddress}
`);
        }
    };
}

async function listenOnFreePort(options2, handler2) {
    let firstError = null;
    for (let port = 8e3; port < 8020; port++) {
        try {
            return await Deno.serve({
                ...options2,
                port
            }, handler2);
        } catch (err) {
            if (err instanceof Deno.errors.AddrInUse) {
                if (!firstError) firstError = err;
                continue;
            }
            throw err;
        }
    }
    throw firstError;
}

let setBuildCache;
const NOOP = () => {
};

class App {
    constructor(config2 = {}) {
        __privateAdd(this, _getBuildCache, () => null);
        __privateAdd(this, _commands, []);
        __privateAdd(this, _onError, NOOP);
        __publicField(this, "config");
        this.config = {
            root: ".",
            basePath: config2.basePath ?? "",
            mode: config2.mode ?? "production"
        };
    }

    use(pathOrMiddleware, ...middlewares) {
        let pattern;
        let fns;
        if (typeof pathOrMiddleware === "string") {
            pattern = pathOrMiddleware;
            fns = middlewares;
        } else {
            pattern = "*";
            middlewares.unshift(pathOrMiddleware);
            fns = middlewares;
        }
        __privateGet(this, _commands).push(newMiddlewareCmd(pattern, fns, true));
        return this;
    }

    /**
     * Set the app's 404 error handler. Can be a {@linkcode Route} or a {@linkcode Middleware}.
     */
    notFound(routeOrMiddleware) {
        __privateGet(this, _commands).push(newNotFoundCmd(routeOrMiddleware));
        return this;
    }

    onError(path, routeOrMiddleware) {
        __privateGet(this, _commands).push(newErrorCmd(path, routeOrMiddleware, true));
        return this;
    }

    appWrapper(component) {
        __privateGet(this, _commands).push(newAppCmd(component));
        return this;
    }

    layout(path, component, config2) {
        __privateGet(this, _commands).push(newLayoutCmd(path, component, config2, true));
        return this;
    }

    route(path, route, config2) {
        __privateGet(this, _commands).push(newRouteCmd(path, route, config2, false));
        return this;
    }

    /**
     * Add middlewares for GET requests at the specified path.
     */
    get(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("GET", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for POST requests at the specified path.
     */
    post(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("POST", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for PATCH requests at the specified path.
     */
    patch(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("PATCH", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for PUT requests at the specified path.
     */
    put(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("PUT", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for DELETE requests at the specified path.
     */
    delete(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("DELETE", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for HEAD requests at the specified path.
     */
    head(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("HEAD", path, middlewares, false));
        return this;
    }

    /**
     * Add middlewares for all HTTP verbs at the specified path.
     */
    all(path, ...middlewares) {
        __privateGet(this, _commands).push(newHandlerCmd("ALL", path, middlewares, false));
        return this;
    }

    /**
     * Insert file routes collected in {@linkcode Builder} at this point.
     * @param pattern Append file routes at this pattern instead of the root
     * @returns
     */
    fsRoutes(pattern = "*") {
        __privateGet(this, _commands).push({
            type: CommandType.FsRoute,
            pattern,
            getItems: () => {
                const buildCache = __privateGet(this, _getBuildCache).call(this);
                if (buildCache === null) return [];
                return buildCache.getFsRoutes();
            },
            includeLastSegment: false
        });
        return this;
    }

    /**
     * Merge another {@linkcode App} instance into this app at the
     * specified path.
     */
    mountApp(path, app2) {
        for (let i2 = 0; i2 < __privateGet(app2, _commands).length; i2++) {
            const cmd = __privateGet(app2, _commands)[i2];
            if (cmd.type !== CommandType.App && cmd.type !== CommandType.NotFound) {
                let effectivePattern = cmd.pattern;
                if (app2.config.basePath) {
                    effectivePattern = mergePath(app2.config.basePath, cmd.pattern, false);
                }
                const clone = {
                    ...cmd,
                    pattern: mergePath(path, effectivePattern, true),
                    includeLastSegment: cmd.pattern === "/" || cmd.includeLastSegment
                };
                __privateGet(this, _commands).push(clone);
                continue;
            }
            __privateGet(this, _commands).push(cmd);
        }
        const self2 = this;
        __privateSet(app2, _getBuildCache, () => {
            var _a2;
            return __privateGet(_a2 = self2, _getBuildCache).call(_a2);
        });
        return this;
    }

    /**
     * Create handler function for `Deno.serve` or to be used in
     * testing.
     */
    handler() {
        let buildCache = __privateGet(this, _getBuildCache).call(this);
        if (buildCache === null) {
            if (this.config.mode === "production" && DENO_DEPLOYMENT_ID !== void 0) ;
            else {
                buildCache = new MockBuildCache([], this.config.mode);
            }
        }
        const router = new UrlPatternRouter();
        const {
            rootMiddlewares
        } = applyCommands(router, __privateGet(this, _commands), this.config.basePath);
        return async (req, conn = DEFAULT_CONN_INFO) => {
            const url = new URL(req.url);
            url.pathname = url.pathname.replace(/\/+/g, "/");
            const method = req.method.toUpperCase();
            const matched = router.match(method, url);
            let {
                params,
                pattern,
                handlers: handlers2,
                methodMatch
            } = matched;
            const span = _trace.getActiveSpan();
            if (span && pattern) {
                span.updateName(`${method} ${pattern}`);
                span.setAttribute("http.route", pattern);
            }
            let next;
            if (pattern === null || !methodMatch) {
                handlers2 = rootMiddlewares;
            }
            if (matched.pattern !== null && !methodMatch) {
                if (method === "OPTIONS") {
                    const allowed = router.getAllowedMethods(matched.pattern);
                    next = defaultOptionsHandler(allowed);
                } else {
                    next = DEFAULT_NOT_ALLOWED_METHOD;
                }
            } else {
                next = DEFAULT_NOT_FOUND;
            }
            const ctx = new Context(req, url, conn, matched.pattern, params, this.config, next, buildCache);
            try {
                if (handlers2.length === 0) return await next();
                const result = await runMiddlewares(handlers2, ctx, __privateGet(this, _onError));
                if (!(result instanceof Response)) {
                    throw new Error(`Expected a "Response" instance to be returned, but got: ${result}`);
                }
                if (method === "HEAD") {
                    return new Response(null, result);
                }
                return result;
            } catch (err) {
                ctx.error = err;
                return await DEFAULT_ERROR_HANDLER(ctx);
            }
        };
    }

    /**
     * Spawn a server for this app.
     */
    async listen(options2 = {}) {
        if (!options2.onListen) {
            options2.onListen = createOnListen(this.config.basePath, options2);
        }
        const handler2 = this.handler();
        if (options2.port) {
            await Deno.serve(options2, handler2);
            return;
        }
        await listenOnFreePort(options2, handler2);
    }
}

_getBuildCache = /* @__PURE__ */ new WeakMap();
_commands = /* @__PURE__ */ new WeakMap();
_onError = /* @__PURE__ */ new WeakMap();
setBuildCache = (app2, cache, mode) => {
    app2.config.root = cache.root;
    app2.config.mode = mode;
    __privateSet(app2, _getBuildCache, () => cache);
};

class ProdBuildCache {
    root;
    #snapshot;
    islandRegistry;
    clientEntry;
    features;

    constructor(root2, snapshot2) {
        this.root = root2;
        this.features = {
            errorOverlay: false
        };
        setBuildId(snapshot2.version);
        this.#snapshot = snapshot2;
        this.islandRegistry = snapshot2.islands;
        this.clientEntry = snapshot2.clientEntry;
    }

    getEntryAssets() {
        return this.#snapshot.entryAssets;
    }

    getFsRoutes() {
        return fsItemsToCommands(this.#snapshot.fsRoutes);
    }

    async readFile(pathname) {
        const {
            staticFiles: staticFiles2
        } = this.#snapshot;
        const info = staticFiles2.get(pathname);
        if (info === void 0) return null;
        const filePath = isAbsolute(info.filePath) ? info.filePath : join(this.root, info.filePath);
        const [stat, file] = await Promise.all([Deno.stat(filePath), Deno.open(filePath)]);
        return {
            hash: info.hash,
            contentType: info.contentType,
            size: stat.size,
            readable: file.readable,
            close: () => file.close()
        };
    }
}

class IslandPreparer {
    #namer = new UniqueNamer();

    prepare(registry, mod, chunkName, modName, css2) {
        for (const [name, value] of Object.entries(mod)) {
            if (typeof value !== "function") continue;
            const islandName = name === "default" ? modName : name;
            const uniqueName = this.#namer.getUniqueName(islandName);
            const fn = value;
            registry.set(fn, {
                exportName: name,
                file: chunkName,
                fn,
                name: uniqueName,
                css: css2
            });
        }
    }
}

const $$_tpl_1$8 = ['<path fill-rule="evenodd" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" clip-rule="evenodd"></path>'];

function GithubIcon(props) {
    return u$7("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 496 512",
        "aria-hidden": "true",
        fill: "currentColor",
        ...props,
        children: a$4($$_tpl_1$8)
    });
}

const $$_tpl_1$7 = ['<path fill-rule="evenodd" d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" clip-rule="evenodd"></path>'];

function WikiIcon(props) {
    return u$7("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 448 512",
        "aria-hidden": "true",
        fill: "currentColor",
        ...props,
        children: a$4($$_tpl_1$7)
    });
}

const $$_tpl_1$6 = ['<header id="top" ', '><nav class="navbar max-w-7xl mx-auto"><div class="navbar-start gap-8">', "", "", '</div><div class="navbar-end"><ul class="menu menu-horizontal gap-2">', "</ul></div></nav></header>"];
const $$_tpl_2$3 = ["<li ", ">", "</li>"];

function Header() {
    const [isScrolled, setIsScrolled] = d$8(false);
    const socialLinks = [{
        href: "https://wiki.xodium.org",
        label: "Wiki",
        Icon: WikiIcon,
        isExternal: true
    }, {
        href: "https://github.com/XodiumSoftware",
        label: "Github",
        Icon: GithubIcon,
        isExternal: true
    }];
    y$6(() => {
        const handleScroll = () => setIsScrolled(globalThis.scrollY > 0);
        globalThis.addEventListener("scroll", handleScroll);
        return () => globalThis.removeEventListener("scroll", handleScroll);
    }, []);
    return a$4($$_tpl_1$6, l$6("class", `z-20 relative sticky top-0 transition-all duration-300 ${isScrolled ? "glass shadow-2xl shadow-black" : "bg-transparent"}`), u$7("a", {
        href: "",
        class: "p-0",
        children: u$7("img", {
            src: "/favicon.svg",
            alt: "Xodium Icon",
            class: "h-12 w-12"
        })
    }), u$7("a", {
        href: "#projects",
        class: "hover:text-primary text-sm font-semibold",
        children: "PROJECTS"
    }), u$7("a", {
        href: "#team",
        class: "hover:text-primary text-sm font-semibold",
        children: "TEAM"
    }), s$5(socialLinks.map(({
                                 href,
                                 label,
                                 Icon,
                                 isExternal
                             }) => a$4($$_tpl_2$3, l$6("key", href), u$7("a", {
        class: "hover:text-primary hover:bg-transparent",
        href,
        "aria-label": label,
        title: label,
        target: isExternal ? "_blank" : void 0,
        rel: isExternal ? "noopener noreferrer" : void 0,
        children: u$7(Icon, {
            className: "w-6 h-6",
            "aria-hidden": "true"
        })
    })))));
}

const header = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: Header
}, Symbol.toStringTag, {
    value: "Module"
}));
const $$_tpl_1$5 = ['<path fill-rule="evenodd" clip-rule="evenodd" d="M2 2.5C2 1.83696 2.26339 1.20107 2.73223 0.732233C3.20108 0.263392 3.83696 0 4.5 0H13.25C13.4489 0 13.6397 0.0790176 13.7803 0.21967C13.921 0.360322 14 0.551088 14 0.75V13.25C14 13.4489 13.921 13.6397 13.7803 13.7803C13.6397 13.921 13.4489 14 13.25 14H10.75C10.5511 14 10.3603 13.921 10.2197 13.7803C10.079 13.6397 10 13.4489 10 13.25C10 13.0511 10.079 12.8603 10.2197 12.7197C10.3603 12.579 10.5511 12.5 10.75 12.5H12.5V10.5H4.5C4.30308 10.5 4.11056 10.5582 3.94657 10.6672C3.78257 10.7762 3.65442 10.9312 3.57816 11.1128C3.50191 11.2943 3.48096 11.4943 3.51793 11.6878C3.5549 11.8812 3.64816 12.0594 3.786 12.2C3.92524 12.3422 4.0023 12.5338 4.00024 12.7328C3.99818 12.9318 3.91716 13.1218 3.775 13.261C3.63285 13.4002 3.4412 13.4773 3.24222 13.4752C3.04325 13.4732 2.85324 13.3922 2.714 13.25C2.25571 12.7829 1.99929 12.1544 2 11.5V2.5ZM12.5 1.5V9H4.5C4.144 9 3.806 9.074 3.5 9.208V2.5C3.5 2.23478 3.60536 1.98043 3.79289 1.79289C3.98043 1.60536 4.23478 1.5 4.5 1.5H12.5ZM5 12.25V15.5C5 15.5464 5.01293 15.5919 5.03734 15.6314C5.06175 15.6709 5.09667 15.7028 5.1382 15.7236C5.17972 15.7444 5.22621 15.7532 5.27245 15.749C5.31869 15.7448 5.36286 15.7279 5.4 15.7L6.85 14.613C6.89328 14.5805 6.94591 14.563 7 14.563C7.05409 14.563 7.10673 14.5805 7.15 14.613L8.6 15.7C8.63714 15.7279 8.68131 15.7448 8.72755 15.749C8.77379 15.7532 8.82028 15.7444 8.8618 15.7236C8.90333 15.7028 8.93826 15.6709 8.96266 15.6314C8.98707 15.5919 9 15.5464 9 15.5V12.25C9 12.1837 8.97366 12.1201 8.92678 12.0732C8.87989 12.0263 8.81631 12 8.75 12H5.25C5.1837 12 5.12011 12.0263 5.07322 12.0732C5.02634 12.1201 5 12.1837 5 12.25Z"></path>'];

function GithubRepoIcon(props) {
    return u$7("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        "aria-hidden": "true",
        fill: "currentColor",
        ...props,
        children: a$4($$_tpl_1$5)
    });
}

const $$_tpl_1$4 = ["<span ", " ", "></span>"];
const $$_tpl_2$2 = ['<div class="card bg-base-200/50 backdrop-blur shadow-xl hover:ring-2 hover:ring-primary h-full transition-all"><div class="card-body"><h2 class="card-title text-primary">', "", '</h2><p class="text-base-content/70 flex-grow">', "</p>", "</div></div>"];
const $$_tpl_3$2 = ['<div class="card-actions justify-start mt-auto"><div class="flex items-center gap-1 text-base-content/60 text-sm">', "", "</div></div>"];

function LanguageCircle({
                            language
                        }) {
    const colorMap = {
        Rust: "bg-[#dea584]",
        TypeScript: "bg-[#3178c6]",
        JavaScript: "bg-[#f1e05a]",
        Python: "bg-[#3572A5]",
        HTML: "bg-[#e34c26]",
        CSS: "bg-[#563d7c]",
        Java: "bg-[#b07219]",
        Go: "bg-[#00ADD8]",
        C: "bg-[#555555]",
        "C++": "bg-[#f34b7d]",
        Kotlin: "bg-[#A97BFF]",
        java: "bg-[#b07219]"
    };
    const color = colorMap[language] || "bg-base-content/50";
    return a$4($$_tpl_1$4, l$6("class", `badge badge-sm ${color} mr-1`), l$6("title", language));
}

function ProjectCard({
                         title,
                         description,
                         link,
                         language
                     }) {
    return u$7("a", {
        href: link || "#",
        target: "_blank",
        rel: "noopener noreferrer",
        children: a$4($$_tpl_2$2, u$7(GithubRepoIcon, {
            className: "w-5 h-5 text-base-content/60"
        }), s$5(title), s$5(description), s$5(language && a$4($$_tpl_3$2, u$7(LanguageCircle, {
            language
        }), s$5(language))))
    });
}

function trailingSlashes(mode) {
    return function trailingSlashesMiddleware(ctx) {
        const url = ctx.url;
        if (url.pathname !== "/") {
            if (url.pathname.endsWith("/")) {
                return ctx.redirect(`${url.pathname.slice(0, -1)}${url.search}`);
            }
        }
        return ctx.next();
    };
}

function staticFiles$1() {
    return async function freshServeStaticFiles(ctx) {
        const {
            req,
            url,
            config: config2
        } = ctx;
        const buildCache = getBuildCache(ctx);
        if (buildCache === null) return await ctx.next();
        let pathname = decodeURIComponent(url.pathname);
        if (config2.basePath) {
            pathname = pathname !== config2.basePath ? pathname.slice(config2.basePath.length) : "/";
        }
        const startTime = performance.now() + performance.timeOrigin;
        const file = await buildCache.readFile(pathname);
        if (pathname === "/" || file === null) {
            if (pathname === "/favicon.ico") {
                return new Response(null, {
                    status: 404
                });
            }
            return await ctx.next();
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
            file.close();
            return new Response("Method Not Allowed", {
                status: 405
            });
        }
        const span = tracer.startSpan("static file", {
            attributes: {
                "fresh.span_type": "static_file"
            },
            startTime
        });
        try {
            const cacheKey = url.searchParams.get(ASSET_CACHE_BUST_KEY);
            if (cacheKey !== null && BUILD_ID !== cacheKey) {
                url.searchParams.delete(ASSET_CACHE_BUST_KEY);
                const location2 = url.pathname + url.search;
                file.close();
                span.setAttribute("fresh.cache", "invalid_bust_key");
                span.setAttribute("fresh.cache_key", cacheKey);
                return new Response(null, {
                    status: 307,
                    headers: {
                        location: location2
                    }
                });
            }
            const etag = file.hash;
            const headers = new Headers({
                "Content-Type": file.contentType,
                vary: "If-None-Match"
            });
            if (ctx.config.mode !== "development") {
                const ifNoneMatch = req.headers.get("If-None-Match");
                if (ifNoneMatch !== null && (ifNoneMatch === etag || ifNoneMatch === `W/"${etag}"`)) {
                    file.close();
                    span.setAttribute("fresh.cache", "not_modified");
                    return new Response(null, {
                        status: 304,
                        headers
                    });
                } else if (etag !== null) {
                    headers.set("Etag", `W/"${etag}"`);
                }
            }
            if (ctx.config.mode !== "development" && (BUILD_ID === cacheKey || url.pathname.startsWith(`${ctx.config.basePath}/_fresh/js/${BUILD_ID}/`))) {
                span.setAttribute("fresh.cache", "immutable");
                headers.append("Cache-Control", "public, max-age=31536000, immutable");
            } else {
                span.setAttribute("fresh.cache", "no_cache");
                headers.append("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            }
            headers.set("Content-Length", String(file.size));
            if (req.method === "HEAD") {
                file.close();
                return new Response(null, {
                    status: 200,
                    headers
                });
            }
            return new Response(file.readable, {
                headers
            });
        } finally {
            span.end();
        }
    };
}

function csrf(options2) {
    const isAllowedOrigin = (origin, ctx) => {
        if (origin === null) {
            return false;
        }
        const optsOrigin = options2?.origin;
        if (!optsOrigin) {
            return origin === ctx.url.origin;
        }
        if (typeof optsOrigin === "string") {
            return origin === optsOrigin;
        }
        if (typeof optsOrigin === "function") {
            return optsOrigin(origin, ctx);
        }
        return Array.isArray(optsOrigin) && optsOrigin.includes(origin);
    };
    return async (ctx) => {
        const {
            method,
            headers
        } = ctx.req;
        if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
            return await ctx.next();
        }
        const secFetchSite = headers.get("Sec-Fetch-Site");
        const origin = headers.get("origin");
        if (secFetchSite !== null) {
            if (secFetchSite === "same-origin" || secFetchSite === "none" || isAllowedOrigin(origin, ctx)) {
                return await ctx.next();
            }
            throw new HttpError(403);
        }
        if (origin === null) {
            return await ctx.next();
        }
        if (isAllowedOrigin(origin, ctx)) {
            return await ctx.next();
        }
        throw new HttpError(403);
    };
}

function cors(options2) {
    const opts = {
        origin: "*",
        allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
        allowHeaders: [],
        exposeHeaders: [],
        ...options2
    };
    const addHeaderProperties = (headers, allowOrigin, opts2) => {
        if (allowOrigin) {
            headers.set("Access-Control-Allow-Origin", allowOrigin);
        }
        if (opts2.credentials) {
            headers.set("Access-Control-Allow-Credentials", "true");
        }
        if (opts2.exposeHeaders?.length) {
            headers.set("Access-Control-Expose-Headers", opts2.exposeHeaders.join(","));
        }
    };
    const optsOrigin = opts.origin;
    return async (ctx) => {
        const requestOrigin = ctx.req.headers.get("origin") || "";
        let allowOrigin = null;
        if (typeof optsOrigin === "string") {
            if (optsOrigin === "*") {
                allowOrigin = optsOrigin;
            } else {
                allowOrigin = optsOrigin === requestOrigin ? requestOrigin : null;
            }
        } else if (typeof optsOrigin === "function") {
            allowOrigin = optsOrigin(requestOrigin, ctx) ?? null;
        } else {
            allowOrigin = optsOrigin.includes(requestOrigin) ? requestOrigin : null;
        }
        const vary = /* @__PURE__ */ new Set();
        if (opts.origin !== "*" && allowOrigin && allowOrigin !== "*") {
            vary.add("Origin");
        }
        if (ctx.req.method === "OPTIONS") {
            const headers = new Headers();
            addHeaderProperties(headers, allowOrigin, opts);
            if (opts.maxAge != null) {
                headers.set("Access-Control-Max-Age", opts.maxAge.toString());
            }
            if (opts.allowMethods?.length) {
                headers.set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
            }
            let allowHeaders = opts.allowHeaders;
            if (!allowHeaders?.length) {
                const reqHeaders = ctx.req.headers.get("Access-Control-Request-Headers");
                if (reqHeaders) {
                    allowHeaders = reqHeaders.split(/\s*,\s*/);
                }
            }
            if (allowHeaders?.length) {
                headers.set("Access-Control-Allow-Headers", allowHeaders.join(","));
                vary.add("Access-Control-Request-Headers");
            }
            if (vary.size > 0) {
                headers.set("Vary", Array.from(vary).join(", "));
            } else {
                headers.delete("Vary");
            }
            headers.delete("Content-Length");
            headers.delete("Content-Type");
            return new Response(null, {
                status: 204,
                statusText: "No Content",
                headers
            });
        }
        const res = await ctx.next();
        addHeaderProperties(res.headers, allowOrigin, opts);
        if (vary.size > 0) {
            const existing = res.headers.get("Vary");
            if (existing) {
                existing.split(/\s*,\s*/).forEach((v2) => vary.add(v2));
            }
            res.headers.set("Vary", Array.from(vary).join(", "));
        }
        return res;
    };
}

function createDefine() {
    return {
        handlers(handlers2) {
            return handlers2;
        },
        page(render) {
            return render;
        },
        layout(render) {
            return render;
        },
        middleware(middleware) {
            return middleware;
        }
    };
}

const SECOND = 1e3;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const define$1 = createDefine();
const CONFIG = {
    version: "3.4.0"
};
const GITHUB = {
    api: {
        url: "https://api.github.com",
        version: "2022-11-28",
        members: {
            cacheExpiry: HOUR
        }
    },
    org: {
        name: "XodiumSoftware",
        user_agent: "XodiumSoftware/xodium.org"
    }
};
const $$_tpl_1$3 = ['<div class="flex items-center justify-center text-center"><span class="loading loading-spinner loading-lg text-primary"></span></div>'];
const $$_tpl_2$1 = ['<div class="flex items-center justify-center text-center"><span class="text-error">', "</span></div>"];
const $$_tpl_3$1 = ['<div class="flex items-center justify-center text-center"><span class="text-base-content/70">No projects found.</span></div>'];
const $$_tpl_4$1 = ['<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">', "</div>"];

function ProjectGrid() {
    const [projects, setProjects] = d$8([]);
    const [isLoading, setIsLoading] = d$8(true);
    const [error, setError] = d$8(null);
    y$6(() => {
        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/github/org/repos?org=${GITHUB.org.name}`);
                if (!response.ok) {
                    console.error(`Failed to fetch organization projects: ${response.status} ${response.statusText}`);
                    setError("Failed to load projects.");
                    return;
                }
                const fetchedProjects = await response.json();
                setProjects(fetchedProjects);
            } catch (e2) {
                console.error("Error fetching organization projects:", e2);
                setError("Failed to load team projects.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);
    if (isLoading) {
        return a$4($$_tpl_1$3);
    }
    if (error) {
        return a$4($$_tpl_2$1, s$5(error));
    }
    if (!projects || projects.length === 0) {
        return a$4($$_tpl_3$1);
    }
    return a$4($$_tpl_4$1, s$5(projects.map((project) => u$7(ProjectCard, {
        title: project.name,
        description: project.description,
        link: project.html_url,
        language: project.language
    }, project.name))));
}

const projectgrid = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: ProjectGrid
}, Symbol.toStringTag, {
    value: "Module"
}));
const $$_tpl_1$2 = ['<div class="flex items-center justify-center text-center"><span class="loading loading-spinner loading-lg text-primary"></span></div>'];
const $$_tpl_2 = ['<div class="flex items-center justify-center text-center"><span class="text-error">', "</span></div>"];
const $$_tpl_3 = ['<div class="flex items-center justify-center text-center"><span class="text-base-content/70">No team members found.</span></div>'];
const $$_tpl_4 = ['<div><ul class="menu">', "</ul></div>"];
const $$_tpl_6 = ['<div class="avatar"><div class="w-12 rounded-full ring-2 ring-transparent hover:ring-primary transition-all">', '</div></div><span class="font-medium">', "</span>"];
const $$_tpl_5 = ["<li ", ">", "</li>"];

function TeamGrid() {
    const [members, setMembers] = d$8([]);
    const [isLoading, setIsLoading] = d$8(true);
    const [error, setError] = d$8(null);
    y$6(() => {
        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/github/org/members?org=${GITHUB.org.name}`);
                if (!response.ok) {
                    console.error(`Failed to fetch organization members: ${response.status} ${response.statusText}`);
                    setError("Failed to load team members.");
                    return;
                }
                const fetchedMembers = await response.json();
                setMembers(fetchedMembers);
            } catch (e2) {
                console.error("Error fetching organization members:", e2);
                setError("Failed to load team members.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);
    if (isLoading) {
        return a$4($$_tpl_1$2);
    }
    if (error) {
        return a$4($$_tpl_2, s$5(error));
    }
    if (!members || members.length === 0) {
        return a$4($$_tpl_3);
    }
    return a$4($$_tpl_4, s$5(members.map((member) => a$4($$_tpl_5, l$6("key", member.login), u$7("a", {
        href: member.html_url,
        target: "_blank",
        rel: "noopener noreferrer",
        class: "hover:text-primary",
        "aria-label": `Link to ${member.login}'s GitHub profile`,
        children: a$4($$_tpl_6, u$7("img", {
            src: member.avatar_url,
            alt: member.login
        }), s$5(member.login))
    })))));
}

const teamgrid = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: TeamGrid
}, Symbol.toStringTag, {
    value: "Module"
}));
const $$_tpl_1$1 = ["<div ", ">", '<span class="cursor">|</span>', "</div>"];

function Typewriter({
                        text,
                        speed,
                        loop,
                        pause,
                        unwrite
                    }) {
    const [displayed, setDisplayed] = d$8("");
    const [letterIndex, setLetterIndex] = d$8(0);
    const [currentWordIndex, setCurrentWordIndex] = d$8(0);
    const [isDeleting, setIsDeleting] = d$8(false);
    const effectiveSpeed = (speed ?? 0.05) * 1e3;
    const [startPauseSec, endPauseSec] = Array.isArray(pause) ? pause : [pause ?? 1.5, pause ?? 1.5];
    const effectiveStartPause = startPauseSec * 1e3;
    const effectiveEndPause = endPauseSec * 1e3;
    const getDelay = () => effectiveSpeed * (0.85 + Math.random() * 0.3);
    y$6(() => {
        if (text.length === 0) return;
        const currentText = text[currentWordIndex];
        const nextWord = () => {
            setCurrentWordIndex((prev) => (prev + 1) % text.length);
            setLetterIndex(0);
            setDisplayed("");
        };
        let timer;
        if (!isDeleting) {
            if (letterIndex < currentText.length) {
                timer = globalThis.setTimeout(() => {
                    setDisplayed(currentText.slice(0, letterIndex + 1));
                    setLetterIndex((i2) => i2 + 1);
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
                    setLetterIndex((i2) => i2 - 1);
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
    }, [letterIndex, currentWordIndex, isDeleting, text, effectiveSpeed, effectiveStartPause, effectiveEndPause, loop, unwrite]);
    return a$4($$_tpl_1$1, l$6("style", {
        display: "inline-block"
    }), s$5(displayed), u$7("style", {
        jsx: true,
        children: `
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
      `
    }));
}

const typewriter = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: Typewriter
}, Symbol.toStringTag, {
    value: "Module"
}));
const $$_tpl_1 = ['<div class="fixed bottom-0 m-2 text-base-content/60 text-sm hidden 2xl:block">v', "</div>"];

function Version() {
    return a$4($$_tpl_1, s$5(CONFIG.version));
}

const _app = define$1.page(function App2({
                                             Component
                                         }) {
    return u$7("html", {
        "data-theme": "halloween",
        children: [u$7("head", {
            children: [u$7("meta", {
                charset: "utf-8"
            }), u$7("meta", {
                name: "viewport",
                content: "width=device-width, initial-scale=1.0"
            }), u$7("title", {
                children: "Xodium"
            }), u$7("link", {
                rel: "icon",
                href: "/favicon.svg"
            }), u$7("link", {
                rel: "icon",
                href: "/favicon.ico"
            })]
        }), u$7("body", {
            class: "bg-base-100 font-mono",
            children: [u$7(Component, null), u$7(Version, null)]
        })]
    });
});
const routeCss = ["__FRESH_CSS_PLACEHOLDER__"];
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute____app = _app;
const fsRoute_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    config,
    css,
    default: _freshRoute____app,
    handler,
    handlers
}, Symbol.toStringTag, {
    value: "Module"
}));
const clientEntry = "./assets/client-entry-D59Jw0Nv.js";
const version = "904d23463297ec274c25c3e17ca0cdde39555020";
const islands = /* @__PURE__ */ new Map();
const islandPreparer = new IslandPreparer();
islandPreparer.prepare(islands, header, "/assets/fresh-island__header-DC4SJUSe.js", "header", []);
islandPreparer.prepare(islands, projectgrid, "/assets/fresh-island__projectgrid-ptWvj1Od.js", "projectgrid", []);
islandPreparer.prepare(islands, teamgrid, "/assets/fresh-island__teamgrid-Nc4WvIZf.js", "teamgrid", []);
islandPreparer.prepare(islands, typewriter, "/assets/fresh-island__typewriter-C1FJa1ol.js", "typewriter", []);
const staticFiles = /* @__PURE__ */ new Map([["/assets/hooks.module-oEkfyXpz.js", {
    "name": "/assets/hooks.module-oEkfyXpz.js",
    "hash": "c6a8d73235de84711bb129ff41b9205997cdfbde5c46ca1986ea8d0f4992b5e7",
    "filePath": "client\\assets\\hooks.module-oEkfyXpz.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/jsxRuntime.module-k8ZWP7dz.js", {
    "name": "/assets/jsxRuntime.module-k8ZWP7dz.js",
    "hash": "fe3ca2fe3c969beccfb0f1771ccaa7b0315f5d47ed05e24f593403e2ec85e8c5",
    "filePath": "client\\assets\\jsxRuntime.module-k8ZWP7dz.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/shared-B0kfBWUe.js", {
    "name": "/assets/shared-B0kfBWUe.js",
    "hash": "5b1adcedb2c659b325aeaf0d4194336ecf40ea9ddd859585f309cc52b2df2e9a",
    "filePath": "client\\assets\\shared-B0kfBWUe.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/utils-BsZALWcG.js", {
    "name": "/assets/utils-BsZALWcG.js",
    "hash": "aedc23b81f52264a8b8d81594760bee35f1af3f0c7f78d4e2d7a481338298383",
    "filePath": "client\\assets\\utils-BsZALWcG.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/client-entry-D59Jw0Nv.js", {
    "name": "/assets/client-entry-D59Jw0Nv.js",
    "hash": "37003d1401d81a1ac1bf57852090c827f84bfb6aef268186958c3143b63a2ba9",
    "filePath": "client\\assets\\client-entry-D59Jw0Nv.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/client-entry-DNNfnxUX.css", {
    "name": "/assets/client-entry-DNNfnxUX.css",
    "hash": "4b0ed4be410aa6acfb38978038ae0e6105c7894c03952609d08272ef631d9b8a",
    "filePath": "client\\assets\\client-entry-DNNfnxUX.css",
    "contentType": "text/css; charset=UTF-8"
}], ["/assets/fresh-island__header-DC4SJUSe.js", {
    "name": "/assets/fresh-island__header-DC4SJUSe.js",
    "hash": "7afc623a6c5602d036d8a1353855c3fd7c2c39f4728aacdb7253362602449be1",
    "filePath": "client\\assets\\fresh-island__header-DC4SJUSe.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/fresh-island__projectgrid-ptWvj1Od.js", {
    "name": "/assets/fresh-island__projectgrid-ptWvj1Od.js",
    "hash": "a7edf4ec51ef77bfc7f77a8439624dfc7a8f6d2fde566700899c4c613b5e00f8",
    "filePath": "client\\assets\\fresh-island__projectgrid-ptWvj1Od.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/fresh-island__teamgrid-Nc4WvIZf.js", {
    "name": "/assets/fresh-island__teamgrid-Nc4WvIZf.js",
    "hash": "d1daf6553a57387d997ef3147911c88703049db333bd009ab979815aa90453bc",
    "filePath": "client\\assets\\fresh-island__teamgrid-Nc4WvIZf.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/assets/fresh-island__typewriter-C1FJa1ol.js", {
    "name": "/assets/fresh-island__typewriter-C1FJa1ol.js",
    "hash": "5f6a947d78217ce3124bf8d0fda954ad12443e8060fd5d93d91d44a0aa705ecd",
    "filePath": "client\\assets\\fresh-island__typewriter-C1FJa1ol.js",
    "contentType": "text/javascript; charset=UTF-8"
}], ["/favicon.ico", {
    "name": "/favicon.ico",
    "hash": "e73b108af377b0c8b5bd1396fa29aa203f0d9b9f085f6c4bf963b7677a03bcfc",
    "filePath": "client\\favicon.ico",
    "contentType": "image/vnd.microsoft.icon"
}], ["/favicon.svg", {
    "name": "/favicon.svg",
    "hash": "b57fa3935521854aee97ef8b976e1c2df424041fe0b6c9b2cda7065f7489425f",
    "filePath": "client\\favicon.svg",
    "contentType": "image/svg+xml"
}]]);
const entryAssets = ["/assets/client-entry-DNNfnxUX.css"];
const fsRoutes = [{
    id: "/_app",
    mod: fsRoute_0,
    type: "app",
    pattern: "*",
    routePattern: "*"
}, {
    id: "/index",
    mod: () => import("./_fresh-route___index-DULxldMb-yRYj3LFJ.mjs"),
    type: "route",
    pattern: "/",
    routePattern: "/"
}];
const snapshot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    clientEntry,
    entryAssets,
    fsRoutes,
    islands,
    staticFiles,
    version
}, Symbol.toStringTag, {
    value: "Module"
}));
var h$5 = /^v1\./, u$4 = /^ghs_/, c$1 = /^ghu_/;

async function i(t2) {
    let o2 = t2.split(/\./).length === 3, e2 = h$5.test(t2) || u$4.test(t2), r2 = c$1.test(t2);
    return {
        type: "token",
        token: t2,
        tokenType: o2 ? "app" : e2 ? "installation" : r2 ? "user-to-server" : "oauth"
    };
}

function s$2(t2) {
    return t2.split(/\./).length === 3 ? `bearer ${t2}` : `token ${t2}`;
}

async function a$1(t2, o2, e2, r2) {
    let n2 = o2.endpoint.merge(e2, r2);
    return n2.headers.authorization = s$2(t2), o2(n2);
}

var _ = function (o2) {
    if (!o2) throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
    if (typeof o2 != "string") throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
    return o2 = o2.replace(/^(token|bearer) +/i, ""), Object.assign(i.bind(null, o2), {
        hook: a$1.bind(null, o2)
    });
};

function e() {
    return typeof navigator == "object" && "userAgent" in navigator ? navigator.userAgent : typeof __Process$ == "object" && __Process$.version !== void 0 ? `Node.js/${__Process$.version.substr(1)} (${__Process$.platform}; ${__Process$.arch})` : "<environment undetectable>";
}

var v$2 = "9.0.6";
var R$1 = `octokit-endpoint.js/${v$2} ${e()}`, w$2 = {
    method: "GET",
    baseUrl: "https://api.github.com",
    headers: {
        accept: "application/vnd.github.v3+json",
        "user-agent": R$1
    },
    mediaType: {
        format: ""
    }
};

function T$1(e2) {
    return e2 ? Object.keys(e2).reduce((t2, r2) => (t2[r2.toLowerCase()] = e2[r2], t2), {}) : {};
}

function U$1(e2) {
    if (typeof e2 != "object" || e2 === null || Object.prototype.toString.call(e2) !== "[object Object]") return false;
    let t2 = Object.getPrototypeOf(e2);
    if (t2 === null) return true;
    let r2 = Object.prototype.hasOwnProperty.call(t2, "constructor") && t2.constructor;
    return typeof r2 == "function" && r2 instanceof r2 && Function.prototype.call(r2) === Function.prototype.call(e2);
}

function h$4(e2, t2) {
    let r2 = Object.assign({}, e2);
    return Object.keys(t2).forEach((i2) => {
        U$1(t2[i2]) ? i2 in e2 ? r2[i2] = h$4(e2[i2], t2[i2]) : Object.assign(r2, {
            [i2]: t2[i2]
        }) : Object.assign(r2, {
            [i2]: t2[i2]
        });
    }), r2;
}

function g$5(e2) {
    for (let t2 in e2) e2[t2] === void 0 && delete e2[t2];
    return e2;
}

function l$3(e2, t2, r2) {
    if (typeof t2 == "string") {
        let [n2, s2] = t2.split(" ");
        r2 = Object.assign(s2 ? {
            method: n2,
            url: s2
        } : {
            url: n2
        }, r2);
    } else r2 = Object.assign({}, t2);
    r2.headers = T$1(r2.headers), g$5(r2), g$5(r2.headers);
    let i2 = h$4(e2 || {}, r2);
    return r2.url === "/graphql" && (e2 && e2.mediaType.previews?.length && (i2.mediaType.previews = e2.mediaType.previews.filter((n2) => !i2.mediaType.previews.includes(n2)).concat(i2.mediaType.previews)), i2.mediaType.previews = (i2.mediaType.previews || []).map((n2) => n2.replace(/-preview/, ""))), i2;
}

function x$2(e2, t2) {
    let r2 = /\?/.test(e2) ? "&" : "?", i2 = Object.keys(t2);
    return i2.length === 0 ? e2 : e2 + r2 + i2.map((n2) => n2 === "q" ? "q=" + t2.q.split("+").map(encodeURIComponent).join("+") : `${n2}=${encodeURIComponent(t2[n2])}`).join("&");
}

var S = /\{[^{}}]+\}/g;

function F$2(e2) {
    return e2.replace(new RegExp("(?:^\\W+)|(?:(?<!\\W)\\W+$)", "g"), "").split(/,/);
}

function A$2(e2) {
    let t2 = e2.match(S);
    return t2 ? t2.map(F$2).reduce((r2, i2) => r2.concat(i2), []) : [];
}

function y$4(e2, t2) {
    let r2 = {
        __proto__: null
    };
    for (let i2 of Object.keys(e2)) t2.indexOf(i2) === -1 && (r2[i2] = e2[i2]);
    return r2;
}

function E$2(e2) {
    return e2.split(/(%[0-9A-Fa-f]{2})/g).map(function (t2) {
        return /%[0-9A-Fa-f]/.test(t2) || (t2 = encodeURI(t2).replace(/%5B/g, "[").replace(/%5D/g, "]")), t2;
    }).join("");
}

function p$2(e2) {
    return encodeURIComponent(e2).replace(/[!'()*]/g, function (t2) {
        return "%" + t2.charCodeAt(0).toString(16).toUpperCase();
    });
}

function m$4(e2, t2, r2) {
    return t2 = e2 === "+" || e2 === "#" ? E$2(t2) : p$2(t2), r2 ? p$2(r2) + "=" + t2 : t2;
}

function u$3(e2) {
    return e2 != null;
}

function b$2(e2) {
    return e2 === ";" || e2 === "&" || e2 === "?";
}

function V$1(e2, t2, r2, i2) {
    var n2 = e2[r2], s2 = [];
    if (u$3(n2) && n2 !== "") {
        if (typeof n2 == "string" || typeof n2 == "number" || typeof n2 == "boolean") n2 = n2.toString(), i2 && i2 !== "*" && (n2 = n2.substring(0, parseInt(i2, 10))), s2.push(m$4(t2, n2, b$2(t2) ? r2 : ""));
        else if (i2 === "*") Array.isArray(n2) ? n2.filter(u$3).forEach(function (c2) {
            s2.push(m$4(t2, c2, b$2(t2) ? r2 : ""));
        }) : Object.keys(n2).forEach(function (c2) {
            u$3(n2[c2]) && s2.push(m$4(t2, n2[c2], c2));
        });
        else {
            let c2 = [];
            Array.isArray(n2) ? n2.filter(u$3).forEach(function (o2) {
                c2.push(m$4(t2, o2));
            }) : Object.keys(n2).forEach(function (o2) {
                u$3(n2[o2]) && (c2.push(p$2(o2)), c2.push(m$4(t2, n2[o2].toString())));
            }), b$2(t2) ? s2.push(p$2(r2) + "=" + c2.join(",")) : c2.length !== 0 && s2.push(c2.join(","));
        }
    } else t2 === ";" ? u$3(n2) && s2.push(p$2(r2)) : n2 === "" && (t2 === "&" || t2 === "?") ? s2.push(p$2(r2) + "=") : n2 === "" && s2.push("");
    return s2;
}

function $(e2) {
    return {
        expand: I$1.bind(null, e2)
    };
}

function I$1(e2, t2) {
    var r2 = ["+", "#", ".", "/", ";", "?", "&"];
    return e2 = e2.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (i2, n2, s2) {
        if (n2) {
            let o2 = "", a2 = [];
            if (r2.indexOf(n2.charAt(0)) !== -1 && (o2 = n2.charAt(0), n2 = n2.substr(1)), n2.split(/,/g).forEach(function (O2) {
                var f2 = /([^:\*]*)(?::(\d+)|(\*))?/.exec(O2);
                a2.push(V$1(t2, o2, f2[1], f2[2] || f2[3]));
            }), o2 && o2 !== "+") {
                var c2 = ",";
                return o2 === "?" ? c2 = "&" : o2 !== "#" && (c2 = o2), (a2.length !== 0 ? o2 : "") + a2.join(c2);
            } else return a2.join(",");
        } else return E$2(s2);
    }), e2 === "/" ? e2 : e2.replace(/\/$/, "");
}

function d$6(e2) {
    let t2 = e2.method.toUpperCase(), r2 = (e2.url || "/").replace(/:([a-z]\w+)/g, "{$1}"),
        i2 = Object.assign({}, e2.headers), n2,
        s2 = y$4(e2, ["method", "baseUrl", "url", "headers", "request", "mediaType"]), c2 = A$2(r2);
    r2 = $(r2).expand(s2), /^http/.test(r2) || (r2 = e2.baseUrl + r2);
    let o2 = Object.keys(e2).filter((f2) => c2.includes(f2)).concat("baseUrl"), a2 = y$4(s2, o2);
    if (!/application\/octet-stream/i.test(i2.accept) && (e2.mediaType.format && (i2.accept = i2.accept.split(/,/).map((f2) => f2.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${e2.mediaType.format}`)).join(",")), r2.endsWith("/graphql") && e2.mediaType.previews?.length)) {
        let f2 = i2.accept.match(new RegExp("(?<![\\w-])[\\w-]+(?=-preview)", "g")) || [];
        i2.accept = f2.concat(e2.mediaType.previews).map((P2) => {
            let q2 = e2.mediaType.format ? `.${e2.mediaType.format}` : "+json";
            return `application/vnd.github.${P2}-preview${q2}`;
        }).join(",");
    }
    return ["GET", "HEAD"].includes(t2) ? r2 = x$2(r2, a2) : "data" in a2 ? n2 = a2.data : Object.keys(a2).length && (n2 = a2), !i2["content-type"] && typeof n2 < "u" && (i2["content-type"] = "application/json; charset=utf-8"), ["PATCH", "PUT"].includes(t2) && typeof n2 > "u" && (n2 = ""), Object.assign({
        method: t2,
        url: r2,
        headers: i2
    }, typeof n2 < "u" ? {
        body: n2
    } : null, e2.request ? {
        request: e2.request
    } : null);
}

function D$1(e2, t2, r2) {
    return d$6(l$3(e2, t2, r2));
}

function j$2(e2, t2) {
    let r2 = l$3(e2, t2), i2 = D$1.bind(null, r2);
    return Object.assign(i2, {
        DEFAULTS: r2,
        defaults: j$2.bind(null, r2),
        merge: l$3.bind(null, r2),
        parse: d$6
    });
}

var ye = j$2(null, w$2);
var r = class extends Error {
    constructor(t2) {
        super(t2), Error.captureStackTrace && Error.captureStackTrace(this, this.constructor), this.name = "Deprecation";
    }
};
var h$3 = Object.create;
var f$2 = Object.defineProperty;
var g$4 = Object.getOwnPropertyDescriptor;
var l$2 = Object.getOwnPropertyNames;
var m$3 = Object.getPrototypeOf, w$1 = Object.prototype.hasOwnProperty;
var j$1 = (r2, t2) => () => (t2 || r2((t2 = {
    exports: {}
}).exports, t2), t2.exports);
var v$1 = (r2, t2, o2, e2) => {
    if (t2 && typeof t2 == "object" || typeof t2 == "function") for (let n2 of l$2(t2)) !w$1.call(r2, n2) && n2 !== o2 && f$2(r2, n2, {
        get: () => t2[n2],
        enumerable: !(e2 = g$4(t2, n2)) || e2.enumerable
    });
    return r2;
};
var d$5 = (r2, t2, o2) => (o2 = r2 != null ? h$3(m$3(r2)) : {}, v$1(!r2 || !r2.__esModule ? f$2(o2, "default", {
    value: r2,
    enumerable: true
}) : o2, r2));
var y$3 = j$1((b2, i2) => {
    i2.exports = s2;

    function s2(r2, t2) {
        if (r2 && t2) return s2(r2)(t2);
        if (typeof r2 != "function") throw new TypeError("need wrapper function");
        return Object.keys(r2).forEach(function (e2) {
            o2[e2] = r2[e2];
        }), o2;

        function o2() {
            for (var e2 = new Array(arguments.length), n2 = 0; n2 < e2.length; n2++) e2[n2] = arguments[n2];
            var a2 = r2.apply(this, e2), p2 = e2[e2.length - 1];
            return typeof a2 == "function" && a2 !== p2 && Object.keys(p2).forEach(function (c2) {
                a2[c2] = p2[c2];
            }), a2;
        }
    }
});
var u$2 = d$5(y$3()), x$1 = u$2.default ?? u$2;
const __0$ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: x$1
}, Symbol.toStringTag, {
    value: "Module"
}));
var require$1 = (n2) => {
    const e2 = (m2) => typeof m2.default < "u" ? m2.default : m2;
    switch (n2) {
        case "wrappy":
            return e2(__0$);
        default:
            console.error('module "' + n2 + '" not found');
            return null;
    }
};
var s$1 = Object.create;
var l$1 = Object.defineProperty;
var d$4 = Object.getOwnPropertyDescriptor;
var m$2 = Object.getOwnPropertyNames;
var v = Object.getPrototypeOf, h$2 = Object.prototype.hasOwnProperty;
var y$2 = ((r2) => typeof require$1 < "u" ? require$1 : typeof Proxy < "u" ? new Proxy(r2, {
    get: (e2, t2) => (typeof require$1 < "u" ? require$1 : e2)[t2]
}) : r2)(function (r2) {
    if (typeof require$1 < "u") return require$1.apply(this, arguments);
    throw Error('Dynamic require of "' + r2 + '" is not supported');
});
var b$1 = (r2, e2) => () => (e2 || r2((e2 = {
    exports: {}
}).exports, e2), e2.exports);
var w = (r2, e2, t2, a2) => {
    if (e2 && typeof e2 == "object" || typeof e2 == "function") for (let n2 of m$2(e2)) !h$2.call(r2, n2) && n2 !== t2 && l$1(r2, n2, {
        get: () => e2[n2],
        enumerable: !(a2 = d$4(e2, n2)) || a2.enumerable
    });
    return r2;
};
var g$3 = (r2, e2, t2) => (t2 = r2 != null ? s$1(v(r2)) : {}, w(!r2 || !r2.__esModule ? l$1(t2, "default", {
    value: r2,
    enumerable: true
}) : t2, r2));
var f$1 = b$1((x2, u2) => {
    var i2 = y$2("wrappy");
    u2.exports = i2(o2);
    u2.exports.strict = i2(p2);
    o2.proto = o2(function () {
        Object.defineProperty(Function.prototype, "once", {
            value: function () {
                return o2(this);
            },
            configurable: true
        }), Object.defineProperty(Function.prototype, "onceStrict", {
            value: function () {
                return p2(this);
            },
            configurable: true
        });
    });

    function o2(r2) {
        var e2 = function () {
            return e2.called ? e2.value : (e2.called = true, e2.value = r2.apply(this, arguments));
        };
        return e2.called = false, e2;
    }

    function p2(r2) {
        var e2 = function () {
            if (e2.called) throw new Error(e2.onceError);
            return e2.called = true, e2.value = r2.apply(this, arguments);
        }, t2 = r2.name || "Function wrapped with `once`";
        return e2.onceError = t2 + " shouldn't be called more than once", e2.called = false, e2;
    }
});
var c = g$3(f$1()), {
    strict: E$1
} = c, F$1 = c.default ?? c;
var d$3 = F$1((r2) => console.warn(r2)), h$1 = F$1((r2) => console.warn(r2)), o = class extends Error {
    constructor(i2, c2, e2) {
        super(i2), Error.captureStackTrace && Error.captureStackTrace(this, this.constructor), this.name = "HttpError", this.status = c2;
        let t2;
        "headers" in e2 && typeof e2.headers < "u" && (t2 = e2.headers), "response" in e2 && (this.response = e2.response, t2 = e2.response.headers);
        let s2 = Object.assign({}, e2.request);
        e2.request.headers.authorization && (s2.headers = Object.assign({}, e2.request.headers, {
            authorization: e2.request.headers.authorization.replace(new RegExp("(?<! ) .*$"), " [REDACTED]")
        })), s2.url = s2.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]"), this.request = s2, Object.defineProperty(this, "code", {
            get() {
                return d$3(new r("[@octokit/request-error] `error.code` is deprecated, use `error.status`.")), c2;
            }
        }), Object.defineProperty(this, "headers", {
            get() {
                return h$1(new r("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`.")), t2 || {};
            }
        });
    }
};
var m$1 = "8.4.1";

function y$1(t2) {
    if (typeof t2 != "object" || t2 === null || Object.prototype.toString.call(t2) !== "[object Object]") return false;
    let r2 = Object.getPrototypeOf(t2);
    if (r2 === null) return true;
    let o2 = Object.prototype.hasOwnProperty.call(r2, "constructor") && r2.constructor;
    return typeof o2 == "function" && o2 instanceof o2 && Function.prototype.call(o2) === Function.prototype.call(t2);
}

function g$2(t2) {
    return t2.arrayBuffer();
}

function d$2(t2) {
    let r2 = t2.request && t2.request.log ? t2.request.log : console,
        o$12 = t2.request?.parseSuccessResponseBody !== false;
    (y$1(t2.body) || Array.isArray(t2.body)) && (t2.body = JSON.stringify(t2.body));
    let i2 = {}, n2, a2, {
        fetch: s2
    } = globalThis;
    if (t2.request?.fetch && (s2 = t2.request.fetch), !s2) throw new Error("fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing");
    return s2(t2.url, {
        method: t2.method,
        body: t2.body,
        redirect: t2.request?.redirect,
        headers: t2.headers,
        signal: t2.request?.signal,
        ...t2.body && {
            duplex: "half"
        }
    }).then(async (e2) => {
        a2 = e2.url, n2 = e2.status;
        for (let c2 of e2.headers) i2[c2[0]] = c2[1];
        if ("deprecation" in i2) {
            let c2 = i2.link && i2.link.match(/<([^<>]+)>; rel="deprecation"/), f2 = c2 && c2.pop();
            r2.warn(`[@octokit/request] "${t2.method} ${t2.url}" is deprecated. It is scheduled to be removed on ${i2.sunset}${f2 ? `. See ${f2}` : ""}`);
        }
        if (!(n2 === 204 || n2 === 205)) {
            if (t2.method === "HEAD") {
                if (n2 < 400) return;
                throw new o(e2.statusText, n2, {
                    response: {
                        url: a2,
                        status: n2,
                        headers: i2,
                        data: void 0
                    },
                    request: t2
                });
            }
            if (n2 === 304) throw new o("Not modified", n2, {
                response: {
                    url: a2,
                    status: n2,
                    headers: i2,
                    data: await h(e2)
                },
                request: t2
            });
            if (n2 >= 400) {
                let c2 = await h(e2);
                throw new o(p$1(c2), n2, {
                    response: {
                        url: a2,
                        status: n2,
                        headers: i2,
                        data: c2
                    },
                    request: t2
                });
            }
            return o$12 ? await h(e2) : e2.body;
        }
    }).then((e2) => ({
        status: n2,
        url: a2,
        headers: i2,
        data: e2
    })).catch((e2) => {
        if (e2 instanceof o) throw e2;
        if (e2.name === "AbortError") throw e2;
        let c2 = e2.message;
        throw e2.name === "TypeError" && "cause" in e2 && (e2.cause instanceof Error ? c2 = e2.cause.message : typeof e2.cause == "string" && (c2 = e2.cause)), new o(c2, 500, {
            request: t2
        });
    });
}

async function h(t2) {
    let r2 = t2.headers.get("content-type");
    return /application\/json/.test(r2) ? t2.json().catch(() => t2.text()).catch(() => "") : !r2 || /^text\/|charset=utf-8$/.test(r2) ? t2.text() : g$2(t2);
}

function p$1(t2) {
    if (typeof t2 == "string") return t2;
    let r2;
    return "documentation_url" in t2 ? r2 = ` - ${t2.documentation_url}` : r2 = "", "message" in t2 ? Array.isArray(t2.errors) ? `${t2.message}: ${t2.errors.map(JSON.stringify).join(", ")}${r2}` : `${t2.message}${r2}` : `Unknown error: ${JSON.stringify(t2)}`;
}

function l(t2, r2) {
    let o2 = t2.defaults(r2);
    return Object.assign(function (n2, a2) {
        let s2 = o2.merge(n2, a2);
        if (!s2.request || !s2.request.hook) return d$2(o2.parse(s2));
        let e2 = (c2, f2) => d$2(o2.parse(o2.merge(c2, f2)));
        return Object.assign(e2, {
            endpoint: o2,
            defaults: l.bind(null, o2)
        }), s2.request.hook(e2, s2);
    }, {
        endpoint: o2,
        defaults: l.bind(null, o2)
    });
}

var I = l(ye, {
    headers: {
        "user-agent": `octokit-request.js/${m$1} ${e()}`
    }
});
var p = "7.1.1";

function f(t2) {
    return `Request failed due to following response errors:
` + t2.errors.map((a2) => ` - ${a2.message}`).join(`
`);
}

var q = class extends Error {
        constructor(t2, a2, e2) {
            super(f(e2)), this.request = t2, this.headers = a2, this.response = e2, this.name = "GraphqlResponseError", this.errors = e2.errors, this.data = e2.data, Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
        }
    }, m = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"], g$1 = ["query", "method", "url"],
    d$1 = /\/api\/v3\/?$/;

function b(t2, a2, e2) {
    if (e2) {
        if (typeof a2 == "string" && "query" in e2) return Promise.reject(new Error('[@octokit/graphql] "query" cannot be used as variable name'));
        for (let r2 in e2) if (g$1.includes(r2)) return Promise.reject(new Error(`[@octokit/graphql] "${r2}" cannot be used as variable name`));
    }
    let n2 = typeof a2 == "string" ? Object.assign({
            query: a2
        }, e2) : a2,
        o2 = Object.keys(n2).reduce((r2, s2) => m.includes(s2) ? (r2[s2] = n2[s2], r2) : (r2.variables || (r2.variables = {}), r2.variables[s2] = n2[s2], r2), {}),
        i2 = n2.baseUrl || t2.endpoint.DEFAULTS.baseUrl;
    return d$1.test(i2) && (o2.url = i2.replace(d$1, "/api/graphql")), t2(o2).then((r2) => {
        if (r2.data.errors) {
            let s2 = {};
            for (let c2 of Object.keys(r2.headers)) s2[c2] = r2.headers[c2];
            throw new q(o2, s2, r2.data);
        }
        return r2.data.data;
    });
}

function u$1(t2, a2) {
    let e2 = t2.defaults(a2);
    return Object.assign((o2, i2) => b(e2, o2, i2), {
        defaults: u$1.bind(null, e2),
        endpoint: e2.endpoint
    });
}

u$1(I, {
    headers: {
        "user-agent": `octokit-graphql.js/${p} ${e()}`
    },
    method: "POST",
    url: "/graphql"
});

function A$1(t2) {
    return u$1(t2, {
        method: "POST",
        url: "/graphql"
    });
}

var A = Object.create;
var g = Object.defineProperty;
var j = Object.getOwnPropertyDescriptor;
var D = Object.getOwnPropertyNames;
var E = Object.getPrototypeOf, R = Object.prototype.hasOwnProperty;
var a = (e2, r2) => () => (r2 || e2((r2 = {
    exports: {}
}).exports, r2), r2.exports);
var F = (e2, r2, n2, i2) => {
    if (r2 && typeof r2 == "object" || typeof r2 == "function") for (let o2 of D(r2)) !R.call(e2, o2) && o2 !== n2 && g(e2, o2, {
        get: () => r2[o2],
        enumerable: !(i2 = j(r2, o2)) || i2.enumerable
    });
    return e2;
};
var M = (e2, r2, n2) => (n2 = e2 != null ? A(E(e2)) : {}, F(!e2 || !e2.__esModule ? g(n2, "default", {
    value: e2,
    enumerable: true
}) : n2, e2));
var d = a((J, b2) => {
    b2.exports = v2;

    function v2(e2, r2, n2, i2) {
        if (typeof n2 != "function") throw new Error("method for before hook must be a function");
        return i2 || (i2 = {}), Array.isArray(r2) ? r2.reverse().reduce(function (o2, u2) {
            return v2.bind(null, e2, u2, o2, i2);
        }, n2)() : Promise.resolve().then(function () {
            return e2.registry[r2] ? e2.registry[r2].reduce(function (o2, u2) {
                return u2.hook.bind(null, o2, i2);
            }, n2)() : n2(i2);
        });
    }
});
var y = a((K, p2) => {
    p2.exports = N2;

    function N2(e2, r2, n2, i2) {
        var o2 = i2;
        e2.registry[n2] || (e2.registry[n2] = []), r2 === "before" && (i2 = function (u2, t2) {
            return Promise.resolve().then(o2.bind(null, t2)).then(u2.bind(null, t2));
        }), r2 === "after" && (i2 = function (u2, t2) {
            var f2;
            return Promise.resolve().then(u2.bind(null, t2)).then(function (q2) {
                return f2 = q2, o2(f2, t2);
            }).then(function () {
                return f2;
            });
        }), r2 === "error" && (i2 = function (u2, t2) {
            return Promise.resolve().then(u2.bind(null, t2)).catch(function (f2) {
                return o2(f2, t2);
            });
        }), e2.registry[n2].push({
            hook: i2,
            orig: o2
        });
    }
});
var x = a((L2, H2) => {
    H2.exports = O2;

    function O2(e2, r2, n2) {
        if (e2.registry[r2]) {
            var i2 = e2.registry[r2].map(function (o2) {
                return o2.orig;
            }).indexOf(n2);
            i2 !== -1 && e2.registry[r2].splice(i2, 1);
        }
    }
});
var P = a((Q2, c2) => {
    var S2 = d(), z2 = y(), B2 = x(), h2 = Function.bind, k2 = h2.bind(h2);

    function m2(e2, r2, n2) {
        var i2 = k2(B2, null).apply(null, n2 ? [r2, n2] : [r2]);
        e2.api = {
            remove: i2
        }, e2.remove = i2, ["before", "error", "after", "wrap"].forEach(function (o2) {
            var u2 = n2 ? [r2, o2, n2] : [r2, o2];
            e2[o2] = e2.api[o2] = k2(z2, null).apply(null, u2);
        });
    }

    function G2() {
        var e2 = "h", r2 = {
            registry: {}
        }, n2 = S2.bind(null, r2, e2);
        return m2(n2, r2, e2), n2;
    }

    function w2() {
        var e2 = {
            registry: {}
        }, r2 = S2.bind(null, e2);
        return m2(r2, e2), r2;
    }

    var C2 = false;

    function l2() {
        return C2 || (console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'), C2 = true), w2();
    }

    l2.Singular = G2.bind();
    l2.Collection = w2.bind();
    c2.exports = l2;
    c2.exports.Hook = l2;
    c2.exports.Singular = l2.Singular;
    c2.exports.Collection = l2.Collection;
});
var s = M(P()), {
    Singular: T,
    Collection: U,
    Hook: V
} = s;
s.default ?? s;
var u = "5.0.1", O = (_a = class {
    constructor(t2 = {}) {
        let s2 = new U(), e$12 = {
            baseUrl: I.endpoint.DEFAULTS.baseUrl,
            headers: {},
            request: Object.assign({}, t2.request, {
                hook: s2.bind(null, "request")
            }),
            mediaType: {
                previews: [],
                format: ""
            }
        };
        if (e$12.headers["user-agent"] = [t2.userAgent, `octokit-core.js/${u} ${e()}`].filter(Boolean).join(" "), t2.baseUrl && (e$12.baseUrl = t2.baseUrl), t2.previews && (e$12.mediaType.previews = t2.previews), t2.timeZone && (e$12.headers["time-zone"] = t2.timeZone), this.request = I.defaults(e$12), this.graphql = A$1(this.request).defaults(e$12), this.log = Object.assign({
            debug: () => {
            },
            info: () => {
            },
            warn: console.warn.bind(console),
            error: console.error.bind(console)
        }, t2.log), this.hook = s2, t2.authStrategy) {
            let {
                authStrategy: i2,
                ...a2
            } = t2, o2 = i2(Object.assign({
                request: this.request,
                log: this.log,
                octokit: this,
                octokitOptions: a2
            }, t2.auth));
            s2.wrap("request", o2.hook), this.auth = o2;
        } else if (!t2.auth) this.auth = async () => ({
            type: "unauthenticated"
        });
        else {
            let i2 = _(t2.auth);
            s2.wrap("request", i2.hook), this.auth = i2;
        }
        this.constructor.plugins.forEach((i2) => {
            Object.assign(this, i2(this, t2));
        });
    }

    static defaults(t2) {
        return class extends this {
            constructor(...e2) {
                let r2 = e2[0] || {};
                if (typeof t2 == "function") {
                    super(t2(r2));
                    return;
                }
                super(Object.assign({}, t2, r2, r2.userAgent && t2.userAgent ? {
                    userAgent: `${r2.userAgent} ${t2.userAgent}`
                } : null));
            }
        };
    }

    static plugin(...t2) {
        var _a2;
        let s2 = this.plugins;
        return _a2 = class extends this {
        }, _a2.plugins = s2.concat(t2.filter((r2) => !s2.includes(r2))), _a2;
    }
}, _a.VERSION = u, _a.plugins = [], _a);
var exports$1 = {}, module$1 = {};
Object.defineProperty(module$1, "exports", {
    get() {
        return exports$1;
    },
    set(value) {
        exports$1 = value;
    }
});
Object.defineProperty(exports$1, "__esModule", {
    value: true
});
(function (global2, factory) {
    typeof exports$1 === "object" && typeof module$1 !== "undefined" ? module$1.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory());
})(void 0, function () {
    var extendStatics = function (d2, b2) {
        extendStatics = Object.setPrototypeOf || {
            __proto__: []
        } instanceof Array && function (d3, b3) {
            d3.__proto__ = b3;
        } || function (d3, b3) {
            for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d3[p2] = b3[p2];
        };
        return extendStatics(d2, b2);
    };

    function __extends(d2, b2) {
        if (typeof b2 !== "function" && b2 !== null) throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d2, b2);

        function __() {
            this.constructor = d2;
        }

        d2.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
    }

    var __assign = function () {
        __assign = Object.assign || function __assign2(t2) {
            for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
                s2 = arguments[i2];
                for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2)) t2[p2] = s2[p2];
            }
            return t2;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        for (var i2 = 0, l2 = from.length, ar; i2 < l2; i2++) {
            if (ar || !(i2 in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i2);
                ar[i2] = from[i2];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var _global2 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
    var keys = Object.keys;
    var isArray = Array.isArray;
    if (typeof Promise !== "undefined" && !_global2.Promise) {
        _global2.Promise = Promise;
    }

    function extend(obj, extension) {
        if (typeof extension !== "object") return obj;
        keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }

    var getProto = Object.getPrototypeOf;
    var _hasOwn = {}.hasOwnProperty;

    function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
    }

    function props(proto, extension) {
        if (typeof extension === "function") extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function (key) {
            setProp(proto, key, extension[key]);
        });
    }

    var defineProperty = Object.defineProperty;

    function setProp(obj, prop, functionOrGetSet, options2) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? {
            get: functionOrGetSet.get,
            set: functionOrGetSet.set,
            configurable: true
        } : {
            value: functionOrGetSet,
            configurable: true,
            writable: true
        }, options2));
    }

    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                setProp(Child.prototype, "constructor", Child);
                return {
                    extend: props.bind(null, Child.prototype)
                };
            }
        };
    }

    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
    }

    var _slice = [].slice;

    function slice(args, start, end) {
        return _slice.call(args, start, end);
    }

    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }

    function assert(b2) {
        if (!b2) throw new Error("Assertion Failed");
    }

    function asap$1(fn) {
        if (_global2.setImmediate) setImmediate(fn);
        else setTimeout(fn, 0);
    }

    function arrayToObject(array, extractor) {
        return array.reduce(function (result, item, i2) {
            var nameAndValue = extractor(item, i2);
            if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
            return result;
        }, {});
    }

    function getByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string" && hasOwn(obj, keyPath)) return obj[keyPath];
        if (!keyPath) return obj;
        if (typeof keyPath !== "string") {
            var rv = [];
            for (var i2 = 0, l2 = keyPath.length; i2 < l2; ++i2) {
                var val = getByKeyPath(obj, keyPath[i2]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf(".");
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return void 0;
    }

    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === void 0) return;
        if ("isFrozen" in Object && Object.isFrozen(obj)) return;
        if (typeof keyPath !== "string" && "length" in keyPath) {
            assert(typeof value !== "string" && "length" in value);
            for (var i2 = 0, l2 = keyPath.length; i2 < l2; ++i2) {
                setByKeyPath(obj, keyPath[i2], value[i2]);
            }
        } else {
            var period = keyPath.indexOf(".");
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "") {
                    if (value === void 0) {
                        if (isArray(obj) && !isNaN(parseInt(currentKeyPath))) obj.splice(currentKeyPath, 1);
                        else delete obj[currentKeyPath];
                    } else obj[currentKeyPath] = value;
                } else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj || !hasOwn(obj, currentKeyPath)) innerObj = obj[currentKeyPath] = {};
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            } else {
                if (value === void 0) {
                    if (isArray(obj) && !isNaN(parseInt(keyPath))) obj.splice(keyPath, 1);
                    else delete obj[keyPath];
                } else obj[keyPath] = value;
            }
        }
    }

    function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string") setByKeyPath(obj, keyPath, void 0);
        else if ("length" in keyPath) [].map.call(keyPath, function (kp) {
            setByKeyPath(obj, kp, void 0);
        });
    }

    function shallowClone(obj) {
        var rv = {};
        for (var m2 in obj) {
            if (hasOwn(obj, m2)) rv[m2] = obj[m2];
        }
        return rv;
    }

    var concat = [].concat;

    function flatten(a2) {
        return concat.apply([], a2);
    }

    var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function (num) {
        return ["Int", "Uint", "Float"].map(function (t2) {
            return t2 + num + "Array";
        });
    }))).filter(function (t2) {
        return _global2[t2];
    });
    var intrinsicTypes = new Set(intrinsicTypeNames.map(function (t2) {
        return _global2[t2];
    }));

    function cloneSimpleObjectTree(o2) {
        var rv = {};
        for (var k2 in o2) if (hasOwn(o2, k2)) {
            var v2 = o2[k2];
            rv[k2] = !v2 || typeof v2 !== "object" || intrinsicTypes.has(v2.constructor) ? v2 : cloneSimpleObjectTree(v2);
        }
        return rv;
    }

    function objectIsEmpty(o2) {
        for (var k2 in o2) if (hasOwn(o2, k2)) return false;
        return true;
    }

    var circularRefs = null;

    function deepClone(any) {
        circularRefs = /* @__PURE__ */ new WeakMap();
        var rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
    }

    function innerDeepClone(x2) {
        if (!x2 || typeof x2 !== "object") return x2;
        var rv = circularRefs.get(x2);
        if (rv) return rv;
        if (isArray(x2)) {
            rv = [];
            circularRefs.set(x2, rv);
            for (var i2 = 0, l2 = x2.length; i2 < l2; ++i2) {
                rv.push(innerDeepClone(x2[i2]));
            }
        } else if (intrinsicTypes.has(x2.constructor)) {
            rv = x2;
        } else {
            var proto = getProto(x2);
            rv = proto === Object.prototype ? {} : Object.create(proto);
            circularRefs.set(x2, rv);
            for (var prop in x2) {
                if (hasOwn(x2, prop)) {
                    rv[prop] = innerDeepClone(x2[prop]);
                }
            }
        }
        return rv;
    }

    var toString = {}.toString;

    function toStringTag(o2) {
        return toString.call(o2).slice(8, -1);
    }

    var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
    var getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x2) {
        var i2;
        return x2 != null && (i2 = x2[iteratorSymbol]) && i2.apply(x2);
    } : function () {
        return null;
    };

    function delArrayItem(a2, x2) {
        var i2 = a2.indexOf(x2);
        if (i2 >= 0) a2.splice(i2, 1);
        return i2 >= 0;
    }

    var NO_CHAR_ARRAY = {};

    function getArrayOf(arrayLike) {
        var i2, a2, x2, it;
        if (arguments.length === 1) {
            if (isArray(arrayLike)) return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === "string") return [arrayLike];
            if (it = getIteratorOf(arrayLike)) {
                a2 = [];
                while (x2 = it.next(), !x2.done) a2.push(x2.value);
                return a2;
            }
            if (arrayLike == null) return [arrayLike];
            i2 = arrayLike.length;
            if (typeof i2 === "number") {
                a2 = new Array(i2);
                while (i2--) a2[i2] = arrayLike[i2];
                return a2;
            }
            return [arrayLike];
        }
        i2 = arguments.length;
        a2 = new Array(i2);
        while (i2--) a2[i2] = arguments[i2];
        return a2;
    }

    var isAsyncFunction = typeof Symbol !== "undefined" ? function (fn) {
        return fn[Symbol.toStringTag] === "AsyncFunction";
    } : function () {
        return false;
    };
    var dexieErrorNames = ["Modify", "Bulk", "OpenFailed", "VersionChange", "Schema", "Upgrade", "InvalidTable", "MissingAPI", "NoSuchDatabase", "InvalidArgument", "SubTransaction", "Unsupported", "Internal", "DatabaseClosed", "PrematureCommit", "ForeignAwait"];
    var idbDomErrorNames = ["Unknown", "Constraint", "Data", "TransactionInactive", "ReadOnly", "Version", "NotFound", "InvalidState", "InvalidAccess", "Abort", "Timeout", "QuotaExceeded", "Syntax", "DataClone"];
    var errorList = dexieErrorNames.concat(idbDomErrorNames);
    var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
    };

    function DexieError(name, msg) {
        this.name = name;
        this.message = msg;
    }

    derive(DexieError).from(Error).extend({
        toString: function () {
            return this.name + ": " + this.message;
        }
    });

    function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures).map(function (key) {
            return failures[key].toString();
        }).filter(function (v2, i2, s2) {
            return s2.indexOf(v2) === i2;
        }).join("\n");
    }

    function ModifyError(msg, failures, successCount, failedKeys) {
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
    }

    derive(ModifyError).from(DexieError);

    function BulkError(msg, failures) {
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(function (pos) {
            return failures[pos];
        });
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, this.failures);
    }

    derive(BulkError).from(DexieError);
    var errnames = errorList.reduce(function (obj, name) {
        return obj[name] = name + "Error", obj;
    }, {});
    var BaseException = DexieError;
    var exceptions = errorList.reduce(function (obj, name) {
        var fullName = name + "Error";

        function DexieError2(msgOrInner, inner) {
            this.name = fullName;
            if (!msgOrInner) {
                this.message = defaultTexts[name] || fullName;
                this.inner = null;
            } else if (typeof msgOrInner === "string") {
                this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
                this.inner = inner || null;
            } else if (typeof msgOrInner === "object") {
                this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
                this.inner = msgOrInner;
            }
        }

        derive(DexieError2).from(BaseException);
        obj[name] = DexieError2;
        return obj;
    }, {});
    exceptions.Syntax = SyntaxError;
    exceptions.Type = TypeError;
    exceptions.Range = RangeError;
    var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});

    function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
            setProp(rv, "stack", {
                get: function () {
                    return this.inner.stack;
                }
            });
        }
        return rv;
    }

    var fullNameExceptions = errorList.reduce(function (obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    fullNameExceptions.ModifyError = ModifyError;
    fullNameExceptions.DexieError = DexieError;
    fullNameExceptions.BulkError = BulkError;

    function nop() {
    }

    function mirror(val) {
        return val;
    }

    function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror) return f2;
        return function (val) {
            return f2(f1(val));
        };
    }

    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        };
    }

    function hookCreatingChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== void 0) arguments[0] = res;
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== void 0 ? res2 : res;
        };
    }

    function hookDeletingChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
    }

    function hookUpdatingChain(f1, f2) {
        if (f1 === nop) return f2;
        return function (modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res);
            var onsuccess = this.onsuccess, onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
        };
    }

    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            if (f2.apply(this, arguments) === false) return false;
            return f1.apply(this, arguments);
        };
    }

    function promisableChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === "function") {
                var thiz = this, i2 = arguments.length, args = new Array(i2);
                while (i2--) args[i2] = arguments[i2];
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        };
    }

    var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

    function setDebug(value, filter) {
        debug = value;
    }

    var INTERNAL = {};
    var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : (function () {
            var globalP = Promise.resolve();
            if (typeof crypto === "undefined" || !crypto.subtle) return [globalP, getProto(globalP), globalP];
            var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
            return [nativeP, getProto(nativeP), globalP];
        })(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2],
        nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
    var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
    var patchGlobalPromise = !!resolvedGlobalPromise;

    function schedulePhysicalTick() {
        queueMicrotask(physicalTick);
    }

    var asap = function (callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
        }
    };
    var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [],
        rejectionMapper = mirror;
    var globalPSD = {
        id: "global",
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: nop,
        pgp: false,
        env: {},
        finalize: nop
    };
    var PSD = globalPSD;
    var microtickQueue = [];
    var numScheduledCalls = 0;
    var tickFinalizers = [];

    function DexiePromise(fn) {
        if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
        this._listeners = [];
        this._lib = false;
        var psd = this._PSD = PSD;
        if (typeof fn !== "function") {
            if (fn !== INTERNAL) throw new TypeError("Not a function");
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false) handleRejection(this, this._value);
            return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
    }

    var thenProp = {
        get: function () {
            var psd = PSD, microTaskId = totalEchoes;

            function then(onFulfilled, onRejected) {
                var _this = this;
                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
                var cleanup = possibleAwait && !decrementExpectedAwaits();
                var rv = new DexiePromise(function (resolve2, reject) {
                    propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve2, reject, psd));
                });
                if (this._consoleTask) rv._consoleTask = this._consoleTask;
                return rv;
            }

            then.prototype = INTERNAL;
            return then;
        },
        set: function (value) {
            setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
                get: function () {
                    return value;
                },
                set: thenProp.set
            });
        }
    };
    props(DexiePromise.prototype, {
        then: thenProp,
        _then: function (onFulfilled, onRejected) {
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function (onRejected) {
            if (arguments.length === 1) return this.then(null, onRejected);
            var type2 = arguments[0], handler2 = arguments[1];
            return typeof type2 === "function" ? this.then(null, function (err) {
                return err instanceof type2 ? handler2(err) : PromiseReject(err);
            }) : this.then(null, function (err) {
                return err && err.name === type2 ? handler2(err) : PromiseReject(err);
            });
        },
        finally: function (onFinally) {
            return this.then(function (value) {
                return DexiePromise.resolve(onFinally()).then(function () {
                    return value;
                });
            }, function (err) {
                return DexiePromise.resolve(onFinally()).then(function () {
                    return PromiseReject(err);
                });
            });
        },
        timeout: function (ms, msg) {
            var _this = this;
            return ms < Infinity ? new DexiePromise(function (resolve2, reject) {
                var handle = setTimeout(function () {
                    return reject(new exceptions.Timeout(msg));
                }, ms);
                _this.then(resolve2, reject).finally(clearTimeout.bind(null, handle));
            }) : this;
        }
    });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
    globalPSD.env = snapShot();

    function Listener(onFulfilled, onRejected, resolve2, reject, zone) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.resolve = resolve2;
        this.reject = reject;
        this.psd = zone;
    }

    props(DexiePromise, {
        all: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve2, reject) {
                if (values.length === 0) resolve2([]);
                var remaining = values.length;
                values.forEach(function (a2, i2) {
                    return DexiePromise.resolve(a2).then(function (x2) {
                        values[i2] = x2;
                        if (!--remaining) resolve2(values);
                    }, reject);
                });
            });
        },
        resolve: function (value) {
            if (value instanceof DexiePromise) return value;
            if (value && typeof value.then === "function") return new DexiePromise(function (resolve2, reject) {
                value.then(resolve2, reject);
            });
            var rv = new DexiePromise(INTERNAL, true, value);
            return rv;
        },
        reject: PromiseReject,
        race: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve2, reject) {
                values.map(function (value) {
                    return DexiePromise.resolve(value).then(resolve2, reject);
                });
            });
        },
        PSD: {
            get: function () {
                return PSD;
            },
            set: function (value) {
                return PSD = value;
            }
        },
        totalEchoes: {
            get: function () {
                return totalEchoes;
            }
        },
        newPSD: newScope,
        usePSD,
        scheduler: {
            get: function () {
                return asap;
            },
            set: function (value) {
                asap = value;
            }
        },
        rejectionMapper: {
            get: function () {
                return rejectionMapper;
            },
            set: function (value) {
                rejectionMapper = value;
            }
        },
        follow: function (fn, zoneProps) {
            return new DexiePromise(function (resolve2, reject) {
                return newScope(function (resolve3, reject2) {
                    var psd = PSD;
                    psd.unhandleds = [];
                    psd.onunhandled = reject2;
                    psd.finalize = callBoth(function () {
                        var _this = this;
                        run_at_end_of_this_or_next_physical_tick(function () {
                            _this.unhandleds.length === 0 ? resolve3() : reject2(_this.unhandleds[0]);
                        });
                    }, psd.finalize);
                    fn();
                }, zoneProps, resolve2, reject);
            });
        }
    });
    if (NativePromise) {
        if (NativePromise.allSettled) setProp(DexiePromise, "allSettled", function () {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve2) {
                if (possiblePromises.length === 0) resolve2([]);
                var remaining = possiblePromises.length;
                var results = new Array(remaining);
                possiblePromises.forEach(function (p2, i2) {
                    return DexiePromise.resolve(p2).then(function (value) {
                        return results[i2] = {
                            status: "fulfilled",
                            value
                        };
                    }, function (reason) {
                        return results[i2] = {
                            status: "rejected",
                            reason
                        };
                    }).then(function () {
                        return --remaining || resolve2(results);
                    });
                });
            });
        });
        if (NativePromise.any && typeof AggregateError !== "undefined") setProp(DexiePromise, "any", function () {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve2, reject) {
                if (possiblePromises.length === 0) reject(new AggregateError([]));
                var remaining = possiblePromises.length;
                var failures = new Array(remaining);
                possiblePromises.forEach(function (p2, i2) {
                    return DexiePromise.resolve(p2).then(function (value) {
                        return resolve2(value);
                    }, function (failure) {
                        failures[i2] = failure;
                        if (!--remaining) reject(new AggregateError(failures));
                    });
                });
            });
        });
        if (NativePromise.withResolvers) DexiePromise.withResolvers = NativePromise.withResolvers;
    }

    function executePromiseTask(promise, fn) {
        try {
            fn(function (value) {
                if (promise._state !== null) return;
                if (value === promise) throw new TypeError("A promise cannot be resolved with itself.");
                var shouldExecuteTick = promise._lib && beginMicroTickScope();
                if (value && typeof value.then === "function") {
                    executePromiseTask(promise, function (resolve2, reject) {
                        value instanceof DexiePromise ? value._then(resolve2, reject) : value.then(resolve2, reject);
                    });
                } else {
                    promise._state = true;
                    promise._value = value;
                    propagateAllListeners(promise);
                }
                if (shouldExecuteTick) endMicroTickScope();
            }, handleRejection.bind(null, promise));
        } catch (ex) {
            handleRejection(promise, ex);
        }
    }

    function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null) return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick) endMicroTickScope();
    }

    function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i2 = 0, len = listeners.length; i2 < len; ++i2) {
            propagateToListener(promise, listeners[i2]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
            ++numScheduledCalls;
            asap(function () {
                if (--numScheduledCalls === 0) finalizePhysicalTick();
            }, []);
        }
    }

    function propagateToListener(promise, listener) {
        if (promise._state === null) {
            promise._listeners.push(listener);
            return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap(callListener, [cb, promise, listener]);
    }

    function callListener(cb, promise, listener) {
        try {
            var ret, value = promise._value;
            if (!promise._state && rejectingErrors.length) rejectingErrors = [];
            ret = debug && promise._consoleTask ? promise._consoleTask.run(function () {
                return cb(value);
            }) : cb(value);
            if (!promise._state && rejectingErrors.indexOf(value) === -1) {
                markErrorAsHandled(promise);
            }
            listener.resolve(ret);
        } catch (e2) {
            listener.reject(e2);
        } finally {
            if (--numScheduledCalls === 0) finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
        }
    }

    function physicalTick() {
        usePSD(globalPSD, function () {
            beginMicroTickScope() && endMicroTickScope();
        });
    }

    function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
    }

    function endMicroTickScope() {
        var callbacks, i2, l2;
        do {
            while (microtickQueue.length > 0) {
                callbacks = microtickQueue;
                microtickQueue = [];
                l2 = callbacks.length;
                for (i2 = 0; i2 < l2; ++i2) {
                    var item = callbacks[i2];
                    item[0].apply(null, item[1]);
                }
            }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
    }

    function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function (p2) {
            p2._PSD.onunhandled.call(null, p2._value, p2);
        });
        var finalizers = tickFinalizers.slice(0);
        var i2 = finalizers.length;
        while (i2) finalizers[--i2]();
    }

    function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }

        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap(function () {
            if (--numScheduledCalls === 0) finalizePhysicalTick();
        }, []);
    }

    function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function (p2) {
            return p2._value === promise._value;
        })) unhandledErrors.push(promise);
    }

    function markErrorAsHandled(promise) {
        var i2 = unhandledErrors.length;
        while (i2) if (unhandledErrors[--i2]._value === promise._value) {
            unhandledErrors.splice(i2, 1);
            return;
        }
    }

    function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
    }

    function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function () {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
                switchToZone(psd, true);
                return fn.apply(this, arguments);
            } catch (e2) {
                errorCatcher && errorCatcher(e2);
            } finally {
                switchToZone(outerScope, false);
                if (wasRootExec) endMicroTickScope();
            }
        };
    }

    var task = {
        awaits: 0,
        echoes: 0,
        id: 0
    };
    var taskCounter = 0;
    var zoneStack = [];
    var zoneEchoes = 0;
    var totalEchoes = 0;
    var zone_id_counter = 0;

    function newScope(fn, props2, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        globalPSD.env;
        psd.env = patchGlobalPromise ? {
            Promise: DexiePromise,
            PromiseProp: {
                value: DexiePromise,
                configurable: true,
                writable: true
            },
            all: DexiePromise.all,
            race: DexiePromise.race,
            allSettled: DexiePromise.allSettled,
            any: DexiePromise.any,
            resolve: DexiePromise.resolve,
            reject: DexiePromise.reject
        } : {};
        if (props2) extend(psd, props2);
        ++parent.ref;
        psd.finalize = function () {
            --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0) psd.finalize();
        return rv;
    }

    function incrementExpectedAwaits() {
        if (!task.id) task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
    }

    function decrementExpectedAwaits() {
        if (!task.awaits) return false;
        if (--task.awaits === 0) task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
    }

    if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
    }

    function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(function (x2) {
                decrementExpectedAwaits();
                return x2;
            }, function (e2) {
                decrementExpectedAwaits();
                return rejection(e2);
            });
        }
        return possiblePromise;
    }

    function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.awaits = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
    }

    function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
    }

    function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD) return;
        PSD = targetZone;
        if (currentZone === globalPSD) globalPSD.env = snapShot();
        if (patchGlobalPromise) {
            var GlobalPromise = globalPSD.env.Promise;
            var targetEnv = targetZone.env;
            if (currentZone.global || targetZone.global) {
                Object.defineProperty(_global2, "Promise", targetEnv.PromiseProp);
                GlobalPromise.all = targetEnv.all;
                GlobalPromise.race = targetEnv.race;
                GlobalPromise.resolve = targetEnv.resolve;
                GlobalPromise.reject = targetEnv.reject;
                if (targetEnv.allSettled) GlobalPromise.allSettled = targetEnv.allSettled;
                if (targetEnv.any) GlobalPromise.any = targetEnv.any;
            }
        }
    }

    function snapShot() {
        var GlobalPromise = _global2.Promise;
        return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global2, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            allSettled: GlobalPromise.allSettled,
            any: GlobalPromise.any,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject
        } : {};
    }

    function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
        } finally {
            switchToZone(outerScope, false);
        }
    }

    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== "function" ? fn : function () {
            var outerZone = PSD;
            if (possibleAwait) incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
                return fn.apply(this, arguments);
            } finally {
                switchToZone(outerZone, false);
                if (cleanup) queueMicrotask(decrementExpectedAwaits);
            }
        };
    }

    function execInGlobalContext(cb) {
        if (Promise === NativePromise && task.echoes === 0) {
            if (zoneEchoes === 0) {
                cb();
            } else {
                enqueueNativeMicroTask(cb);
            }
        } else {
            setTimeout(cb, 0);
        }
    }

    var rejection = DexiePromise.reject;

    function tempTransaction(db2, mode, storeNames, fn) {
        if (!db2.idbdb || !db2._state.openComplete && !PSD.letThrough && !db2._vip) {
            if (db2._state.openComplete) {
                return rejection(new exceptions.DatabaseClosed(db2._state.dbOpenError));
            }
            if (!db2._state.isBeingOpened) {
                if (!db2._state.autoOpen) return rejection(new exceptions.DatabaseClosed());
                db2.open().catch(nop);
            }
            return db2._state.dbReadyPromise.then(function () {
                return tempTransaction(db2, mode, storeNames, fn);
            });
        } else {
            var trans = db2._createTransaction(mode, storeNames, db2._dbSchema);
            try {
                trans.create();
                db2._state.PR1398_maxLoop = 3;
            } catch (ex) {
                if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                    console.warn("Dexie: Need to reopen db");
                    db2.close({
                        disableAutoOpen: false
                    });
                    return db2.open().then(function () {
                        return tempTransaction(db2, mode, storeNames, fn);
                    });
                }
                return rejection(ex);
            }
            return trans._promise(mode, function (resolve2, reject) {
                return newScope(function () {
                    PSD.trans = trans;
                    return fn(resolve2, reject, trans);
                });
            }).then(function (result) {
                if (mode === "readwrite") try {
                    trans.idbtrans.commit();
                } catch (_a3) {
                }
                return mode === "readonly" ? result : trans._completion.then(function () {
                    return result;
                });
            });
        }
    }

    var DEXIE_VERSION = "4.2.1";
    var maxString = String.fromCharCode(65535);
    var minKey = -Infinity;
    var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
    var STRING_EXPECTED = "String expected.";
    var connections = [];
    var DBNAMES_DB = "__dbnames";
    var READONLY = "readonly";
    var READWRITE = "readwrite";

    function combine(filter1, filter2) {
        return filter1 ? filter2 ? function () {
            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
    }

    var AnyRange = {
        type: 3,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
    };

    function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath) ? function (obj) {
            if (obj[keyPath] === void 0 && keyPath in obj) {
                obj = deepClone(obj);
                delete obj[keyPath];
            }
            return obj;
        } : function (obj) {
            return obj;
        };
    }

    function Entity2() {
        throw exceptions.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
    }

    function cmp2(a2, b2) {
        try {
            var ta = type(a2);
            var tb = type(b2);
            if (ta !== tb) {
                if (ta === "Array") return 1;
                if (tb === "Array") return -1;
                if (ta === "binary") return 1;
                if (tb === "binary") return -1;
                if (ta === "string") return 1;
                if (tb === "string") return -1;
                if (ta === "Date") return 1;
                if (tb !== "Date") return NaN;
                return -1;
            }
            switch (ta) {
                case "number":
                case "Date":
                case "string":
                    return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
                case "binary": {
                    return compareUint8Arrays(getUint8Array(a2), getUint8Array(b2));
                }
                case "Array":
                    return compareArrays(a2, b2);
            }
        } catch (_a3) {
        }
        return NaN;
    }

    function compareArrays(a2, b2) {
        var al = a2.length;
        var bl = b2.length;
        var l2 = al < bl ? al : bl;
        for (var i2 = 0; i2 < l2; ++i2) {
            var res = cmp2(a2[i2], b2[i2]);
            if (res !== 0) return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
    }

    function compareUint8Arrays(a2, b2) {
        var al = a2.length;
        var bl = b2.length;
        var l2 = al < bl ? al : bl;
        for (var i2 = 0; i2 < l2; ++i2) {
            if (a2[i2] !== b2[i2]) return a2[i2] < b2[i2] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
    }

    function type(x2) {
        var t2 = typeof x2;
        if (t2 !== "object") return t2;
        if (ArrayBuffer.isView(x2)) return "binary";
        var tsTag = toStringTag(x2);
        return tsTag === "ArrayBuffer" ? "binary" : tsTag;
    }

    function getUint8Array(a2) {
        if (a2 instanceof Uint8Array) return a2;
        if (ArrayBuffer.isView(a2)) return new Uint8Array(a2.buffer, a2.byteOffset, a2.byteLength);
        return new Uint8Array(a2);
    }

    function builtInDeletionTrigger(table, keys2, res) {
        var yProps = table.schema.yProps;
        if (!yProps) return res;
        if (keys2 && res.numFailures > 0) keys2 = keys2.filter(function (_2, i2) {
            return !res.failures[i2];
        });
        return Promise.all(yProps.map(function (_a3) {
            var updatesTable = _a3.updatesTable;
            return keys2 ? table.db.table(updatesTable).where("k").anyOf(keys2).delete() : table.db.table(updatesTable).clear();
        })).then(function () {
            return res;
        });
    }

    var PropModification2 = (function () {
        function PropModification3(spec) {
            this["@@propmod"] = spec;
        }

        PropModification3.prototype.execute = function (value) {
            var _a3;
            var spec = this["@@propmod"];
            if (spec.add !== void 0) {
                var term = spec.add;
                if (isArray(term)) {
                    return __spreadArray(__spreadArray([], isArray(value) ? value : [], true), term).sort();
                }
                if (typeof term === "number") return (Number(value) || 0) + term;
                if (typeof term === "bigint") {
                    try {
                        return BigInt(value) + term;
                    } catch (_b) {
                        return BigInt(0) + term;
                    }
                }
                throw new TypeError("Invalid term ".concat(term));
            }
            if (spec.remove !== void 0) {
                var subtrahend_1 = spec.remove;
                if (isArray(subtrahend_1)) {
                    return isArray(value) ? value.filter(function (item) {
                        return !subtrahend_1.includes(item);
                    }).sort() : [];
                }
                if (typeof subtrahend_1 === "number") return Number(value) - subtrahend_1;
                if (typeof subtrahend_1 === "bigint") {
                    try {
                        return BigInt(value) - subtrahend_1;
                    } catch (_c) {
                        return BigInt(0) - subtrahend_1;
                    }
                }
                throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
            }
            var prefixToReplace = (_a3 = spec.replacePrefix) === null || _a3 === void 0 ? void 0 : _a3[0];
            if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
                return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
            }
            return value;
        };
        return PropModification3;
    })();

    function applyUpdateSpec(obj, changes) {
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        var anythingModified = false;
        for (var i2 = 0; i2 < numKeys; ++i2) {
            var keyPath = keyPaths[i2];
            var value = changes[keyPath];
            var origValue = getByKeyPath(obj, keyPath);
            if (value instanceof PropModification2) {
                setByKeyPath(obj, keyPath, value.execute(origValue));
                anythingModified = true;
            } else if (origValue !== value) {
                setByKeyPath(obj, keyPath, value);
                anythingModified = true;
            }
        }
        return anythingModified;
    }

    var Table = (function () {
        function Table2() {
        }

        Table2.prototype._trans = function (mode, fn, writeLocked) {
            var trans = this._tx || PSD.trans;
            var tableName = this.name;
            var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));

            function checkTableInTransaction(resolve2, reject, trans2) {
                if (!trans2.schema[tableName]) throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
                return fn(trans2.idbtrans, trans2);
            }

            var wasRootExec = beginMicroTickScope();
            try {
                var p2 = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function () {
                    return trans._promise(mode, checkTableInTransaction, writeLocked);
                }, {
                    trans,
                    transless: PSD.transless || PSD
                }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
                if (task2) {
                    p2._consoleTask = task2;
                    p2 = p2.catch(function (err) {
                        console.trace(err);
                        return rejection(err);
                    });
                }
                return p2;
            } finally {
                if (wasRootExec) endMicroTickScope();
            }
        };
        Table2.prototype.get = function (keyOrCrit, cb) {
            var _this = this;
            if (keyOrCrit && keyOrCrit.constructor === Object) return this.where(keyOrCrit).first(cb);
            if (keyOrCrit == null) return rejection(new exceptions.Type("Invalid argument to Table.get()"));
            return this._trans("readonly", function (trans) {
                return _this.core.get({
                    trans,
                    key: keyOrCrit
                }).then(function (res) {
                    return _this.hook.reading.fire(res);
                });
            }).then(cb);
        };
        Table2.prototype.where = function (indexOrCrit) {
            if (typeof indexOrCrit === "string") return new this.db.WhereClause(this, indexOrCrit);
            if (isArray(indexOrCrit)) return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
            var keyPaths = keys(indexOrCrit);
            if (keyPaths.length === 1) return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
            var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
                if (ix.compound && keyPaths.every(function (keyPath) {
                    return ix.keyPath.indexOf(keyPath) >= 0;
                })) {
                    for (var i2 = 0; i2 < keyPaths.length; ++i2) {
                        if (keyPaths.indexOf(ix.keyPath[i2]) === -1) return false;
                    }
                    return true;
                }
                return false;
            }).sort(function (a2, b2) {
                return a2.keyPath.length - b2.keyPath.length;
            })[0];
            if (compoundIndex && this.db._maxKey !== maxString) {
                var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
                return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function (kp) {
                    return indexOrCrit[kp];
                }));
            }
            if (!compoundIndex && debug) console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
            var idxByName = this.schema.idxByName;

            function equals(a2, b2) {
                return cmp2(a2, b2) === 0;
            }

            var _a3 = keyPaths.reduce(function (_a4, keyPath) {
                var prevIndex = _a4[0], prevFilterFn = _a4[1];
                var index = idxByName[keyPath];
                var value = indexOrCrit[keyPath];
                return [prevIndex || index, prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function (x2) {
                    var prop = getByKeyPath(x2, keyPath);
                    return isArray(prop) && prop.some(function (item) {
                        return equals(value, item);
                    });
                } : function (x2) {
                    return equals(value, getByKeyPath(x2, keyPath));
                }) : prevFilterFn];
            }, [null, null]), idx = _a3[0], filterFunction = _a3[1];
            return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
        };
        Table2.prototype.filter = function (filterFunction) {
            return this.toCollection().and(filterFunction);
        };
        Table2.prototype.count = function (thenShortcut) {
            return this.toCollection().count(thenShortcut);
        };
        Table2.prototype.offset = function (offset) {
            return this.toCollection().offset(offset);
        };
        Table2.prototype.limit = function (numRows) {
            return this.toCollection().limit(numRows);
        };
        Table2.prototype.each = function (callback) {
            return this.toCollection().each(callback);
        };
        Table2.prototype.toArray = function (thenShortcut) {
            return this.toCollection().toArray(thenShortcut);
        };
        Table2.prototype.toCollection = function () {
            return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table2.prototype.orderBy = function (index) {
            return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ? "[".concat(index.join("+"), "]") : index));
        };
        Table2.prototype.reverse = function () {
            return this.toCollection().reverse();
        };
        Table2.prototype.mapToClass = function (constructor) {
            var _a3 = this, db2 = _a3.db, tableName = _a3.name;
            this.schema.mappedClass = constructor;
            if (constructor.prototype instanceof Entity2) {
                constructor = (function (_super) {
                    __extends(class_1, _super);

                    function class_1() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }

                    Object.defineProperty(class_1.prototype, "db", {
                        get: function () {
                            return db2;
                        },
                        enumerable: false,
                        configurable: true
                    });
                    class_1.prototype.table = function () {
                        return tableName;
                    };
                    return class_1;
                })(constructor);
            }
            var inheritedProps = /* @__PURE__ */ new Set();
            for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
                Object.getOwnPropertyNames(proto).forEach(function (propName) {
                    return inheritedProps.add(propName);
                });
            }
            var readHook = function (obj) {
                if (!obj) return obj;
                var res = Object.create(constructor.prototype);
                for (var m2 in obj) if (!inheritedProps.has(m2)) try {
                    res[m2] = obj[m2];
                } catch (_2) {
                }
                return res;
            };
            if (this.schema.readHook) {
                this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
        };
        Table2.prototype.defineClass = function () {
            function Class(content) {
                extend(this, content);
            }

            return this.mapToClass(Class);
        };
        Table2.prototype.add = function (obj, key) {
            var _this = this;
            var _a3 = this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans("readwrite", function (trans) {
                return _this.core.mutate({
                    trans,
                    type: "add",
                    keys: key != null ? [key] : null,
                    values: [objToAdd]
                });
            }).then(function (res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
            }).then(function (lastResult) {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    } catch (_2) {
                    }
                }
                return lastResult;
            });
        };
        Table2.prototype.upsert = function (key, modifications) {
            var _this = this;
            var keyPath = this.schema.primKey.keyPath;
            return this._trans("readwrite", function (trans) {
                return _this.core.get({
                    trans,
                    key
                }).then(function (existing) {
                    var obj = existing !== null && existing !== void 0 ? existing : {};
                    applyUpdateSpec(obj, modifications);
                    if (keyPath) setByKeyPath(obj, keyPath, key);
                    return _this.core.mutate({
                        trans,
                        type: "put",
                        values: [obj],
                        keys: [key],
                        upsert: true,
                        updates: {
                            keys: [key],
                            changeSpecs: [modifications]
                        }
                    }).then(function (res) {
                        return res.numFailures ? DexiePromise.reject(res.failures[0]) : !!existing;
                    });
                });
            });
        };
        Table2.prototype.update = function (keyOrObject, modifications) {
            if (typeof keyOrObject === "object" && !isArray(keyOrObject)) {
                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                if (key === void 0) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
                return this.where(":id").equals(key).modify(modifications);
            } else {
                return this.where(":id").equals(keyOrObject).modify(modifications);
            }
        };
        Table2.prototype.put = function (obj, key) {
            var _this = this;
            var _a3 = this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans("readwrite", function (trans) {
                return _this.core.mutate({
                    trans,
                    type: "put",
                    values: [objToAdd],
                    keys: key != null ? [key] : null
                });
            }).then(function (res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
            }).then(function (lastResult) {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    } catch (_2) {
                    }
                }
                return lastResult;
            });
        };
        Table2.prototype.delete = function (key) {
            var _this = this;
            return this._trans("readwrite", function (trans) {
                return _this.core.mutate({
                    trans,
                    type: "delete",
                    keys: [key]
                }).then(function (res) {
                    return builtInDeletionTrigger(_this, [key], res);
                }).then(function (res) {
                    return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
                });
            });
        };
        Table2.prototype.clear = function () {
            var _this = this;
            return this._trans("readwrite", function (trans) {
                return _this.core.mutate({
                    trans,
                    type: "deleteRange",
                    range: AnyRange
                }).then(function (res) {
                    return builtInDeletionTrigger(_this, null, res);
                });
            }).then(function (res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
            });
        };
        Table2.prototype.bulkGet = function (keys2) {
            var _this = this;
            return this._trans("readonly", function (trans) {
                return _this.core.getMany({
                    keys: keys2,
                    trans
                }).then(function (result) {
                    return result.map(function (res) {
                        return _this.hook.reading.fire(res);
                    });
                });
            });
        };
        Table2.prototype.bulkAdd = function (objects, keysOrOptions, options2) {
            var _this = this;
            var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
            options2 = options2 || (keys2 ? void 0 : keysOrOptions);
            var wantResults = options2 ? options2.allKeys : void 0;
            return this._trans("readwrite", function (trans) {
                var _a3 = _this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
                if (keyPath && keys2) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                if (keys2 && keys2.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                var numObjects = objects.length;
                var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
                return _this.core.mutate({
                    trans,
                    type: "add",
                    keys: keys2,
                    values: objectsToAdd,
                    wantResults
                }).then(function (_a4) {
                    var numFailures = _a4.numFailures, results = _a4.results, lastResult = _a4.lastResult,
                        failures = _a4.failures;
                    var result = wantResults ? results : lastResult;
                    if (numFailures === 0) return result;
                    throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
                });
            });
        };
        Table2.prototype.bulkPut = function (objects, keysOrOptions, options2) {
            var _this = this;
            var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
            options2 = options2 || (keys2 ? void 0 : keysOrOptions);
            var wantResults = options2 ? options2.allKeys : void 0;
            return this._trans("readwrite", function (trans) {
                var _a3 = _this.schema.primKey, auto = _a3.auto, keyPath = _a3.keyPath;
                if (keyPath && keys2) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                if (keys2 && keys2.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                var numObjects = objects.length;
                var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
                return _this.core.mutate({
                    trans,
                    type: "put",
                    keys: keys2,
                    values: objectsToPut,
                    wantResults
                }).then(function (_a4) {
                    var numFailures = _a4.numFailures, results = _a4.results, lastResult = _a4.lastResult,
                        failures = _a4.failures;
                    var result = wantResults ? results : lastResult;
                    if (numFailures === 0) return result;
                    throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
                });
            });
        };
        Table2.prototype.bulkUpdate = function (keysAndChanges) {
            var _this = this;
            var coreTable = this.core;
            var keys2 = keysAndChanges.map(function (entry) {
                return entry.key;
            });
            var changeSpecs = keysAndChanges.map(function (entry) {
                return entry.changes;
            });
            var offsetMap = [];
            return this._trans("readwrite", function (trans) {
                return coreTable.getMany({
                    trans,
                    keys: keys2,
                    cache: "clone"
                }).then(function (objs) {
                    var resultKeys = [];
                    var resultObjs = [];
                    keysAndChanges.forEach(function (_a3, idx) {
                        var key = _a3.key, changes = _a3.changes;
                        var obj = objs[idx];
                        if (obj) {
                            for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
                                var keyPath = _b[_i];
                                var value = changes[keyPath];
                                if (keyPath === _this.schema.primKey.keyPath) {
                                    if (cmp2(value, key) !== 0) {
                                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                                    }
                                } else {
                                    setByKeyPath(obj, keyPath, value);
                                }
                            }
                            offsetMap.push(idx);
                            resultKeys.push(key);
                            resultObjs.push(obj);
                        }
                    });
                    var numEntries = resultKeys.length;
                    return coreTable.mutate({
                        trans,
                        type: "put",
                        keys: resultKeys,
                        values: resultObjs,
                        updates: {
                            keys: keys2,
                            changeSpecs
                        }
                    }).then(function (_a3) {
                        var numFailures = _a3.numFailures, failures = _a3.failures;
                        if (numFailures === 0) return numEntries;
                        for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
                            var offset = _b[_i];
                            var mappedOffset = offsetMap[Number(offset)];
                            if (mappedOffset != null) {
                                var failure = failures[offset];
                                delete failures[offset];
                                failures[mappedOffset] = failure;
                            }
                        }
                        throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
                    });
                });
            });
        };
        Table2.prototype.bulkDelete = function (keys2) {
            var _this = this;
            var numKeys = keys2.length;
            return this._trans("readwrite", function (trans) {
                return _this.core.mutate({
                    trans,
                    type: "delete",
                    keys: keys2
                }).then(function (res) {
                    return builtInDeletionTrigger(_this, keys2, res);
                });
            }).then(function (_a3) {
                var numFailures = _a3.numFailures, lastResult = _a3.lastResult, failures = _a3.failures;
                if (numFailures === 0) return lastResult;
                throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
            });
        };
        return Table2;
    })();

    function Events(ctx) {
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                var i3 = arguments.length, args = new Array(i3 - 1);
                while (--i3) args[i3 - 1] = arguments[i3];
                evs[eventName].subscribe.apply(null, args);
                return ctx;
            } else if (typeof eventName === "string") {
                return evs[eventName];
            }
        };
        rv.addEventType = add3;
        for (var i2 = 1, l2 = arguments.length; i2 < l2; ++i2) {
            add3(arguments[i2]);
        }
        return rv;

        function add3(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === "object") return addConfiguredEvents(eventName);
            if (!chainFunction) chainFunction = reverseStoppableEventChain;
            if (!defaultFunction) defaultFunction = nop;
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    if (context.subscribers.indexOf(cb) === -1) {
                        context.subscribers.push(cb);
                        context.fire = chainFunction(context.fire, cb);
                    }
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) {
                        return fn !== cb;
                    });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }

        function addConfiguredEvents(cfg) {
            keys(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (isArray(args)) {
                    add3(eventName, cfg[eventName][0], cfg[eventName][1]);
                } else if (args === "asap") {
                    var context = add3(eventName, mirror, function fire() {
                        var i3 = arguments.length, args2 = new Array(i3);
                        while (i3--) args2[i3] = arguments[i3];
                        context.subscribers.forEach(function (fn) {
                            asap$1(function fireEvent() {
                                fn.apply(null, args2);
                            });
                        });
                    });
                } else throw new exceptions.InvalidArgument("Invalid event config");
            });
        }
    }

    function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({
            prototype
        });
        return constructor;
    }

    function createTableConstructor(db2) {
        return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
            this.db = db2;
            this._tx = trans;
            this.name = name;
            this.schema = tableSchema;
            this.hook = db2._allTables[name] ? db2._allTables[name].hook : Events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [hookDeletingChain, nop]
            });
        });
    }

    function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
    }

    function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
    }

    function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function () {
            return combine(curr(), factory());
        } : factory;
        ctx.justLimit = isLimitFilter && !curr;
    }

    function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
    }

    function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey) return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
    }

    function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
            trans,
            values: !ctx.keysOnly,
            reverse: ctx.dir === "prev",
            unique: !!ctx.unique,
            query: {
                index,
                range: ctx.range
            }
        });
    }

    function iter(ctx, fn, coreTrans, coreTable) {
        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
            return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        } else {
            var set_1 = {};
            var union = function (item, cursor, advance) {
                if (!filter || filter(cursor, advance, function (result) {
                    return cursor.stop(result);
                }, function (err) {
                    return cursor.fail(err);
                })) {
                    var primaryKey = cursor.primaryKey;
                    var key = "" + primaryKey;
                    if (key === "[object ArrayBuffer]") key = "" + new Uint8Array(primaryKey);
                    if (!hasOwn(set_1, key)) {
                        set_1[key] = true;
                        fn(item, cursor, advance);
                    }
                }
            };
            return Promise.all([ctx.or._iterate(union, coreTrans), iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)]);
        }
    }

    function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? function (x2, c2, a2) {
            return fn(valueMapper(x2), c2, a2);
        } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function (cursor) {
            if (cursor) {
                return cursor.start(function () {
                    var c2 = function () {
                        return cursor.continue();
                    };
                    if (!filter || filter(cursor, function (advancer) {
                        return c2 = advancer;
                    }, function (val) {
                        cursor.stop(val);
                        c2 = nop;
                    }, function (e2) {
                        cursor.fail(e2);
                        c2 = nop;
                    })) wrappedFn(cursor.value, cursor, function (advancer) {
                        return c2 = advancer;
                    });
                    c2();
                });
            }
        });
    }

    var Collection = (function () {
        function Collection2() {
        }

        Collection2.prototype._read = function (fn, cb) {
            var ctx = this._ctx;
            return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
        };
        Collection2.prototype._write = function (fn) {
            var ctx = this._ctx;
            return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
        };
        Collection2.prototype._addAlgorithm = function (fn) {
            var ctx = this._ctx;
            ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection2.prototype._iterate = function (fn, coreTrans) {
            return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection2.prototype.clone = function (props2) {
            var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
            if (props2) extend(ctx, props2);
            rv._ctx = ctx;
            return rv;
        };
        Collection2.prototype.raw = function () {
            this._ctx.valueMapper = null;
            return this;
        };
        Collection2.prototype.each = function (fn) {
            var ctx = this._ctx;
            return this._read(function (trans) {
                return iter(ctx, fn, trans, ctx.table.core);
            });
        };
        Collection2.prototype.count = function (cb) {
            var _this = this;
            return this._read(function (trans) {
                var ctx = _this._ctx;
                var coreTable = ctx.table.core;
                if (isPlainKeyRange(ctx, true)) {
                    return coreTable.count({
                        trans,
                        query: {
                            index: getIndexOrStore(ctx, coreTable.schema),
                            range: ctx.range
                        }
                    }).then(function (count2) {
                        return Math.min(count2, ctx.limit);
                    });
                } else {
                    var count = 0;
                    return iter(ctx, function () {
                        ++count;
                        return false;
                    }, trans, coreTable).then(function () {
                        return count;
                    });
                }
            }).then(cb);
        };
        Collection2.prototype.sortBy = function (keyPath, cb) {
            var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;

            function getval(obj, i2) {
                if (i2) return getval(obj[parts[i2]], i2 - 1);
                return obj[lastPart];
            }

            var order = this._ctx.dir === "next" ? 1 : -1;

            function sorter(a2, b2) {
                var aVal = getval(a2, lastIndex), bVal = getval(b2, lastIndex);
                return cmp2(aVal, bVal) * order;
            }

            return this.toArray(function (a2) {
                return a2.sort(sorter);
            }).then(cb);
        };
        Collection2.prototype.toArray = function (cb) {
            var _this = this;
            return this._read(function (trans) {
                var ctx = _this._ctx;
                if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                    var valueMapper_1 = ctx.valueMapper;
                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans,
                        limit: ctx.limit,
                        values: true,
                        query: {
                            index,
                            range: ctx.range
                        }
                    }).then(function (_a3) {
                        var result = _a3.result;
                        return valueMapper_1 ? result.map(valueMapper_1) : result;
                    });
                } else {
                    var a_1 = [];
                    return iter(ctx, function (item) {
                        return a_1.push(item);
                    }, trans, ctx.table.core).then(function () {
                        return a_1;
                    });
                }
            }, cb);
        };
        Collection2.prototype.offset = function (offset) {
            var ctx = this._ctx;
            if (offset <= 0) return this;
            ctx.offset += offset;
            if (isPlainKeyRange(ctx)) {
                addReplayFilter(ctx, function () {
                    var offsetLeft = offset;
                    return function (cursor, advance) {
                        if (offsetLeft === 0) return true;
                        if (offsetLeft === 1) {
                            --offsetLeft;
                            return false;
                        }
                        advance(function () {
                            cursor.advance(offsetLeft);
                            offsetLeft = 0;
                        });
                        return false;
                    };
                });
            } else {
                addReplayFilter(ctx, function () {
                    var offsetLeft = offset;
                    return function () {
                        return --offsetLeft < 0;
                    };
                });
            }
            return this;
        };
        Collection2.prototype.limit = function (numRows) {
            this._ctx.limit = Math.min(this._ctx.limit, numRows);
            addReplayFilter(this._ctx, function () {
                var rowsLeft = numRows;
                return function (cursor, advance, resolve2) {
                    if (--rowsLeft <= 0) advance(resolve2);
                    return rowsLeft >= 0;
                };
            }, true);
            return this;
        };
        Collection2.prototype.until = function (filterFunction, bIncludeStopEntry) {
            addFilter(this._ctx, function (cursor, advance, resolve2) {
                if (filterFunction(cursor.value)) {
                    advance(resolve2);
                    return bIncludeStopEntry;
                } else {
                    return true;
                }
            });
            return this;
        };
        Collection2.prototype.first = function (cb) {
            return this.limit(1).toArray(function (a2) {
                return a2[0];
            }).then(cb);
        };
        Collection2.prototype.last = function (cb) {
            return this.reverse().first(cb);
        };
        Collection2.prototype.filter = function (filterFunction) {
            addFilter(this._ctx, function (cursor) {
                return filterFunction(cursor.value);
            });
            addMatchFilter(this._ctx, filterFunction);
            return this;
        };
        Collection2.prototype.and = function (filter) {
            return this.filter(filter);
        };
        Collection2.prototype.or = function (indexName) {
            return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection2.prototype.reverse = function () {
            this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
            if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
            return this;
        };
        Collection2.prototype.desc = function () {
            return this.reverse();
        };
        Collection2.prototype.eachKey = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) {
                cb(cursor.key, cursor);
            });
        };
        Collection2.prototype.eachUniqueKey = function (cb) {
            this._ctx.unique = "unique";
            return this.eachKey(cb);
        };
        Collection2.prototype.eachPrimaryKey = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) {
                cb(cursor.primaryKey, cursor);
            });
        };
        Collection2.prototype.keys = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            var a2 = [];
            return this.each(function (item, cursor) {
                a2.push(cursor.key);
            }).then(function () {
                return a2;
            }).then(cb);
        };
        Collection2.prototype.primaryKeys = function (cb) {
            var ctx = this._ctx;
            if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                return this._read(function (trans) {
                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans,
                        values: false,
                        limit: ctx.limit,
                        query: {
                            index,
                            range: ctx.range
                        }
                    });
                }).then(function (_a3) {
                    var result = _a3.result;
                    return result;
                }).then(cb);
            }
            ctx.keysOnly = !ctx.isMatch;
            var a2 = [];
            return this.each(function (item, cursor) {
                a2.push(cursor.primaryKey);
            }).then(function () {
                return a2;
            }).then(cb);
        };
        Collection2.prototype.uniqueKeys = function (cb) {
            this._ctx.unique = "unique";
            return this.keys(cb);
        };
        Collection2.prototype.firstKey = function (cb) {
            return this.limit(1).keys(function (a2) {
                return a2[0];
            }).then(cb);
        };
        Collection2.prototype.lastKey = function (cb) {
            return this.reverse().firstKey(cb);
        };
        Collection2.prototype.distinct = function () {
            var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
            if (!idx || !idx.multi) return this;
            var set = {};
            addFilter(this._ctx, function (cursor) {
                var strKey = cursor.primaryKey.toString();
                var found = hasOwn(set, strKey);
                set[strKey] = true;
                return !found;
            });
            return this;
        };
        Collection2.prototype.modify = function (changes) {
            var _this = this;
            var ctx = this._ctx;
            return this._write(function (trans) {
                var modifyer;
                if (typeof changes === "function") {
                    modifyer = changes;
                } else {
                    modifyer = function (item) {
                        return applyUpdateSpec(item, changes);
                    };
                }
                var coreTable = ctx.table.core;
                var _a3 = coreTable.schema.primaryKey, outbound = _a3.outbound, extractKey = _a3.extractKey;
                var limit = 200;
                var modifyChunkSize = _this.db._options.modifyChunkSize;
                if (modifyChunkSize) {
                    if (typeof modifyChunkSize == "object") {
                        limit = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
                    } else {
                        limit = modifyChunkSize;
                    }
                }
                var totalFailures = [];
                var successCount = 0;
                var failedKeys = [];
                var applyMutateResult = function (expectedCount, res) {
                    var failures = res.failures, numFailures = res.numFailures;
                    successCount += expectedCount - numFailures;
                    for (var _i = 0, _a4 = keys(failures); _i < _a4.length; _i++) {
                        var pos = _a4[_i];
                        totalFailures.push(failures[pos]);
                    }
                };
                var isUnconditionalDelete = changes === deleteCallback;
                return _this.clone().primaryKeys().then(function (keys2) {
                    var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || isUnconditionalDelete) && {
                        index: ctx.index,
                        range: ctx.range
                    };
                    var nextChunk = function (offset) {
                        var count = Math.min(limit, keys2.length - offset);
                        var keysInChunk = keys2.slice(offset, offset + count);
                        return (isUnconditionalDelete ? Promise.resolve([]) : coreTable.getMany({
                            trans,
                            keys: keysInChunk,
                            cache: "immutable"
                        })).then(function (values) {
                            var addValues = [];
                            var putValues = [];
                            var putKeys = outbound ? [] : null;
                            var deleteKeys = isUnconditionalDelete ? keysInChunk : [];
                            if (!isUnconditionalDelete) for (var i2 = 0; i2 < count; ++i2) {
                                var origValue = values[i2];
                                var ctx_1 = {
                                    value: deepClone(origValue),
                                    primKey: keys2[offset + i2]
                                };
                                if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                                    if (ctx_1.value == null) {
                                        deleteKeys.push(keys2[offset + i2]);
                                    } else if (!outbound && cmp2(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                                        deleteKeys.push(keys2[offset + i2]);
                                        addValues.push(ctx_1.value);
                                    } else {
                                        putValues.push(ctx_1.value);
                                        if (outbound) putKeys.push(keys2[offset + i2]);
                                    }
                                }
                            }
                            return Promise.resolve(addValues.length > 0 && coreTable.mutate({
                                trans,
                                type: "add",
                                values: addValues
                            }).then(function (res) {
                                for (var pos in res.failures) {
                                    deleteKeys.splice(parseInt(pos), 1);
                                }
                                applyMutateResult(addValues.length, res);
                            })).then(function () {
                                return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                                    trans,
                                    type: "put",
                                    keys: putKeys,
                                    values: putValues,
                                    criteria,
                                    changeSpec: typeof changes !== "function" && changes,
                                    isAdditionalChunk: offset > 0
                                }).then(function (res) {
                                    return applyMutateResult(putValues.length, res);
                                });
                            }).then(function () {
                                return (deleteKeys.length > 0 || criteria && isUnconditionalDelete) && coreTable.mutate({
                                    trans,
                                    type: "delete",
                                    keys: deleteKeys,
                                    criteria,
                                    isAdditionalChunk: offset > 0
                                }).then(function (res) {
                                    return builtInDeletionTrigger(ctx.table, deleteKeys, res);
                                }).then(function (res) {
                                    return applyMutateResult(deleteKeys.length, res);
                                });
                            }).then(function () {
                                return keys2.length > offset + count && nextChunk(offset + limit);
                            });
                        });
                    };
                    return nextChunk(0).then(function () {
                        if (totalFailures.length > 0) throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                        return keys2.length;
                    });
                });
            });
        };
        Collection2.prototype.delete = function () {
            var ctx = this._ctx, range = ctx.range;
            if (isPlainKeyRange(ctx) && !ctx.table.schema.yProps && (ctx.isPrimKey || range.type === 3)) {
                return this._write(function (trans) {
                    var primaryKey = ctx.table.core.schema.primaryKey;
                    var coreRange = range;
                    return ctx.table.core.count({
                        trans,
                        query: {
                            index: primaryKey,
                            range: coreRange
                        }
                    }).then(function (count) {
                        return ctx.table.core.mutate({
                            trans,
                            type: "deleteRange",
                            range: coreRange
                        }).then(function (_a3) {
                            var failures = _a3.failures, numFailures = _a3.numFailures;
                            if (numFailures) throw new ModifyError("Could not delete some values", Object.keys(failures).map(function (pos) {
                                return failures[pos];
                            }), count - numFailures);
                            return count - numFailures;
                        });
                    });
                });
            }
            return this.modify(deleteCallback);
        };
        return Collection2;
    })();
    var deleteCallback = function (value, ctx) {
        return ctx.value = null;
    };

    function createCollectionConstructor(db2) {
        return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
            this.db = db2;
            var keyRange = AnyRange, error = null;
            if (keyRangeGenerator) try {
                keyRange = keyRangeGenerator();
            } catch (ex) {
                error = ex;
            }
            var whereCtx = whereClause._ctx;
            var table = whereCtx.table;
            var readingHook = table.hook.reading.fire;
            this._ctx = {
                table,
                index: whereCtx.index,
                isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
                range: keyRange,
                keysOnly: false,
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                replayFilter: null,
                justLimit: true,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error,
                or: whereCtx.or,
                valueMapper: readingHook !== mirror ? readingHook : null
            };
        });
    }

    function simpleCompare(a2, b2) {
        return a2 < b2 ? -1 : a2 === b2 ? 0 : 1;
    }

    function simpleCompareReverse(a2, b2) {
        return a2 > b2 ? -1 : a2 === b2 ? 0 : 1;
    }

    function fail(collectionOrWhereClause, err, T2) {
        var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
        collection._ctx.error = T2 ? new T2(err) : new TypeError(err);
        return collection;
    }

    function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function () {
            return rangeEqual("");
        }).limit(0);
    }

    function upperFactory(dir) {
        return dir === "next" ? function (s2) {
            return s2.toUpperCase();
        } : function (s2) {
            return s2.toLowerCase();
        };
    }

    function lowerFactory(dir) {
        return dir === "next" ? function (s2) {
            return s2.toLowerCase();
        } : function (s2) {
            return s2.toUpperCase();
        };
    }

    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp3, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i2 = 0; i2 < length; ++i2) {
            var lwrKeyChar = lowerKey[i2];
            if (lwrKeyChar !== lowerNeedle[i2]) {
                if (cmp3(key[i2], upperNeedle[i2]) < 0) return key.substr(0, i2) + upperNeedle[i2] + upperNeedle.substr(i2 + 1);
                if (cmp3(key[i2], lowerNeedle[i2]) < 0) return key.substr(0, i2) + lowerNeedle[i2] + upperNeedle.substr(i2 + 1);
                if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                return null;
            }
            if (cmp3(key[i2], lwrKeyChar) < 0) llp = i2;
        }
        if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
        return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
    }

    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function (s2) {
            return typeof s2 === "string";
        })) {
            return fail(whereClause, STRING_EXPECTED);
        }

        function initDirection(dir) {
            upper = upperFactory(dir);
            lower = lowerFactory(dir);
            compare = dir === "next" ? simpleCompare : simpleCompareReverse;
            var needleBounds = needles.map(function (needle) {
                return {
                    lower: lower(needle),
                    upper: upper(needle)
                };
            }).sort(function (a2, b2) {
                return compare(a2.lower, b2.lower);
            });
            upperNeedles = needleBounds.map(function (nb) {
                return nb.upper;
            });
            lowerNeedles = needleBounds.map(function (nb) {
                return nb.lower;
            });
            direction = dir;
            nextKeySuffix = dir === "next" ? "" : suffix;
        }

        initDirection("next");
        var c2 = new whereClause.Collection(whereClause, function () {
            return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
        });
        c2._ondirectionchange = function (direction2) {
            initDirection(direction2);
        };
        var firstPossibleNeedle = 0;
        c2._addAlgorithm(function (cursor, advance, resolve2) {
            var key = cursor.key;
            if (typeof key !== "string") return false;
            var lowerKey = lower(key);
            if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                return true;
            } else {
                var lowestPossibleCasing = null;
                for (var i2 = firstPossibleNeedle; i2 < needlesLen; ++i2) {
                    var casing = nextCasing(key, lowerKey, upperNeedles[i2], lowerNeedles[i2], compare, direction);
                    if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i2 + 1;
                    else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                        lowestPossibleCasing = casing;
                    }
                }
                if (lowestPossibleCasing !== null) {
                    advance(function () {
                        cursor.continue(lowestPossibleCasing + nextKeySuffix);
                    });
                } else {
                    advance(resolve2);
                }
                return false;
            }
        });
        return c2;
    }

    function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
            type: 2,
            lower,
            upper,
            lowerOpen,
            upperOpen
        };
    }

    function rangeEqual(value) {
        return {
            type: 1,
            lower: value,
            upper: value
        };
    }

    var WhereClause = (function () {
        function WhereClause2() {
        }

        Object.defineProperty(WhereClause2.prototype, "Collection", {
            get: function () {
                return this._ctx.table.db.Collection;
            },
            enumerable: false,
            configurable: true
        });
        WhereClause2.prototype.between = function (lower, upper, includeLower, includeUpper) {
            includeLower = includeLower !== false;
            includeUpper = includeUpper === true;
            try {
                if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this);
                return new this.Collection(this, function () {
                    return createRange(lower, upper, !includeLower, !includeUpper);
                });
            } catch (e2) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
        };
        WhereClause2.prototype.equals = function (value) {
            if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () {
                return rangeEqual(value);
            });
        };
        WhereClause2.prototype.above = function (value) {
            if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () {
                return createRange(value, void 0, true);
            });
        };
        WhereClause2.prototype.aboveOrEqual = function (value) {
            if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () {
                return createRange(value, void 0, false);
            });
        };
        WhereClause2.prototype.below = function (value) {
            if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () {
                return createRange(void 0, value, false, true);
            });
        };
        WhereClause2.prototype.belowOrEqual = function (value) {
            if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () {
                return createRange(void 0, value);
            });
        };
        WhereClause2.prototype.startsWith = function (str) {
            if (typeof str !== "string") return fail(this, STRING_EXPECTED);
            return this.between(str, str + maxString, true, true);
        };
        WhereClause2.prototype.startsWithIgnoreCase = function (str) {
            if (str === "") return this.startsWith(str);
            return addIgnoreCaseAlgorithm(this, function (x2, a2) {
                return x2.indexOf(a2[0]) === 0;
            }, [str], maxString);
        };
        WhereClause2.prototype.equalsIgnoreCase = function (str) {
            return addIgnoreCaseAlgorithm(this, function (x2, a2) {
                return x2 === a2[0];
            }, [str], "");
        };
        WhereClause2.prototype.anyOfIgnoreCase = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0) return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function (x2, a2) {
                return a2.indexOf(x2) !== -1;
            }, set, "");
        };
        WhereClause2.prototype.startsWithAnyOfIgnoreCase = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0) return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function (x2, a2) {
                return a2.some(function (n2) {
                    return x2.indexOf(n2) === 0;
                });
            }, set, maxString);
        };
        WhereClause2.prototype.anyOf = function () {
            var _this = this;
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            var compare = this._cmp;
            try {
                set.sort(compare);
            } catch (e2) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            if (set.length === 0) return emptyCollection(this);
            var c2 = new this.Collection(this, function () {
                return createRange(set[0], set[set.length - 1]);
            });
            c2._ondirectionchange = function (direction) {
                compare = direction === "next" ? _this._ascending : _this._descending;
                set.sort(compare);
            };
            var i2 = 0;
            c2._addAlgorithm(function (cursor, advance, resolve2) {
                var key = cursor.key;
                while (compare(key, set[i2]) > 0) {
                    ++i2;
                    if (i2 === set.length) {
                        advance(resolve2);
                        return false;
                    }
                }
                if (compare(key, set[i2]) === 0) {
                    return true;
                } else {
                    advance(function () {
                        cursor.continue(set[i2]);
                    });
                    return false;
                }
            });
            return c2;
        };
        WhereClause2.prototype.notEqual = function (value) {
            return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], {
                includeLowers: false,
                includeUppers: false
            });
        };
        WhereClause2.prototype.noneOf = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0) return new this.Collection(this);
            try {
                set.sort(this._ascending);
            } catch (e2) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            var ranges = set.reduce(function (res, val) {
                return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
            }, null);
            ranges.push([set[set.length - 1], this.db._maxKey]);
            return this.inAnyRange(ranges, {
                includeLowers: false,
                includeUppers: false
            });
        };
        WhereClause2.prototype.inAnyRange = function (ranges, options2) {
            var _this = this;
            var cmp3 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min,
                max = this._max;
            if (ranges.length === 0) return emptyCollection(this);
            if (!ranges.every(function (range) {
                return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
            })) {
                return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
            }
            var includeLowers = !options2 || options2.includeLowers !== false;
            var includeUppers = options2 && options2.includeUppers === true;

            function addRange2(ranges2, newRange) {
                var i2 = 0, l2 = ranges2.length;
                for (; i2 < l2; ++i2) {
                    var range = ranges2[i2];
                    if (cmp3(newRange[0], range[1]) < 0 && cmp3(newRange[1], range[0]) > 0) {
                        range[0] = min(range[0], newRange[0]);
                        range[1] = max(range[1], newRange[1]);
                        break;
                    }
                }
                if (i2 === l2) ranges2.push(newRange);
                return ranges2;
            }

            var sortDirection = ascending;

            function rangeSorter(a2, b2) {
                return sortDirection(a2[0], b2[0]);
            }

            var set;
            try {
                set = ranges.reduce(addRange2, []);
                set.sort(rangeSorter);
            } catch (ex) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            var rangePos = 0;
            var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
                return ascending(key, set[rangePos][1]) > 0;
            } : function (key) {
                return ascending(key, set[rangePos][1]) >= 0;
            };
            var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
                return descending(key, set[rangePos][0]) > 0;
            } : function (key) {
                return descending(key, set[rangePos][0]) >= 0;
            };

            function keyWithinCurrentRange(key) {
                return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
            }

            var checkKey = keyIsBeyondCurrentEntry;
            var c2 = new this.Collection(this, function () {
                return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
            });
            c2._ondirectionchange = function (direction) {
                if (direction === "next") {
                    checkKey = keyIsBeyondCurrentEntry;
                    sortDirection = ascending;
                } else {
                    checkKey = keyIsBeforeCurrentEntry;
                    sortDirection = descending;
                }
                set.sort(rangeSorter);
            };
            c2._addAlgorithm(function (cursor, advance, resolve2) {
                var key = cursor.key;
                while (checkKey(key)) {
                    ++rangePos;
                    if (rangePos === set.length) {
                        advance(resolve2);
                        return false;
                    }
                }
                if (keyWithinCurrentRange(key)) {
                    return true;
                } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
                    return false;
                } else {
                    advance(function () {
                        if (sortDirection === ascending) cursor.continue(set[rangePos][0]);
                        else cursor.continue(set[rangePos][1]);
                    });
                    return false;
                }
            });
            return c2;
        };
        WhereClause2.prototype.startsWithAnyOf = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (!set.every(function (s2) {
                return typeof s2 === "string";
            })) {
                return fail(this, "startsWithAnyOf() only works with strings");
            }
            if (set.length === 0) return emptyCollection(this);
            return this.inAnyRange(set.map(function (str) {
                return [str, str + maxString];
            }));
        };
        return WhereClause2;
    })();

    function createWhereClauseConstructor(db2) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
            this.db = db2;
            this._ctx = {
                table,
                index: index === ":id" ? null : index,
                or: orCollection
            };
            this._cmp = this._ascending = cmp2;
            this._descending = function (a2, b2) {
                return cmp2(b2, a2);
            };
            this._max = function (a2, b2) {
                return cmp2(a2, b2) > 0 ? a2 : b2;
            };
            this._min = function (a2, b2) {
                return cmp2(a2, b2) < 0 ? a2 : b2;
            };
            this._IDBKeyRange = db2._deps.IDBKeyRange;
            if (!this._IDBKeyRange) throw new exceptions.MissingAPI();
        });
    }

    function eventRejectHandler(reject) {
        return wrap(function (event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
        });
    }

    function preventDefault(event) {
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
    }

    var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
    var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
    var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
    var Transaction = (function () {
        function Transaction2() {
        }

        Transaction2.prototype._lock = function () {
            assert(!PSD.global);
            ++this._reculock;
            if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
            return this;
        };
        Transaction2.prototype._unlock = function () {
            assert(!PSD.global);
            if (--this._reculock === 0) {
                if (!PSD.global) PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fnAndPSD = this._blockedFuncs.shift();
                    try {
                        usePSD(fnAndPSD[1], fnAndPSD[0]);
                    } catch (e2) {
                    }
                }
            }
            return this;
        };
        Transaction2.prototype._locked = function () {
            return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction2.prototype.create = function (idbtrans) {
            var _this = this;
            if (!this.mode) return this;
            var idbdb = this.db.idbdb;
            var dbOpenError = this.db._state.dbOpenError;
            assert(!this.idbtrans);
            if (!idbtrans && !idbdb) {
                switch (dbOpenError && dbOpenError.name) {
                    case "DatabaseClosedError":
                        throw new exceptions.DatabaseClosed(dbOpenError);
                    case "MissingAPIError":
                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                    default:
                        throw new exceptions.OpenFailed(dbOpenError);
                }
            }
            if (!this.active) throw new exceptions.TransactionInactive();
            assert(this._completion._state === null);
            idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, {
                durability: this.chromeTransactionDurability
            }) : idbdb.transaction(this.storeNames, this.mode, {
                durability: this.chromeTransactionDurability
            }));
            idbtrans.onerror = wrap(function (ev) {
                preventDefault(ev);
                _this._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap(function (ev) {
                preventDefault(ev);
                _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
                _this.active = false;
                _this.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap(function () {
                _this.active = false;
                _this._resolve();
                if ("mutatedParts" in idbtrans) {
                    globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
                }
            });
            return this;
        };
        Transaction2.prototype._promise = function (mode, fn, bWriteLock) {
            var _this = this;
            if (mode === "readwrite" && this.mode !== "readwrite") return rejection(new exceptions.ReadOnly("Transaction is readonly"));
            if (!this.active) return rejection(new exceptions.TransactionInactive());
            if (this._locked()) {
                return new DexiePromise(function (resolve2, reject) {
                    _this._blockedFuncs.push([function () {
                        _this._promise(mode, fn, bWriteLock).then(resolve2, reject);
                    }, PSD]);
                });
            } else if (bWriteLock) {
                return newScope(function () {
                    var p3 = new DexiePromise(function (resolve2, reject) {
                        _this._lock();
                        var rv = fn(resolve2, reject, _this);
                        if (rv && rv.then) rv.then(resolve2, reject);
                    });
                    p3.finally(function () {
                        return _this._unlock();
                    });
                    p3._lib = true;
                    return p3;
                });
            } else {
                var p2 = new DexiePromise(function (resolve2, reject) {
                    var rv = fn(resolve2, reject, _this);
                    if (rv && rv.then) rv.then(resolve2, reject);
                });
                p2._lib = true;
                return p2;
            }
        };
        Transaction2.prototype._root = function () {
            return this.parent ? this.parent._root() : this;
        };
        Transaction2.prototype.waitFor = function (promiseLike) {
            var root2 = this._root();
            var promise = DexiePromise.resolve(promiseLike);
            if (root2._waitingFor) {
                root2._waitingFor = root2._waitingFor.then(function () {
                    return promise;
                });
            } else {
                root2._waitingFor = promise;
                root2._waitingQueue = [];
                var store = root2.idbtrans.objectStore(root2.storeNames[0]);
                (function spin() {
                    ++root2._spinCount;
                    while (root2._waitingQueue.length) root2._waitingQueue.shift()();
                    if (root2._waitingFor) store.get(-Infinity).onsuccess = spin;
                })();
            }
            var currentWaitPromise = root2._waitingFor;
            return new DexiePromise(function (resolve2, reject) {
                promise.then(function (res) {
                    return root2._waitingQueue.push(wrap(resolve2.bind(null, res)));
                }, function (err) {
                    return root2._waitingQueue.push(wrap(reject.bind(null, err)));
                }).finally(function () {
                    if (root2._waitingFor === currentWaitPromise) {
                        root2._waitingFor = null;
                    }
                });
            });
        };
        Transaction2.prototype.abort = function () {
            if (this.active) {
                this.active = false;
                if (this.idbtrans) this.idbtrans.abort();
                this._reject(new exceptions.Abort());
            }
        };
        Transaction2.prototype.table = function (tableName) {
            var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
            if (hasOwn(memoizedTables, tableName)) return memoizedTables[tableName];
            var tableSchema = this.schema[tableName];
            if (!tableSchema) {
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            }
            var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
            transactionBoundTable.core = this.db.core.table(tableName);
            memoizedTables[tableName] = transactionBoundTable;
            return transactionBoundTable;
        };
        return Transaction2;
    })();

    function createTransactionConstructor(db2) {
        return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
            var _this = this;
            if (mode !== "readonly") storeNames.forEach(function (storeName) {
                var _a3;
                var yProps = (_a3 = dbschema[storeName]) === null || _a3 === void 0 ? void 0 : _a3.yProps;
                if (yProps) storeNames = storeNames.concat(yProps.map(function (p2) {
                    return p2.updatesTable;
                }));
            });
            this.db = db2;
            this.mode = mode;
            this.storeNames = storeNames;
            this.schema = dbschema;
            this.chromeTransactionDurability = chromeTransactionDurability;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0;
            this._completion = new DexiePromise(function (resolve2, reject) {
                _this._resolve = resolve2;
                _this._reject = reject;
            });
            this._completion.then(function () {
                _this.active = false;
                _this.on.complete.fire();
            }, function (e2) {
                var wasActive = _this.active;
                _this.active = false;
                _this.on.error.fire(e2);
                _this.parent ? _this.parent._reject(e2) : wasActive && _this.idbtrans && _this.idbtrans.abort();
                return rejection(e2);
            });
        });
    }

    function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey, type2) {
        return {
            name,
            keyPath,
            unique,
            multi,
            auto,
            compound,
            src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath),
            type: type2
        };
    }

    function nameFromKeyPath(keyPath) {
        return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
    }

    function createTableSchema(name, primKey, indexes) {
        return {
            name,
            primKey,
            indexes,
            mappedClass: null,
            idxByName: arrayToObject(indexes, function (index) {
                return [index.name, index];
            })
        };
    }

    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }

    var getMaxKey = function (IdbKeyRange) {
        try {
            IdbKeyRange.only([[]]);
            getMaxKey = function () {
                return [[]];
            };
            return [[]];
        } catch (e2) {
            getMaxKey = function () {
                return maxString;
            };
            return maxString;
        }
    };

    function getKeyExtractor(keyPath) {
        if (keyPath == null) {
            return function () {
                return void 0;
            };
        } else if (typeof keyPath === "string") {
            return getSinglePathKeyExtractor(keyPath);
        } else {
            return function (obj) {
                return getByKeyPath(obj, keyPath);
            };
        }
    }

    function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split(".");
        if (split.length === 1) {
            return function (obj) {
                return obj[keyPath];
            };
        } else {
            return function (obj) {
                return getByKeyPath(obj, keyPath);
            };
        }
    }

    function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
    }

    var _id_counter = 0;

    function getKeyPathAlias(keyPath) {
        return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
    }

    function createDBCore(db2, IdbKeyRange, tmpTrans) {
        function extractSchema(db3, trans) {
            var tables2 = arrayify(db3.objectStoreNames);
            return {
                schema: {
                    name: db3.name,
                    tables: tables2.map(function (table) {
                        return trans.objectStore(table);
                    }).map(function (store) {
                        var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                        var compound = isArray(keyPath);
                        var outbound = keyPath == null;
                        var indexByKeyPath = {};
                        var result = {
                            name: store.name,
                            primaryKey: {
                                name: null,
                                isPrimaryKey: true,
                                outbound,
                                compound,
                                keyPath,
                                autoIncrement,
                                unique: true,
                                extractKey: getKeyExtractor(keyPath)
                            },
                            indexes: arrayify(store.indexNames).map(function (indexName) {
                                return store.index(indexName);
                            }).map(function (index) {
                                var name = index.name, unique = index.unique, multiEntry = index.multiEntry,
                                    keyPath2 = index.keyPath;
                                var compound2 = isArray(keyPath2);
                                var result2 = {
                                    name,
                                    compound: compound2,
                                    keyPath: keyPath2,
                                    unique,
                                    multiEntry,
                                    extractKey: getKeyExtractor(keyPath2)
                                };
                                indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
                                return result2;
                            }),
                            getIndexByKeyPath: function (keyPath2) {
                                return indexByKeyPath[getKeyPathAlias(keyPath2)];
                            }
                        };
                        indexByKeyPath[":id"] = result.primaryKey;
                        if (keyPath != null) {
                            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                        }
                        return result;
                    })
                },
                hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
            };
        }

        function makeIDBKeyRange(range) {
            if (range.type === 3) return null;
            if (range.type === 4) throw new Error("Cannot convert never type to IDBKeyRange");
            var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
            var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
            return idbRange;
        }

        function createDbCoreTable(tableSchema) {
            var tableName = tableSchema.name;

            function mutate(_a4) {
                var trans = _a4.trans, type2 = _a4.type, keys2 = _a4.keys, values = _a4.values, range = _a4.range;
                return new Promise(function (resolve2, reject) {
                    resolve2 = wrap(resolve2);
                    var store = trans.objectStore(tableName);
                    var outbound = store.keyPath == null;
                    var isAddOrPut = type2 === "put" || type2 === "add";
                    if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange") throw new Error("Invalid operation type: " + type2);
                    var length = (keys2 || values || {
                        length: 1
                    }).length;
                    if (keys2 && values && keys2.length !== values.length) {
                        throw new Error("Given keys array must have same length as given values array.");
                    }
                    if (length === 0) return resolve2({
                        numFailures: 0,
                        failures: {},
                        results: [],
                        lastResult: void 0
                    });
                    var req;
                    var reqs = [];
                    var failures = [];
                    var numFailures = 0;
                    var errorHandler = function (event) {
                        ++numFailures;
                        preventDefault(event);
                    };
                    if (type2 === "deleteRange") {
                        if (range.type === 4) return resolve2({
                            numFailures,
                            failures,
                            results: [],
                            lastResult: void 0
                        });
                        if (range.type === 3) reqs.push(req = store.clear());
                        else reqs.push(req = store.delete(makeIDBKeyRange(range)));
                    } else {
                        var _a5 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null],
                            args1 = _a5[0], args2 = _a5[1];
                        if (isAddOrPut) {
                            for (var i2 = 0; i2 < length; ++i2) {
                                reqs.push(req = args2 && args2[i2] !== void 0 ? store[type2](args1[i2], args2[i2]) : store[type2](args1[i2]));
                                req.onerror = errorHandler;
                            }
                        } else {
                            for (var i2 = 0; i2 < length; ++i2) {
                                reqs.push(req = store[type2](args1[i2]));
                                req.onerror = errorHandler;
                            }
                        }
                    }
                    var done = function (event) {
                        var lastResult = event.target.result;
                        reqs.forEach(function (req2, i3) {
                            return req2.error != null && (failures[i3] = req2.error);
                        });
                        resolve2({
                            numFailures,
                            failures,
                            results: type2 === "delete" ? keys2 : reqs.map(function (req2) {
                                return req2.result;
                            }),
                            lastResult
                        });
                    };
                    req.onerror = function (event) {
                        errorHandler(event);
                        done(event);
                    };
                    req.onsuccess = done;
                });
            }

            function openCursor2(_a4) {
                var trans = _a4.trans, values = _a4.values, query2 = _a4.query, reverse = _a4.reverse,
                    unique = _a4.unique;
                return new Promise(function (resolve2, reject) {
                    resolve2 = wrap(resolve2);
                    var index = query2.index, range = query2.range;
                    var store = trans.objectStore(tableName);
                    var source = index.isPrimaryKey ? store : store.index(index.name);
                    var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
                    var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = wrap(function (ev) {
                        var cursor = req.result;
                        if (!cursor) {
                            resolve2(null);
                            return;
                        }
                        cursor.___id = ++_id_counter;
                        cursor.done = false;
                        var _cursorContinue = cursor.continue.bind(cursor);
                        var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                        if (_cursorContinuePrimaryKey) _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                        var _cursorAdvance = cursor.advance.bind(cursor);
                        var doThrowCursorIsNotStarted = function () {
                            throw new Error("Cursor not started");
                        };
                        var doThrowCursorIsStopped = function () {
                            throw new Error("Cursor not stopped");
                        };
                        cursor.trans = trans;
                        cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                        cursor.fail = wrap(reject);
                        cursor.next = function () {
                            var _this = this;
                            var gotOne = 1;
                            return this.start(function () {
                                return gotOne-- ? _this.continue() : _this.stop();
                            }).then(function () {
                                return _this;
                            });
                        };
                        cursor.start = function (callback) {
                            var iterationPromise = new Promise(function (resolveIteration, rejectIteration) {
                                resolveIteration = wrap(resolveIteration);
                                req.onerror = eventRejectHandler(rejectIteration);
                                cursor.fail = rejectIteration;
                                cursor.stop = function (value) {
                                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                                    resolveIteration(value);
                                };
                            });
                            var guardedCallback = function () {
                                if (req.result) {
                                    try {
                                        callback();
                                    } catch (err) {
                                        cursor.fail(err);
                                    }
                                } else {
                                    cursor.done = true;
                                    cursor.start = function () {
                                        throw new Error("Cursor behind last entry");
                                    };
                                    cursor.stop();
                                }
                            };
                            req.onsuccess = wrap(function (ev2) {
                                req.onsuccess = guardedCallback;
                                guardedCallback();
                            });
                            cursor.continue = _cursorContinue;
                            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                            cursor.advance = _cursorAdvance;
                            guardedCallback();
                            return iterationPromise;
                        };
                        resolve2(cursor);
                    }, reject);
                });
            }

            function query(hasGetAll2) {
                return function (request) {
                    return new Promise(function (resolve2, reject) {
                        resolve2 = wrap(resolve2);
                        var trans = request.trans, values = request.values, limit = request.limit,
                            query2 = request.query;
                        var nonInfinitLimit = limit === Infinity ? void 0 : limit;
                        var index = query2.index, range = query2.range;
                        var store = trans.objectStore(tableName);
                        var source = index.isPrimaryKey ? store : store.index(index.name);
                        var idbKeyRange = makeIDBKeyRange(range);
                        if (limit === 0) return resolve2({
                            result: []
                        });
                        if (hasGetAll2) {
                            var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                            req.onsuccess = function (event) {
                                return resolve2({
                                    result: event.target.result
                                });
                            };
                            req.onerror = eventRejectHandler(reject);
                        } else {
                            var count_1 = 0;
                            var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
                            var result_1 = [];
                            req_1.onsuccess = function (event) {
                                var cursor = req_1.result;
                                if (!cursor) return resolve2({
                                    result: result_1
                                });
                                result_1.push(values ? cursor.value : cursor.primaryKey);
                                if (++count_1 === limit) return resolve2({
                                    result: result_1
                                });
                                cursor.continue();
                            };
                            req_1.onerror = eventRejectHandler(reject);
                        }
                    });
                };
            }

            return {
                name: tableName,
                schema: tableSchema,
                mutate,
                getMany: function (_a4) {
                    var trans = _a4.trans, keys2 = _a4.keys;
                    return new Promise(function (resolve2, reject) {
                        resolve2 = wrap(resolve2);
                        var store = trans.objectStore(tableName);
                        var length = keys2.length;
                        var result = new Array(length);
                        var keyCount = 0;
                        var callbackCount = 0;
                        var req;
                        var successHandler = function (event) {
                            var req2 = event.target;
                            if ((result[req2._pos] = req2.result) != null) ;
                            if (++callbackCount === keyCount) resolve2(result);
                        };
                        var errorHandler = eventRejectHandler(reject);
                        for (var i2 = 0; i2 < length; ++i2) {
                            var key = keys2[i2];
                            if (key != null) {
                                req = store.get(keys2[i2]);
                                req._pos = i2;
                                req.onsuccess = successHandler;
                                req.onerror = errorHandler;
                                ++keyCount;
                            }
                        }
                        if (keyCount === 0) resolve2(result);
                    });
                },
                get: function (_a4) {
                    var trans = _a4.trans, key = _a4.key;
                    return new Promise(function (resolve2, reject) {
                        resolve2 = wrap(resolve2);
                        var store = trans.objectStore(tableName);
                        var req = store.get(key);
                        req.onsuccess = function (event) {
                            return resolve2(event.target.result);
                        };
                        req.onerror = eventRejectHandler(reject);
                    });
                },
                query: query(hasGetAll),
                openCursor: openCursor2,
                count: function (_a4) {
                    var query2 = _a4.query, trans = _a4.trans;
                    var index = query2.index, range = query2.range;
                    return new Promise(function (resolve2, reject) {
                        var store = trans.objectStore(tableName);
                        var source = index.isPrimaryKey ? store : store.index(index.name);
                        var idbKeyRange = makeIDBKeyRange(range);
                        var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                        req.onsuccess = wrap(function (ev) {
                            return resolve2(ev.target.result);
                        });
                        req.onerror = eventRejectHandler(reject);
                    });
                }
            };
        }

        var _a3 = extractSchema(db2, tmpTrans), schema = _a3.schema, hasGetAll = _a3.hasGetAll;
        var tables = schema.tables.map(function (tableSchema) {
            return createDbCoreTable(tableSchema);
        });
        var tableMap = {};
        tables.forEach(function (table) {
            return tableMap[table.name] = table;
        });
        return {
            stack: "dbcore",
            transaction: db2.transaction.bind(db2),
            table: function (name) {
                var result = tableMap[name];
                if (!result) throw new Error("Table '".concat(name, "' not found"));
                return tableMap[name];
            },
            MIN_KEY: -Infinity,
            MAX_KEY: getMaxKey(IdbKeyRange),
            schema
        };
    }

    function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function (down, _a3) {
            var create = _a3.create;
            return __assign(__assign({}, down), create(down));
        }, stackImpl);
    }

    function createMiddlewareStacks(middlewares, idbdb, _a3, tmpTrans) {
        var IDBKeyRange = _a3.IDBKeyRange;
        _a3.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
            dbcore
        };
    }

    function generateMiddlewareStacks(db2, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db2._middlewares, idbdb, db2._deps, tmpTrans);
        db2.core = stacks.dbcore;
        db2.tables.forEach(function (table) {
            var tableName = table.name;
            if (db2.core.schema.tables.some(function (tbl) {
                return tbl.name === tableName;
            })) {
                table.core = db2.core.table(tableName);
                if (db2[tableName] instanceof db2.Table) {
                    db2[tableName].core = table.core;
                }
            }
        });
    }

    function setApiOnPlace(db2, objs, tableNames, dbschema) {
        tableNames.forEach(function (tableName) {
            var schema = dbschema[tableName];
            objs.forEach(function (obj) {
                var propDesc = getPropertyDescriptor(obj, tableName);
                if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
                    if (obj === db2.Transaction.prototype || obj instanceof db2.Transaction) {
                        setProp(obj, tableName, {
                            get: function () {
                                return this.table(tableName);
                            },
                            set: function (value) {
                                defineProperty(this, tableName, {
                                    value,
                                    writable: true,
                                    configurable: true,
                                    enumerable: true
                                });
                            }
                        });
                    } else {
                        obj[tableName] = new db2.Table(tableName, schema);
                    }
                }
            });
        });
    }

    function removeTablesApi(db2, objs) {
        objs.forEach(function (obj) {
            for (var key in obj) {
                if (obj[key] instanceof db2.Table) delete obj[key];
            }
        });
    }

    function lowerVersionFirst(a2, b2) {
        return a2._cfg.version - b2._cfg.version;
    }

    function runUpgraders(db2, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db2._dbSchema;
        if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
            globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
            db2._storeNames.push("$meta");
        }
        var trans = db2._createTransaction("readwrite", db2._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function () {
            PSD.trans = trans;
            PSD.transless = transless;
            if (oldVersion === 0) {
                keys(globalSchema).forEach(function (tableName) {
                    createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                generateMiddlewareStacks(db2, idbUpgradeTrans);
                DexiePromise.follow(function () {
                    return db2.on.populate.fire(trans);
                }).catch(rejectTransaction);
            } else {
                generateMiddlewareStacks(db2, idbUpgradeTrans);
                return getExistingVersion(db2, trans, oldVersion).then(function (oldVersion2) {
                    return updateTablesAndIndexes(db2, oldVersion2, trans, idbUpgradeTrans);
                }).catch(rejectTransaction);
            }
        });
    }

    function patchCurrentVersion(db2, idbUpgradeTrans) {
        createMissingTables(db2._dbSchema, idbUpgradeTrans);
        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
            idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
        }
        var globalSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        adjustToExistingIndexNames(db2, db2._dbSchema, idbUpgradeTrans);
        var diff = getSchemaDiff(globalSchema, db2._dbSchema);
        var _loop_1 = function (tableChange2) {
            if (tableChange2.change.length || tableChange2.recreate) {
                console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
                return {
                    value: void 0
                };
            }
            var store = idbUpgradeTrans.objectStore(tableChange2.name);
            tableChange2.add.forEach(function (idx) {
                if (debug) console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
                addIndex(store, idx);
            });
        };
        for (var _i = 0, _a3 = diff.change; _i < _a3.length; _i++) {
            var tableChange = _a3[_i];
            var state_1 = _loop_1(tableChange);
            if (typeof state_1 === "object") return state_1.value;
        }
    }

    function getExistingVersion(db2, trans, oldVersion) {
        if (trans.storeNames.includes("$meta")) {
            return trans.table("$meta").get("version").then(function (metaVersion) {
                return metaVersion != null ? metaVersion : oldVersion;
            });
        } else {
            return DexiePromise.resolve(oldVersion);
        }
    }

    function updateTablesAndIndexes(db2, oldVersion, trans, idbUpgradeTrans) {
        var queue = [];
        var versions = db2._versions;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        var versToRun = versions.filter(function (v2) {
            return v2._cfg.version >= oldVersion;
        });
        if (versToRun.length === 0) {
            return DexiePromise.resolve();
        }
        versToRun.forEach(function (version2) {
            queue.push(function () {
                var oldSchema = globalSchema;
                var newSchema = version2._cfg.dbschema;
                adjustToExistingIndexNames(db2, oldSchema, idbUpgradeTrans);
                adjustToExistingIndexNames(db2, newSchema, idbUpgradeTrans);
                globalSchema = db2._dbSchema = newSchema;
                var diff = getSchemaDiff(oldSchema, newSchema);
                diff.add.forEach(function (tuple) {
                    createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                });
                diff.change.forEach(function (change) {
                    if (change.recreate) {
                        throw new exceptions.Upgrade("Not yet support for changing primary key");
                    } else {
                        var store_1 = idbUpgradeTrans.objectStore(change.name);
                        change.add.forEach(function (idx) {
                            return addIndex(store_1, idx);
                        });
                        change.change.forEach(function (idx) {
                            store_1.deleteIndex(idx.name);
                            addIndex(store_1, idx);
                        });
                        change.del.forEach(function (idxName) {
                            return store_1.deleteIndex(idxName);
                        });
                    }
                });
                var contentUpgrade = version2._cfg.contentUpgrade;
                if (contentUpgrade && version2._cfg.version > oldVersion) {
                    generateMiddlewareStacks(db2, idbUpgradeTrans);
                    trans._memoizedTables = {};
                    var upgradeSchema_1 = shallowClone(newSchema);
                    diff.del.forEach(function (table) {
                        upgradeSchema_1[table] = oldSchema[table];
                    });
                    removeTablesApi(db2, [db2.Transaction.prototype]);
                    setApiOnPlace(db2, [db2.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
                    trans.schema = upgradeSchema_1;
                    var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
                    if (contentUpgradeIsAsync_1) {
                        incrementExpectedAwaits();
                    }
                    var returnValue_1;
                    var promiseFollowed = DexiePromise.follow(function () {
                        returnValue_1 = contentUpgrade(trans);
                        if (returnValue_1) {
                            if (contentUpgradeIsAsync_1) {
                                var decrementor = decrementExpectedAwaits.bind(null, null);
                                returnValue_1.then(decrementor, decrementor);
                            }
                        }
                    });
                    return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function () {
                        return returnValue_1;
                    });
                }
            });
            queue.push(function (idbtrans) {
                var newSchema = version2._cfg.dbschema;
                deleteRemovedTables(newSchema, idbtrans);
                removeTablesApi(db2, [db2.Transaction.prototype]);
                setApiOnPlace(db2, [db2.Transaction.prototype], db2._storeNames, db2._dbSchema);
                trans.schema = db2._dbSchema;
            });
            queue.push(function (idbtrans) {
                if (db2.idbdb.objectStoreNames.contains("$meta")) {
                    if (Math.ceil(db2.idbdb.version / 10) === version2._cfg.version) {
                        db2.idbdb.deleteObjectStore("$meta");
                        delete db2._dbSchema.$meta;
                        db2._storeNames = db2._storeNames.filter(function (name) {
                            return name !== "$meta";
                        });
                    } else {
                        idbtrans.objectStore("$meta").put(version2._cfg.version, "version");
                    }
                }
            });
        });

        function runQueue() {
            return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
        }

        return runQueue().then(function () {
            createMissingTables(globalSchema, idbUpgradeTrans);
        });
    }

    function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
            del: [],
            add: [],
            change: []
        };
        var table;
        for (table in oldSchema) {
            if (!newSchema[table]) diff.del.push(table);
        }
        for (table in newSchema) {
            var oldDef = oldSchema[table], newDef = newSchema[table];
            if (!oldDef) {
                diff.add.push([table, newDef]);
            } else {
                var change = {
                    name: table,
                    def: newDef,
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
                    change.recreate = true;
                    diff.change.push(change);
                } else {
                    var oldIndexes = oldDef.idxByName;
                    var newIndexes = newDef.idxByName;
                    var idxName = void 0;
                    for (idxName in oldIndexes) {
                        if (!newIndexes[idxName]) change.del.push(idxName);
                    }
                    for (idxName in newIndexes) {
                        var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                        if (!oldIdx) change.add.push(newIdx);
                        else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
                    }
                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }

    function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? {
            keyPath: primKey.keyPath,
            autoIncrement: primKey.auto
        } : {
            autoIncrement: primKey.auto
        });
        indexes.forEach(function (idx) {
            return addIndex(store, idx);
        });
        return store;
    }

    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function (tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                if (debug) console.debug("Dexie: Creating missing table", tableName);
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }

    function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(function (storeName) {
            return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
        });
    }

    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, {
            unique: idx.unique,
            multiEntry: idx.multi
        });
    }

    function buildGlobalSchema(db2, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function (storeName) {
            var store = tmpTrans.objectStore(storeName);
            var keyPath = store.keyPath;
            var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
            var indexes = [];
            for (var j2 = 0; j2 < store.indexNames.length; ++j2) {
                var idbindex = store.index(store.indexNames[j2]);
                keyPath = idbindex.keyPath;
                var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
                indexes.push(index);
            }
            globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
    }

    function readGlobalSchema(db2, idbdb, tmpTrans) {
        db2.verno = idbdb.version / 10;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, idbdb, tmpTrans);
        db2._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db2, [db2._allTables], keys(globalSchema), globalSchema);
    }

    function verifyInstalledSchema(db2, tmpTrans) {
        var installedSchema = buildGlobalSchema(db2, db2.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db2._dbSchema);
        return !(diff.add.length || diff.change.some(function (ch) {
            return ch.add.length || ch.change.length;
        }));
    }

    function adjustToExistingIndexNames(db2, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i2 = 0; i2 < storeNames.length; ++i2) {
            var storeName = storeNames[i2];
            var store = idbtrans.objectStore(storeName);
            db2._hasGetAll = "getAll" in store;
            for (var j2 = 0; j2 < store.indexNames.length; ++j2) {
                var indexName = store.indexNames[j2];
                var keyPath = store.index(indexName).keyPath;
                var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
                if (schema[storeName]) {
                    var indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) {
                        indexSpec.name = indexName;
                        delete schema[storeName].idxByName[dexieName];
                        schema[storeName].idxByName[indexName] = indexSpec;
                    }
                }
            }
        }
        if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global2.WorkerGlobalScope && _global2 instanceof _global2.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
            db2._hasGetAll = false;
        }
    }

    function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(",").map(function (index, indexNum) {
            var _a3;
            var typeSplit = index.split(":");
            var type2 = (_a3 = typeSplit[1]) === null || _a3 === void 0 ? void 0 : _a3.trim();
            index = typeSplit[0].trim();
            var name = index.replace(/([&*]|\+\+)/g, "");
            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
            return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0, type2);
        });
    }

    var Version2 = (function () {
        function Version3() {
        }

        Version3.prototype._createTableSchema = function (name, primKey, indexes) {
            return createTableSchema(name, primKey, indexes);
        };
        Version3.prototype._parseIndexSyntax = function (primKeyAndIndexes) {
            return parseIndexSyntax(primKeyAndIndexes);
        };
        Version3.prototype._parseStoresSpec = function (stores, outSchema) {
            var _this = this;
            keys(stores).forEach(function (tableName) {
                if (stores[tableName] !== null) {
                    var indexes = _this._parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (!primKey) {
                        throw new exceptions.Schema("Invalid schema for table " + tableName + ": " + stores[tableName]);
                    }
                    primKey.unique = true;
                    if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multiEntry*");
                    indexes.forEach(function (idx) {
                        if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                    });
                    var tblSchema = _this._createTableSchema(tableName, primKey, indexes);
                    outSchema[tableName] = tblSchema;
                }
            });
        };
        Version3.prototype.stores = function (stores) {
            var db2 = this.db;
            this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
            var versions = db2._versions;
            var storesSpec = {};
            var dbschema = {};
            versions.forEach(function (version2) {
                extend(storesSpec, version2._cfg.storesSource);
                dbschema = version2._cfg.dbschema = {};
                version2._parseStoresSpec(storesSpec, dbschema);
            });
            db2._dbSchema = dbschema;
            removeTablesApi(db2, [db2._allTables, db2, db2.Transaction.prototype]);
            setApiOnPlace(db2, [db2._allTables, db2, db2.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
            db2._storeNames = keys(dbschema);
            return this;
        };
        Version3.prototype.upgrade = function (upgradeFunction) {
            this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
            return this;
        };
        return Version3;
    })();

    function createVersionConstructor(db2) {
        return makeClassConstructor(Version2.prototype, function Version3(versionNumber) {
            this.db = db2;
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            };
        });
    }

    function getDbNamesTable(indexedDB2, IDBKeyRange) {
        var dbNamesDB = indexedDB2["_dbNamesDB"];
        if (!dbNamesDB) {
            dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
                addons: [],
                indexedDB: indexedDB2,
                IDBKeyRange
            });
            dbNamesDB.version(1).stores({
                dbnames: "name"
            });
        }
        return dbNamesDB.table("dbnames");
    }

    function hasDatabasesNative(indexedDB2) {
        return indexedDB2 && typeof indexedDB2.databases === "function";
    }

    function getDatabaseNames(_a3) {
        var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
        return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function (infos) {
            return infos.map(function (info) {
                return info.name;
            }).filter(function (name) {
                return name !== DBNAMES_DB;
            });
        }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
    }

    function _onDatabaseCreated(_a3, name) {
        var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({
            name
        }).catch(nop);
    }

    function _onDatabaseDeleted(_a3, name) {
        var indexedDB2 = _a3.indexedDB, IDBKeyRange = _a3.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
    }

    function vip(fn) {
        return newScope(function () {
            PSD.letThrough = true;
            return fn();
        });
    }

    function idbReady() {
        var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases) return Promise.resolve();
        var intervalId;
        return new Promise(function (resolve2) {
            var tryIdb = function () {
                return indexedDB.databases().finally(resolve2);
            };
            intervalId = setInterval(tryIdb, 100);
            tryIdb();
        }).finally(function () {
            return clearInterval(intervalId);
        });
    }

    var _a2;

    function isEmptyRange(node) {
        return !("from" in node);
    }

    var RangeSet2 = function (fromOrTree, to) {
        if (this) {
            extend(this, arguments.length ? {
                d: 1,
                from: fromOrTree,
                to: arguments.length > 1 ? to : fromOrTree
            } : {
                d: 0
            });
        } else {
            var rv = new RangeSet2();
            if (fromOrTree && "d" in fromOrTree) {
                extend(rv, fromOrTree);
            }
            return rv;
        }
    };
    props(RangeSet2.prototype, (_a2 = {
        add: function (rangeSet) {
            mergeRanges2(this, rangeSet);
            return this;
        },
        addKey: function (key) {
            addRange(this, key, key);
            return this;
        },
        addKeys: function (keys2) {
            var _this = this;
            keys2.forEach(function (key) {
                return addRange(_this, key, key);
            });
            return this;
        },
        hasKey: function (key) {
            var node = getRangeSetIterator(this).next(key).value;
            return node && cmp2(node.from, key) <= 0 && cmp2(node.to, key) >= 0;
        }
    }, _a2[iteratorSymbol] = function () {
        return getRangeSetIterator(this);
    }, _a2));

    function addRange(target, from, to) {
        var diff = cmp2(from, to);
        if (isNaN(diff)) return;
        if (diff > 0) throw RangeError();
        if (isEmptyRange(target)) return extend(target, {
            from,
            to,
            d: 1
        });
        var left = target.l;
        var right = target.r;
        if (cmp2(to, target.from) < 0) {
            left ? addRange(left, from, to) : target.l = {
                from,
                to,
                d: 1,
                l: null,
                r: null
            };
            return rebalance(target);
        }
        if (cmp2(from, target.to) > 0) {
            right ? addRange(right, from, to) : target.r = {
                from,
                to,
                d: 1,
                l: null,
                r: null
            };
            return rebalance(target);
        }
        if (cmp2(from, target.from) < 0) {
            target.from = from;
            target.l = null;
            target.d = right ? right.d + 1 : 1;
        }
        if (cmp2(to, target.to) > 0) {
            target.to = to;
            target.r = null;
            target.d = target.l ? target.l.d + 1 : 1;
        }
        var rightWasCutOff = !target.r;
        if (left && !target.l) {
            mergeRanges2(target, left);
        }
        if (right && rightWasCutOff) {
            mergeRanges2(target, right);
        }
    }

    function mergeRanges2(target, newSet) {
        function _addRangeSet(target2, _a3) {
            var from = _a3.from, to = _a3.to, l2 = _a3.l, r2 = _a3.r;
            addRange(target2, from, to);
            if (l2) _addRangeSet(target2, l2);
            if (r2) _addRangeSet(target2, r2);
        }

        if (!isEmptyRange(newSet)) _addRangeSet(target, newSet);
    }

    function rangesOverlap2(rangeSet1, rangeSet2) {
        var i1 = getRangeSetIterator(rangeSet2);
        var nextResult1 = i1.next();
        if (nextResult1.done) return false;
        var a2 = nextResult1.value;
        var i2 = getRangeSetIterator(rangeSet1);
        var nextResult2 = i2.next(a2.from);
        var b2 = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
            if (cmp2(b2.from, a2.to) <= 0 && cmp2(b2.to, a2.from) >= 0) return true;
            cmp2(a2.from, b2.from) < 0 ? a2 = (nextResult1 = i1.next(b2.from)).value : b2 = (nextResult2 = i2.next(a2.from)).value;
        }
        return false;
    }

    function getRangeSetIterator(node) {
        var state = isEmptyRange(node) ? null : {
            s: 0,
            n: node
        };
        return {
            next: function (key) {
                var keyProvided = arguments.length > 0;
                while (state) {
                    switch (state.s) {
                        case 0:
                            state.s = 1;
                            if (keyProvided) {
                                while (state.n.l && cmp2(key, state.n.from) < 0) state = {
                                    up: state,
                                    n: state.n.l,
                                    s: 1
                                };
                            } else {
                                while (state.n.l) state = {
                                    up: state,
                                    n: state.n.l,
                                    s: 1
                                };
                            }
                        case 1:
                            state.s = 2;
                            if (!keyProvided || cmp2(key, state.n.to) <= 0) return {
                                value: state.n,
                                done: false
                            };
                        case 2:
                            if (state.n.r) {
                                state.s = 3;
                                state = {
                                    up: state,
                                    n: state.n.r,
                                    s: 0
                                };
                                continue;
                            }
                        case 3:
                            state = state.up;
                    }
                }
                return {
                    done: true
                };
            }
        };
    }

    function rebalance(target) {
        var _a3, _b;
        var diff = (((_a3 = target.r) === null || _a3 === void 0 ? void 0 : _a3.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
        var r2 = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r2) {
            var l2 = r2 === "r" ? "l" : "r";
            var rootClone = __assign({}, target);
            var oldRootRight = target[r2];
            target.from = oldRootRight.from;
            target.to = oldRootRight.to;
            target[r2] = oldRootRight[r2];
            rootClone[r2] = oldRootRight[l2];
            target[l2] = rootClone;
            rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
    }

    function computeDepth(_a3) {
        var r2 = _a3.r, l2 = _a3.l;
        return (r2 ? l2 ? Math.max(r2.d, l2.d) : r2.d : l2 ? l2.d : 0) + 1;
    }

    function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(function (part) {
            if (target[part]) mergeRanges2(target[part], newSet[part]);
            else target[part] = cloneSimpleObjectTree(newSet[part]);
        });
        return target;
    }

    function obsSetsOverlap(os1, os2) {
        return os1.all || os2.all || Object.keys(os1).some(function (key) {
            return os2[key] && rangesOverlap2(os2[key], os1[key]);
        });
    }

    var cache = {};
    var unsignaledParts = {};
    var isTaskEnqueued = false;

    function signalSubscribersLazily(part, optimistic) {
        extendObservabilitySet(unsignaledParts, part);
        if (!isTaskEnqueued) {
            isTaskEnqueued = true;
            setTimeout(function () {
                isTaskEnqueued = false;
                var parts = unsignaledParts;
                unsignaledParts = {};
                signalSubscribersNow(parts, false);
            }, 0);
        }
    }

    function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
        if (deleteAffectedCacheEntries === void 0) {
            deleteAffectedCacheEntries = false;
        }
        var queriesToSignal = /* @__PURE__ */ new Set();
        if (updatedParts.all) {
            for (var _i = 0, _a3 = Object.values(cache); _i < _a3.length; _i++) {
                var tblCache = _a3[_i];
                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
        } else {
            for (var key in updatedParts) {
                var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
                if (parts) {
                    var dbName = parts[1], tableName = parts[2];
                    var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
                    if (tblCache) collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
                }
            }
        }
        queriesToSignal.forEach(function (requery) {
            return requery();
        });
    }

    function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
        var updatedEntryLists = [];
        for (var _i = 0, _a3 = Object.entries(tblCache.queries.query); _i < _a3.length; _i++) {
            var _b = _a3[_i], indexName = _b[0], entries = _b[1];
            var filteredEntries = [];
            for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
                var entry = entries_1[_c];
                if (obsSetsOverlap(updatedParts, entry.obsSet)) {
                    entry.subscribers.forEach(function (requery) {
                        return outQueriesToSignal.add(requery);
                    });
                } else if (deleteAffectedCacheEntries) {
                    filteredEntries.push(entry);
                }
            }
            if (deleteAffectedCacheEntries) updatedEntryLists.push([indexName, filteredEntries]);
        }
        if (deleteAffectedCacheEntries) {
            for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
                var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
                tblCache.queries.query[indexName] = filteredEntries;
            }
        }
    }

    function dexieOpen(db2) {
        var state = db2._state;
        var indexedDB2 = db2._deps.indexedDB;
        if (state.isBeingOpened || db2.idbdb) return state.dbReadyPromise.then(function () {
            return state.dbOpenError ? rejection(state.dbOpenError) : db2;
        });
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var openCanceller = state.openCanceller;
        var nativeVerToOpen = Math.round(db2.verno * 10);
        var schemaPatchMode = false;

        function throwIfCancelled() {
            if (state.openCanceller !== openCanceller) throw new exceptions.DatabaseClosed("db.open() was cancelled");
        }

        var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
        var tryOpenDB = function () {
            return new DexiePromise(function (resolve2, reject) {
                throwIfCancelled();
                if (!indexedDB2) throw new exceptions.MissingAPI();
                var dbName = db2.name;
                var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
                if (!req) throw new exceptions.MissingAPI();
                req.onerror = eventRejectHandler(reject);
                req.onblocked = wrap(db2._fireOnBlocked);
                req.onupgradeneeded = wrap(function (e2) {
                    upgradeTransaction = req.transaction;
                    if (state.autoSchema && !db2._options.allowEmptyDB) {
                        req.onerror = preventDefault;
                        upgradeTransaction.abort();
                        req.result.close();
                        var delreq = indexedDB2.deleteDatabase(dbName);
                        delreq.onsuccess = delreq.onerror = wrap(function () {
                            reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                        });
                    } else {
                        upgradeTransaction.onerror = eventRejectHandler(reject);
                        var oldVer = e2.oldVersion > Math.pow(2, 62) ? 0 : e2.oldVersion;
                        wasCreated = oldVer < 1;
                        db2.idbdb = req.result;
                        if (schemaPatchMode) {
                            patchCurrentVersion(db2, upgradeTransaction);
                        }
                        runUpgraders(db2, oldVer / 10, upgradeTransaction, reject);
                    }
                }, reject);
                req.onsuccess = wrap(function () {
                    upgradeTransaction = null;
                    var idbdb = db2.idbdb = req.result;
                    var objectStoreNames = slice(idbdb.objectStoreNames);
                    if (objectStoreNames.length > 0) try {
                        var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                        if (state.autoSchema) readGlobalSchema(db2, idbdb, tmpTrans);
                        else {
                            adjustToExistingIndexNames(db2, db2._dbSchema, tmpTrans);
                            if (!verifyInstalledSchema(db2, tmpTrans) && !schemaPatchMode) {
                                console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                                idbdb.close();
                                nativeVerToOpen = idbdb.version + 1;
                                schemaPatchMode = true;
                                return resolve2(tryOpenDB());
                            }
                        }
                        generateMiddlewareStacks(db2, tmpTrans);
                    } catch (e2) {
                    }
                    connections.push(db2);
                    idbdb.onversionchange = wrap(function (ev) {
                        state.vcFired = true;
                        db2.on("versionchange").fire(ev);
                    });
                    idbdb.onclose = wrap(function () {
                        db2.close({
                            disableAutoOpen: false
                        });
                    });
                    if (wasCreated) _onDatabaseCreated(db2._deps, dbName);
                    resolve2();
                }, reject);
            }).catch(function (err) {
                switch (err === null || err === void 0 ? void 0 : err.name) {
                    case "UnknownError":
                        if (state.PR1398_maxLoop > 0) {
                            state.PR1398_maxLoop--;
                            console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                            return tryOpenDB();
                        }
                        break;
                    case "VersionError":
                        if (nativeVerToOpen > 0) {
                            nativeVerToOpen = 0;
                            return tryOpenDB();
                        }
                        break;
                }
                return DexiePromise.reject(err);
            });
        };
        return DexiePromise.race([openCanceller, (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)]).then(function () {
            throwIfCancelled();
            state.onReadyBeingFired = [];
            return DexiePromise.resolve(vip(function () {
                return db2.on.ready.fire(db2.vip);
            })).then(function fireRemainders() {
                if (state.onReadyBeingFired.length > 0) {
                    var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
                    state.onReadyBeingFired = [];
                    return DexiePromise.resolve(vip(function () {
                        return remainders_1(db2.vip);
                    })).then(fireRemainders);
                }
            });
        }).finally(function () {
            if (state.openCanceller === openCanceller) {
                state.onReadyBeingFired = null;
                state.isBeingOpened = false;
            }
        }).catch(function (err) {
            state.dbOpenError = err;
            try {
                upgradeTransaction && upgradeTransaction.abort();
            } catch (_a3) {
            }
            if (openCanceller === state.openCanceller) {
                db2._close();
            }
            return rejection(err);
        }).finally(function () {
            state.openComplete = true;
            resolveDbReady();
        }).then(function () {
            if (wasCreated) {
                var everything_1 = {};
                db2.tables.forEach(function (table) {
                    table.schema.indexes.forEach(function (idx) {
                        if (idx.name) everything_1["idb://".concat(db2.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet2(-Infinity, [[[]]]);
                    });
                    everything_1["idb://".concat(db2.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db2.name, "/").concat(table.name, "/:dels")] = new RangeSet2(-Infinity, [[[]]]);
                });
                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
                signalSubscribersNow(everything_1, true);
            }
            return db2;
        });
    }

    function awaitIterator(iterator) {
        var callNext = function (result) {
            return iterator.next(result);
        }, doThrow = function (error) {
            return iterator.throw(error);
        }, onSuccess = step(callNext), onError = step(doThrow);

        function step(getNext) {
            return function (val) {
                var next = getNext(val), value = next.value;
                return next.done ? value : !value || typeof value.then !== "function" ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
            };
        }

        return step(callNext)();
    }

    function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i2 = arguments.length;
        if (i2 < 2) throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i2 - 1);
        while (--i2) args[i2 - 1] = arguments[i2];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
    }

    function enterTransactionScope(db2, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function () {
            var transless = PSD.transless || PSD;
            var trans = db2._createTransaction(mode, storeNames, db2._dbSchema, parentTransaction);
            trans.explicit = true;
            var zoneProps = {
                trans,
                transless
            };
            if (parentTransaction) {
                trans.idbtrans = parentTransaction.idbtrans;
            } else {
                try {
                    trans.create();
                    trans.idbtrans._explicit = true;
                    db2._state.PR1398_maxLoop = 3;
                } catch (ex) {
                    if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                        console.warn("Dexie: Need to reopen db");
                        db2.close({
                            disableAutoOpen: false
                        });
                        return db2.open().then(function () {
                            return enterTransactionScope(db2, mode, storeNames, null, scopeFunc);
                        });
                    }
                    return rejection(ex);
                }
            }
            var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
            if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
            }
            var returnValue;
            var promiseFollowed = DexiePromise.follow(function () {
                returnValue = scopeFunc.call(trans, trans);
                if (returnValue) {
                    if (scopeFuncIsAsync) {
                        var decrementor = decrementExpectedAwaits.bind(null, null);
                        returnValue.then(decrementor, decrementor);
                    } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                        returnValue = awaitIterator(returnValue);
                    }
                }
            }, zoneProps);
            return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function (x2) {
                return trans.active ? x2 : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
            }) : promiseFollowed.then(function () {
                return returnValue;
            })).then(function (x2) {
                if (parentTransaction) trans._resolve();
                return trans._completion.then(function () {
                    return x2;
                });
            }).catch(function (e2) {
                trans._reject(e2);
                return rejection(e2);
            });
        });
    }

    function pad(a2, value, count) {
        var result = isArray(a2) ? a2.slice() : [a2];
        for (var i2 = 0; i2 < count; ++i2) result.push(value);
        return result;
    }

    function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), {
            table: function (tableName) {
                var table = down.table(tableName);
                var schema = table.schema;
                var indexLookup = {};
                var allVirtualIndexes = [];

                function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
                    var keyPathAlias = getKeyPathAlias(keyPath);
                    var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
                    var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
                    var isVirtual = keyTail > 0;
                    var virtualIndex = __assign(__assign({}, lowLevelIndex), {
                        name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name,
                        lowLevelIndex,
                        isVirtual,
                        keyTail,
                        keyLength,
                        extractKey: getKeyExtractor(keyPath),
                        unique: !isVirtual && lowLevelIndex.unique
                    });
                    indexList.push(virtualIndex);
                    if (!virtualIndex.isPrimaryKey) {
                        allVirtualIndexes.push(virtualIndex);
                    }
                    if (keyLength > 1) {
                        var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
                        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
                    }
                    indexList.sort(function (a2, b2) {
                        return a2.keyTail - b2.keyTail;
                    });
                    return virtualIndex;
                }

                var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
                indexLookup[":id"] = [primaryKey];
                for (var _i = 0, _a3 = schema.indexes; _i < _a3.length; _i++) {
                    var index = _a3[_i];
                    addVirtualIndexes(index.keyPath, 0, index);
                }

                function findBestIndex(keyPath) {
                    var result2 = indexLookup[getKeyPathAlias(keyPath)];
                    return result2 && result2[0];
                }

                function translateRange(range, keyTail) {
                    return {
                        type: range.type === 1 ? 2 : range.type,
                        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                        lowerOpen: true,
                        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                        upperOpen: true
                    };
                }

                function translateRequest(req) {
                    var index2 = req.query.index;
                    return index2.isVirtual ? __assign(__assign({}, req), {
                        query: {
                            index: index2.lowLevelIndex,
                            range: translateRange(req.query.range, index2.keyTail)
                        }
                    }) : req;
                }

                var result = __assign(__assign({}, table), {
                    schema: __assign(__assign({}, schema), {
                        primaryKey,
                        indexes: allVirtualIndexes,
                        getIndexByKeyPath: findBestIndex
                    }),
                    count: function (req) {
                        return table.count(translateRequest(req));
                    },
                    query: function (req) {
                        return table.query(translateRequest(req));
                    },
                    openCursor: function (req) {
                        var _a4 = req.query.index, keyTail = _a4.keyTail, isVirtual = _a4.isVirtual,
                            keyLength = _a4.keyLength;
                        if (!isVirtual) return table.openCursor(req);

                        function createVirtualCursor(cursor) {
                            function _continue(key) {
                                key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
                            }

                            var virtualCursor = Object.create(cursor, {
                                continue: {
                                    value: _continue
                                },
                                continuePrimaryKey: {
                                    value: function (key, primaryKey2) {
                                        cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
                                    }
                                },
                                primaryKey: {
                                    get: function () {
                                        return cursor.primaryKey;
                                    }
                                },
                                key: {
                                    get: function () {
                                        var key = cursor.key;
                                        return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                                    }
                                },
                                value: {
                                    get: function () {
                                        return cursor.value;
                                    }
                                }
                            });
                            return virtualCursor;
                        }

                        return table.openCursor(translateRequest(req)).then(function (cursor) {
                            return cursor && createVirtualCursor(cursor);
                        });
                    }
                });
                return result;
            }
        });
    }

    var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
    };

    function getObjectDiff(a2, b2, rv, prfx) {
        rv = rv || {};
        prfx = prfx || "";
        keys(a2).forEach(function (prop) {
            if (!hasOwn(b2, prop)) {
                rv[prfx + prop] = void 0;
            } else {
                var ap = a2[prop], bp = b2[prop];
                if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
                    var apTypeName = toStringTag(ap);
                    var bpTypeName = toStringTag(bp);
                    if (apTypeName !== bpTypeName) {
                        rv[prfx + prop] = b2[prop];
                    } else if (apTypeName === "Object") {
                        getObjectDiff(ap, bp, rv, prfx + prop + ".");
                    } else if (ap !== bp) {
                        rv[prfx + prop] = b2[prop];
                    }
                } else if (ap !== bp) rv[prfx + prop] = b2[prop];
            }
        });
        keys(b2).forEach(function (prop) {
            if (!hasOwn(a2, prop)) {
                rv[prfx + prop] = b2[prop];
            }
        });
        return rv;
    }

    function getEffectiveKeys(primaryKey, req) {
        if (req.type === "delete") return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
    }

    var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function (downCore) {
            return __assign(__assign({}, downCore), {
                table: function (tableName) {
                    var downTable = downCore.table(tableName);
                    var primaryKey = downTable.schema.primaryKey;
                    var tableMiddleware = __assign(__assign({}, downTable), {
                        mutate: function (req) {
                            var dxTrans = PSD.trans;
                            var _a3 = dxTrans.table(tableName).hook, deleting = _a3.deleting, creating = _a3.creating,
                                updating = _a3.updating;
                            switch (req.type) {
                                case "add":
                                    if (creating.fire === nop) break;
                                    return dxTrans._promise("readwrite", function () {
                                        return addPutOrDelete(req);
                                    }, true);
                                case "put":
                                    if (creating.fire === nop && updating.fire === nop) break;
                                    return dxTrans._promise("readwrite", function () {
                                        return addPutOrDelete(req);
                                    }, true);
                                case "delete":
                                    if (deleting.fire === nop) break;
                                    return dxTrans._promise("readwrite", function () {
                                        return addPutOrDelete(req);
                                    }, true);
                                case "deleteRange":
                                    if (deleting.fire === nop) break;
                                    return dxTrans._promise("readwrite", function () {
                                        return deleteRange(req);
                                    }, true);
                            }
                            return downTable.mutate(req);

                            function addPutOrDelete(req2) {
                                var dxTrans2 = PSD.trans;
                                var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                                if (!keys2) throw new Error("Keys missing");
                                req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), {
                                    keys: keys2
                                }) : __assign({}, req2);
                                if (req2.type !== "delete") req2.values = __spreadArray([], req2.values);
                                if (req2.keys) req2.keys = __spreadArray([], req2.keys);
                                return getExistingValues(downTable, req2, keys2).then(function (existingValues) {
                                    var contexts = keys2.map(function (key, i2) {
                                        var existingValue = existingValues[i2];
                                        var ctx = {
                                            onerror: null,
                                            onsuccess: null
                                        };
                                        if (req2.type === "delete") {
                                            deleting.fire.call(ctx, key, existingValue, dxTrans2);
                                        } else if (req2.type === "add" || existingValue === void 0) {
                                            var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i2], dxTrans2);
                                            if (key == null && generatedPrimaryKey != null) {
                                                key = generatedPrimaryKey;
                                                req2.keys[i2] = key;
                                                if (!primaryKey.outbound) {
                                                    setByKeyPath(req2.values[i2], primaryKey.keyPath, key);
                                                }
                                            }
                                        } else {
                                            var objectDiff = getObjectDiff(existingValue, req2.values[i2]);
                                            var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                                            if (additionalChanges_1) {
                                                var requestedValue_1 = req2.values[i2];
                                                Object.keys(additionalChanges_1).forEach(function (keyPath) {
                                                    if (hasOwn(requestedValue_1, keyPath)) {
                                                        requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                                                    } else {
                                                        setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                                                    }
                                                });
                                            }
                                        }
                                        return ctx;
                                    });
                                    return downTable.mutate(req2).then(function (_a4) {
                                        var failures = _a4.failures, results = _a4.results,
                                            numFailures = _a4.numFailures, lastResult = _a4.lastResult;
                                        for (var i2 = 0; i2 < keys2.length; ++i2) {
                                            var primKey = results ? results[i2] : keys2[i2];
                                            var ctx = contexts[i2];
                                            if (primKey == null) {
                                                ctx.onerror && ctx.onerror(failures[i2]);
                                            } else {
                                                ctx.onsuccess && ctx.onsuccess(req2.type === "put" && existingValues[i2] ? req2.values[i2] : primKey);
                                            }
                                        }
                                        return {
                                            failures,
                                            results,
                                            numFailures,
                                            lastResult
                                        };
                                    }).catch(function (error) {
                                        contexts.forEach(function (ctx) {
                                            return ctx.onerror && ctx.onerror(error);
                                        });
                                        return Promise.reject(error);
                                    });
                                });
                            }

                            function deleteRange(req2) {
                                return deleteNextChunk(req2.trans, req2.range, 1e4);
                            }

                            function deleteNextChunk(trans, range, limit) {
                                return downTable.query({
                                    trans,
                                    values: false,
                                    query: {
                                        index: primaryKey,
                                        range
                                    },
                                    limit
                                }).then(function (_a4) {
                                    var result = _a4.result;
                                    return addPutOrDelete({
                                        type: "delete",
                                        keys: result,
                                        trans
                                    }).then(function (res) {
                                        if (res.numFailures > 0) return Promise.reject(res.failures[0]);
                                        if (result.length < limit) {
                                            return {
                                                failures: [],
                                                numFailures: 0,
                                                lastResult: void 0
                                            };
                                        } else {
                                            return deleteNextChunk(trans, __assign(__assign({}, range), {
                                                lower: result[result.length - 1],
                                                lowerOpen: true
                                            }), limit);
                                        }
                                    });
                                });
                            }
                        }
                    });
                    return tableMiddleware;
                }
            });
        }
    };

    function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add" ? Promise.resolve([]) : table.getMany({
            trans: req.trans,
            keys: effectiveKeys,
            cache: "immutable"
        });
    }

    function getFromTransactionCache(keys2, cache2, clone) {
        try {
            if (!cache2) return null;
            if (cache2.keys.length < keys2.length) return null;
            var result = [];
            for (var i2 = 0, j2 = 0; i2 < cache2.keys.length && j2 < keys2.length; ++i2) {
                if (cmp2(cache2.keys[i2], keys2[j2]) !== 0) continue;
                result.push(clone ? deepClone(cache2.values[i2]) : cache2.values[i2]);
                ++j2;
            }
            return result.length === keys2.length ? result : null;
        } catch (_a3) {
            return null;
        }
    }

    var cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: function (core) {
            return {
                table: function (tableName) {
                    var table = core.table(tableName);
                    return __assign(__assign({}, table), {
                        getMany: function (req) {
                            if (!req.cache) {
                                return table.getMany(req);
                            }
                            var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                            if (cachedResult) {
                                return DexiePromise.resolve(cachedResult);
                            }
                            return table.getMany(req).then(function (res) {
                                req.trans["_cache"] = {
                                    keys: req.keys,
                                    values: req.cache === "clone" ? deepClone(res) : res
                                };
                                return res;
                            });
                        },
                        mutate: function (req) {
                            if (req.type !== "add") req.trans["_cache"] = null;
                            return table.mutate(req);
                        }
                    });
                }
            };
        }
    };

    function isCachableContext(ctx, table) {
        return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
    }

    function isCachableRequest(type2, req) {
        switch (type2) {
            case "query":
                return req.values && !req.unique;
            case "get":
                return false;
            case "getMany":
                return false;
            case "count":
                return false;
            case "openCursor":
                return false;
        }
    }

    var observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Observability",
        create: function (core) {
            var dbName = core.schema.name;
            var FULL_RANGE = new RangeSet2(core.MIN_KEY, core.MAX_KEY);
            return __assign(__assign({}, core), {
                transaction: function (stores, mode, options2) {
                    if (PSD.subscr && mode !== "readonly") {
                        throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
                    }
                    return core.transaction(stores, mode, options2);
                },
                table: function (tableName) {
                    var table = core.table(tableName);
                    var schema = table.schema;
                    var primaryKey = schema.primaryKey, indexes = schema.indexes;
                    var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
                    var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function (index) {
                        return index.compound && index.keyPath.includes(primaryKey.keyPath);
                    });
                    var tableClone = __assign(__assign({}, table), {
                        mutate: function (req) {
                            var _a3, _b;
                            var trans = req.trans;
                            var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
                            var getRangeSet = function (indexName) {
                                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                                return mutatedParts[part] || (mutatedParts[part] = new RangeSet2());
                            };
                            var pkRangeSet = getRangeSet("");
                            var delsRangeSet = getRangeSet(":dels");
                            var type2 = req.type;
                            var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [getEffectiveKeys(primaryKey, req).filter(function (id) {
                                return id;
                            }), req.values] : [], keys2 = _c[0], newObjs = _c[1];
                            var oldCache = req.trans["_cache"];
                            if (isArray(keys2)) {
                                pkRangeSet.addKeys(keys2);
                                var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                                if (!oldObjs) {
                                    delsRangeSet.addKeys(keys2);
                                }
                                if (oldObjs || newObjs) {
                                    trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                                }
                            } else if (keys2) {
                                var range = {
                                    from: (_a3 = keys2.lower) !== null && _a3 !== void 0 ? _a3 : core.MIN_KEY,
                                    to: (_b = keys2.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY
                                };
                                delsRangeSet.add(range);
                                pkRangeSet.add(range);
                            } else {
                                pkRangeSet.add(FULL_RANGE);
                                delsRangeSet.add(FULL_RANGE);
                                schema.indexes.forEach(function (idx) {
                                    return getRangeSet(idx.name).add(FULL_RANGE);
                                });
                            }
                            return table.mutate(req).then(function (res) {
                                if (keys2 && (req.type === "add" || req.type === "put")) {
                                    pkRangeSet.addKeys(res.results);
                                    if (indexesWithAutoIncPK) {
                                        indexesWithAutoIncPK.forEach(function (idx) {
                                            var idxVals = req.values.map(function (v2) {
                                                return idx.extractKey(v2);
                                            });
                                            var pkPos = idx.keyPath.findIndex(function (prop) {
                                                return prop === primaryKey.keyPath;
                                            });
                                            for (var i2 = 0, len = res.results.length; i2 < len; ++i2) {
                                                idxVals[i2][pkPos] = res.results[i2];
                                            }
                                            getRangeSet(idx.name).addKeys(idxVals);
                                        });
                                    }
                                }
                                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                                return res;
                            });
                        }
                    });
                    var getRange = function (_a3) {
                        var _b, _c;
                        var _d = _a3.query, index = _d.index, range = _d.range;
                        return [index, new RangeSet2((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)];
                    };
                    var readSubscribers = {
                        get: function (req) {
                            return [primaryKey, new RangeSet2(req.key)];
                        },
                        getMany: function (req) {
                            return [primaryKey, new RangeSet2().addKeys(req.keys)];
                        },
                        count: getRange,
                        query: getRange,
                        openCursor: getRange
                    };
                    keys(readSubscribers).forEach(function (method) {
                        tableClone[method] = function (req) {
                            var subscr = PSD.subscr;
                            var isLiveQuery = !!subscr;
                            var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                            var obsSet = cachable ? req.obsSet = {} : subscr;
                            if (isLiveQuery) {
                                var getRangeSet = function (indexName) {
                                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                                    return obsSet[part] || (obsSet[part] = new RangeSet2());
                                };
                                var pkRangeSet_1 = getRangeSet("");
                                var delsRangeSet_1 = getRangeSet(":dels");
                                var _a3 = readSubscribers[method](req), queriedIndex = _a3[0], queriedRanges = _a3[1];
                                if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                                    delsRangeSet_1.add(queriedRanges);
                                } else {
                                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
                                }
                                if (!queriedIndex.isPrimaryKey) {
                                    if (method === "count") {
                                        delsRangeSet_1.add(FULL_RANGE);
                                    } else {
                                        var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), {
                                            values: false
                                        }));
                                        return table[method].apply(this, arguments).then(function (res) {
                                            if (method === "query") {
                                                if (outbound && req.values) {
                                                    return keysPromise_1.then(function (_a4) {
                                                        var resultingKeys = _a4.result;
                                                        pkRangeSet_1.addKeys(resultingKeys);
                                                        return res;
                                                    });
                                                }
                                                var pKeys = req.values ? res.result.map(extractKey) : res.result;
                                                if (req.values) {
                                                    pkRangeSet_1.addKeys(pKeys);
                                                } else {
                                                    delsRangeSet_1.addKeys(pKeys);
                                                }
                                            } else if (method === "openCursor") {
                                                var cursor_1 = res;
                                                var wantValues_1 = req.values;
                                                return cursor_1 && Object.create(cursor_1, {
                                                    key: {
                                                        get: function () {
                                                            delsRangeSet_1.addKey(cursor_1.primaryKey);
                                                            return cursor_1.key;
                                                        }
                                                    },
                                                    primaryKey: {
                                                        get: function () {
                                                            var pkey = cursor_1.primaryKey;
                                                            delsRangeSet_1.addKey(pkey);
                                                            return pkey;
                                                        }
                                                    },
                                                    value: {
                                                        get: function () {
                                                            wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                                            return cursor_1.value;
                                                        }
                                                    }
                                                });
                                            }
                                            return res;
                                        });
                                    }
                                }
                            }
                            return table[method].apply(this, arguments);
                        };
                    });
                    return tableClone;
                }
            });
        }
    };

    function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
            var rangeSet = getRangeSet(ix.name || "");

            function extractKey(obj) {
                return obj != null ? ix.extractKey(obj) : null;
            }

            var addKeyOrKeys = function (key) {
                return ix.multiEntry && isArray(key) ? key.forEach(function (key2) {
                    return rangeSet.addKey(key2);
                }) : rangeSet.addKey(key);
            };
            (oldObjs || newObjs).forEach(function (_2, i2) {
                var oldKey = oldObjs && extractKey(oldObjs[i2]);
                var newKey = newObjs && extractKey(newObjs[i2]);
                if (cmp2(oldKey, newKey) !== 0) {
                    if (oldKey != null) addKeyOrKeys(oldKey);
                    if (newKey != null) addKeyOrKeys(newKey);
                }
            });
        }

        schema.indexes.forEach(addAffectedIndex);
    }

    function adjustOptimisticFromFailures(tblCache, req, res) {
        if (res.numFailures === 0) return req;
        if (req.type === "deleteRange") {
            return null;
        }
        var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
        if (res.numFailures === numBulkOps) {
            return null;
        }
        var clone = __assign({}, req);
        if (isArray(clone.keys)) {
            clone.keys = clone.keys.filter(function (_2, i2) {
                return !(i2 in res.failures);
            });
        }
        if ("values" in clone && isArray(clone.values)) {
            clone.values = clone.values.filter(function (_2, i2) {
                return !(i2 in res.failures);
            });
        }
        return clone;
    }

    function isAboveLower(key, range) {
        return range.lower === void 0 ? true : range.lowerOpen ? cmp2(key, range.lower) > 0 : cmp2(key, range.lower) >= 0;
    }

    function isBelowUpper(key, range) {
        return range.upper === void 0 ? true : range.upperOpen ? cmp2(key, range.upper) < 0 : cmp2(key, range.upper) <= 0;
    }

    function isWithinRange(key, range) {
        return isAboveLower(key, range) && isBelowUpper(key, range);
    }

    function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
        if (!ops || ops.length === 0) return result;
        var index = req.query.index;
        var multiEntry = index.multiEntry;
        var queryRange = req.query.range;
        var primaryKey = table.schema.primaryKey;
        var extractPrimKey = primaryKey.extractKey;
        var extractIndex = index.extractKey;
        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
        var finalResult = ops.reduce(function (result2, op) {
            var modifedResult = result2;
            var includedValues = [];
            if (op.type === "add" || op.type === "put") {
                var includedPKs = new RangeSet2();
                for (var i2 = op.values.length - 1; i2 >= 0; --i2) {
                    var value = op.values[i2];
                    var pk = extractPrimKey(value);
                    if (includedPKs.hasKey(pk)) continue;
                    var key = extractIndex(value);
                    if (multiEntry && isArray(key) ? key.some(function (k2) {
                        return isWithinRange(k2, queryRange);
                    }) : isWithinRange(key, queryRange)) {
                        includedPKs.addKey(pk);
                        includedValues.push(value);
                    }
                }
            }
            switch (op.type) {
                case "add": {
                    var existingKeys_1 = new RangeSet2().addKeys(req.values ? result2.map(function (v2) {
                        return extractPrimKey(v2);
                    }) : result2);
                    modifedResult = result2.concat(req.values ? includedValues.filter(function (v2) {
                        var key2 = extractPrimKey(v2);
                        if (existingKeys_1.hasKey(key2)) return false;
                        existingKeys_1.addKey(key2);
                        return true;
                    }) : includedValues.map(function (v2) {
                        return extractPrimKey(v2);
                    }).filter(function (k2) {
                        if (existingKeys_1.hasKey(k2)) return false;
                        existingKeys_1.addKey(k2);
                        return true;
                    }));
                    break;
                }
                case "put": {
                    var keySet_1 = new RangeSet2().addKeys(op.values.map(function (v2) {
                        return extractPrimKey(v2);
                    }));
                    modifedResult = result2.filter(function (item) {
                        return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
                    }).concat(req.values ? includedValues : includedValues.map(function (v2) {
                        return extractPrimKey(v2);
                    }));
                    break;
                }
                case "delete":
                    var keysToDelete_1 = new RangeSet2().addKeys(op.keys);
                    modifedResult = result2.filter(function (item) {
                        return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
                    });
                    break;
                case "deleteRange":
                    var range_1 = op.range;
                    modifedResult = result2.filter(function (item) {
                        return !isWithinRange(extractPrimKey(item), range_1);
                    });
                    break;
            }
            return modifedResult;
        }, result);
        if (finalResult === result) return result;
        finalResult.sort(function (a2, b2) {
            return cmp2(extractLowLevelIndex(a2), extractLowLevelIndex(b2)) || cmp2(extractPrimKey(a2), extractPrimKey(b2));
        });
        if (req.limit && req.limit < Infinity) {
            if (finalResult.length > req.limit) {
                finalResult.length = req.limit;
            } else if (result.length === req.limit && finalResult.length < req.limit) {
                cacheEntry.dirty = true;
            }
        }
        return immutable ? Object.freeze(finalResult) : finalResult;
    }

    function areRangesEqual(r1, r2) {
        return cmp2(r1.lower, r2.lower) === 0 && cmp2(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
    }

    function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
        if (lower1 === void 0) return lower2 !== void 0 ? -1 : 0;
        if (lower2 === void 0) return 1;
        var c2 = cmp2(lower1, lower2);
        if (c2 === 0) {
            if (lowerOpen1 && lowerOpen2) return 0;
            if (lowerOpen1) return 1;
            if (lowerOpen2) return -1;
        }
        return c2;
    }

    function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
        if (upper1 === void 0) return upper2 !== void 0 ? 1 : 0;
        if (upper2 === void 0) return -1;
        var c2 = cmp2(upper1, upper2);
        if (c2 === 0) {
            if (upperOpen1 && upperOpen2) return 0;
            if (upperOpen1) return -1;
            if (upperOpen2) return 1;
        }
        return c2;
    }

    function isSuperRange(r1, r2) {
        return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
    }

    function findCompatibleQuery(dbName, tableName, type2, req) {
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache) return [];
        var queries = tblCache.queries[type2];
        if (!queries) return [null, false, tblCache, null];
        var indexName = req.query ? req.query.index.name : null;
        var entries = queries[indexName || ""];
        if (!entries) return [null, false, tblCache, null];
        switch (type2) {
            case "query":
                var equalEntry = entries.find(function (entry) {
                    return entry.req.limit === req.limit && entry.req.values === req.values && areRangesEqual(entry.req.query.range, req.query.range);
                });
                if (equalEntry) return [equalEntry, true, tblCache, entries];
                var superEntry = entries.find(function (entry) {
                    var limit = "limit" in entry.req ? entry.req.limit : Infinity;
                    return limit >= req.limit && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
                });
                return [superEntry, false, tblCache, entries];
            case "count":
                var countQuery = entries.find(function (entry) {
                    return areRangesEqual(entry.req.query.range, req.query.range);
                });
                return [countQuery, !!countQuery, tblCache, entries];
        }
    }

    function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
        cacheEntry.subscribers.add(requery);
        signal.addEventListener("abort", function () {
            cacheEntry.subscribers.delete(requery);
            if (cacheEntry.subscribers.size === 0) {
                enqueForDeletion(cacheEntry, container);
            }
        });
    }

    function enqueForDeletion(cacheEntry, container) {
        setTimeout(function () {
            if (cacheEntry.subscribers.size === 0) {
                delArrayItem(container, cacheEntry);
            }
        }, 3e3);
    }

    var cacheMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Cache",
        create: function (core) {
            var dbName = core.schema.name;
            var coreMW = __assign(__assign({}, core), {
                transaction: function (stores, mode, options2) {
                    var idbtrans = core.transaction(stores, mode, options2);
                    if (mode === "readwrite") {
                        var ac_1 = new AbortController();
                        var signal = ac_1.signal;
                        var endTransaction = function (wasCommitted) {
                            return function () {
                                ac_1.abort();
                                if (mode === "readwrite") {
                                    var affectedSubscribers_1 = /* @__PURE__ */ new Set();
                                    for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                                        var storeName = stores_1[_i];
                                        var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                                        if (tblCache) {
                                            var table = core.table(storeName);
                                            var ops = tblCache.optimisticOps.filter(function (op) {
                                                return op.trans === idbtrans;
                                            });
                                            if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                                                for (var _a3 = 0, _b = Object.values(tblCache.queries.query); _a3 < _b.length; _a3++) {
                                                    var entries = _b[_a3];
                                                    for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                                                        var entry = _d[_c];
                                                        if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                                            delArrayItem(entries, entry);
                                                            entry.subscribers.forEach(function (requery) {
                                                                return affectedSubscribers_1.add(requery);
                                                            });
                                                        }
                                                    }
                                                }
                                            } else if (ops.length > 0) {
                                                tblCache.optimisticOps = tblCache.optimisticOps.filter(function (op) {
                                                    return op.trans !== idbtrans;
                                                });
                                                for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                                                    var entries = _f[_e];
                                                    for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                                                        var entry = _h[_g];
                                                        if (entry.res != null && idbtrans.mutatedParts) {
                                                            if (wasCommitted && !entry.dirty) {
                                                                var freezeResults = Object.isFrozen(entry.res);
                                                                var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                                                if (entry.dirty) {
                                                                    delArrayItem(entries, entry);
                                                                    entry.subscribers.forEach(function (requery) {
                                                                        return affectedSubscribers_1.add(requery);
                                                                    });
                                                                } else if (modRes !== entry.res) {
                                                                    entry.res = modRes;
                                                                    entry.promise = DexiePromise.resolve({
                                                                        result: modRes
                                                                    });
                                                                }
                                                            } else {
                                                                if (entry.dirty) {
                                                                    delArrayItem(entries, entry);
                                                                }
                                                                entry.subscribers.forEach(function (requery) {
                                                                    return affectedSubscribers_1.add(requery);
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    affectedSubscribers_1.forEach(function (requery) {
                                        return requery();
                                    });
                                }
                            };
                        };
                        idbtrans.addEventListener("abort", endTransaction(false), {
                            signal
                        });
                        idbtrans.addEventListener("error", endTransaction(false), {
                            signal
                        });
                        idbtrans.addEventListener("complete", endTransaction(true), {
                            signal
                        });
                    }
                    return idbtrans;
                },
                table: function (tableName) {
                    var downTable = core.table(tableName);
                    var primKey = downTable.schema.primaryKey;
                    var tableMW = __assign(__assign({}, downTable), {
                        mutate: function (req) {
                            var trans = PSD.trans;
                            if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
                                return downTable.mutate(req);
                            }
                            var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
                            if (!tblCache) return downTable.mutate(req);
                            var promise = downTable.mutate(req);
                            if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function (key) {
                                return key == null;
                            }))) {
                                promise.then(function (res) {
                                    var reqWithResolvedKeys = __assign(__assign({}, req), {
                                        values: req.values.map(function (value, i2) {
                                            var _a3;
                                            if (res.failures[i2]) return value;
                                            var valueWithKey = ((_a3 = primKey.keyPath) === null || _a3 === void 0 ? void 0 : _a3.includes(".")) ? deepClone(value) : __assign({}, value);
                                            setByKeyPath(valueWithKey, primKey.keyPath, res.results[i2]);
                                            return valueWithKey;
                                        })
                                    });
                                    var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                                    tblCache.optimisticOps.push(adjustedReq);
                                    queueMicrotask(function () {
                                        return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                                    });
                                });
                            } else {
                                tblCache.optimisticOps.push(req);
                                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                                promise.then(function (res) {
                                    if (res.numFailures > 0) {
                                        delArrayItem(tblCache.optimisticOps, req);
                                        var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                                        if (adjustedReq) {
                                            tblCache.optimisticOps.push(adjustedReq);
                                        }
                                        req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                                    }
                                });
                                promise.catch(function () {
                                    delArrayItem(tblCache.optimisticOps, req);
                                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                                });
                            }
                            return promise;
                        },
                        query: function (req) {
                            var _a3;
                            if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req)) return downTable.query(req);
                            var freezeResults = ((_a3 = PSD.trans) === null || _a3 === void 0 ? void 0 : _a3.db._options.cache) === "immutable";
                            var _b = PSD, requery = _b.requery, signal = _b.signal;
                            var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0],
                                exactMatch = _c[1], tblCache = _c[2], container = _c[3];
                            if (cacheEntry && exactMatch) {
                                cacheEntry.obsSet = req.obsSet;
                            } else {
                                var promise = downTable.query(req).then(function (res) {
                                    var result = res.result;
                                    if (cacheEntry) cacheEntry.res = result;
                                    if (freezeResults) {
                                        for (var i2 = 0, l2 = result.length; i2 < l2; ++i2) {
                                            Object.freeze(result[i2]);
                                        }
                                        Object.freeze(result);
                                    } else {
                                        res.result = deepClone(result);
                                    }
                                    return res;
                                }).catch(function (error) {
                                    if (container && cacheEntry) delArrayItem(container, cacheEntry);
                                    return Promise.reject(error);
                                });
                                cacheEntry = {
                                    obsSet: req.obsSet,
                                    promise,
                                    subscribers: /* @__PURE__ */ new Set(),
                                    type: "query",
                                    req,
                                    dirty: false
                                };
                                if (container) {
                                    container.push(cacheEntry);
                                } else {
                                    container = [cacheEntry];
                                    if (!tblCache) {
                                        tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                                            queries: {
                                                query: {},
                                                count: {}
                                            },
                                            objs: /* @__PURE__ */ new Map(),
                                            optimisticOps: [],
                                            unsignaledParts: {}
                                        };
                                    }
                                    tblCache.queries.query[req.query.index.name || ""] = container;
                                }
                            }
                            subscribeToCacheEntry(cacheEntry, container, requery, signal);
                            return cacheEntry.promise.then(function (res) {
                                return {
                                    result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
                                };
                            });
                        }
                    });
                    return tableMW;
                }
            });
            return coreMW;
        }
    };

    function vipify(target, vipDb) {
        return new Proxy(target, {
            get: function (target2, prop, receiver) {
                if (prop === "db") return vipDb;
                return Reflect.get(target2, prop, receiver);
            }
        });
    }

    var Dexie$1 = (function () {
        function Dexie3(name, options2) {
            var _this = this;
            this._middlewares = {};
            this.verno = 0;
            var deps = Dexie3.dependencies;
            this._options = options2 = __assign({
                addons: Dexie3.addons,
                autoOpen: true,
                indexedDB: deps.indexedDB,
                IDBKeyRange: deps.IDBKeyRange,
                cache: "cloned"
            }, options2);
            this._deps = {
                indexedDB: options2.indexedDB,
                IDBKeyRange: options2.IDBKeyRange
            };
            var addons = options2.addons;
            this._dbSchema = {};
            this._versions = [];
            this._storeNames = [];
            this._allTables = {};
            this.idbdb = null;
            this._novip = this;
            var state = {
                dbOpenError: null,
                isBeingOpened: false,
                onReadyBeingFired: null,
                openComplete: false,
                dbReadyResolve: nop,
                dbReadyPromise: null,
                cancelOpen: nop,
                openCanceller: null,
                autoSchema: true,
                PR1398_maxLoop: 3,
                autoOpen: options2.autoOpen
            };
            state.dbReadyPromise = new DexiePromise(function (resolve2) {
                state.dbReadyResolve = resolve2;
            });
            state.openCanceller = new DexiePromise(function (_2, reject) {
                state.cancelOpen = reject;
            });
            this._state = state;
            this.name = name;
            this.on = Events(this, "populate", "blocked", "versionchange", "close", {
                ready: [promisableChain, nop]
            });
            this.once = function (event, callback) {
                var fn = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this.on(event).unsubscribe(fn);
                    callback.apply(_this, args);
                };
                return _this.on(event, fn);
            };
            this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
                return function (subscriber, bSticky) {
                    Dexie3.vip(function () {
                        var state2 = _this._state;
                        if (state2.openComplete) {
                            if (!state2.dbOpenError) DexiePromise.resolve().then(subscriber);
                            if (bSticky) subscribe(subscriber);
                        } else if (state2.onReadyBeingFired) {
                            state2.onReadyBeingFired.push(subscriber);
                            if (bSticky) subscribe(subscriber);
                        } else {
                            subscribe(subscriber);
                            var db_1 = _this;
                            if (!bSticky) subscribe(function unsubscribe() {
                                db_1.on.ready.unsubscribe(subscriber);
                                db_1.on.ready.unsubscribe(unsubscribe);
                            });
                        }
                    });
                };
            });
            this.Collection = createCollectionConstructor(this);
            this.Table = createTableConstructor(this);
            this.Transaction = createTransactionConstructor(this);
            this.Version = createVersionConstructor(this);
            this.WhereClause = createWhereClauseConstructor(this);
            this.on("versionchange", function (ev) {
                if (ev.newVersion > 0) console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
                else console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
                _this.close({
                    disableAutoOpen: false
                });
            });
            this.on("blocked", function (ev) {
                if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
                else console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
            });
            this._maxKey = getMaxKey(options2.IDBKeyRange);
            this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
                return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
            };
            this._fireOnBlocked = function (ev) {
                _this.on("blocked").fire(ev);
                connections.filter(function (c2) {
                    return c2.name === _this.name && c2 !== _this && !c2._state.vcFired;
                }).map(function (c2) {
                    return c2.on("versionchange").fire(ev);
                });
            };
            this.use(cacheExistingValuesMiddleware);
            this.use(cacheMiddleware);
            this.use(observabilityMiddleware);
            this.use(virtualIndexMiddleware);
            this.use(hooksMiddleware);
            var vipDB = new Proxy(this, {
                get: function (_2, prop, receiver) {
                    if (prop === "_vip") return true;
                    if (prop === "table") return function (tableName) {
                        return vipify(_this.table(tableName), vipDB);
                    };
                    var rv = Reflect.get(_2, prop, receiver);
                    if (rv instanceof Table) return vipify(rv, vipDB);
                    if (prop === "tables") return rv.map(function (t2) {
                        return vipify(t2, vipDB);
                    });
                    if (prop === "_createTransaction") return function () {
                        var tx = rv.apply(this, arguments);
                        return vipify(tx, vipDB);
                    };
                    return rv;
                }
            });
            this.vip = vipDB;
            addons.forEach(function (addon) {
                return addon(_this);
            });
        }

        Dexie3.prototype.version = function (versionNumber) {
            if (isNaN(versionNumber) || versionNumber < 0.1) throw new exceptions.Type("Given version is not a positive number");
            versionNumber = Math.round(versionNumber * 10) / 10;
            if (this.idbdb || this._state.isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versions = this._versions;
            var versionInstance = versions.filter(function (v2) {
                return v2._cfg.version === versionNumber;
            })[0];
            if (versionInstance) return versionInstance;
            versionInstance = new this.Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            versionInstance.stores({});
            this._state.autoSchema = false;
            return versionInstance;
        };
        Dexie3.prototype._whenReady = function (fn) {
            var _this = this;
            return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function (resolve2, reject) {
                if (_this._state.openComplete) {
                    return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
                }
                if (!_this._state.isBeingOpened) {
                    if (!_this._state.autoOpen) {
                        reject(new exceptions.DatabaseClosed());
                        return;
                    }
                    _this.open().catch(nop);
                }
                _this._state.dbReadyPromise.then(resolve2, reject);
            }).then(fn);
        };
        Dexie3.prototype.use = function (_a3) {
            var stack = _a3.stack, create = _a3.create, level = _a3.level, name = _a3.name;
            if (name) this.unuse({
                stack,
                name
            });
            var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
            middlewares.push({
                stack,
                create,
                level: level == null ? 10 : level,
                name
            });
            middlewares.sort(function (a2, b2) {
                return a2.level - b2.level;
            });
            return this;
        };
        Dexie3.prototype.unuse = function (_a3) {
            var stack = _a3.stack, name = _a3.name, create = _a3.create;
            if (stack && this._middlewares[stack]) {
                this._middlewares[stack] = this._middlewares[stack].filter(function (mw) {
                    return create ? mw.create !== create : name ? mw.name !== name : false;
                });
            }
            return this;
        };
        Dexie3.prototype.open = function () {
            var _this = this;
            return usePSD(globalPSD, function () {
                return dexieOpen(_this);
            });
        };
        Dexie3.prototype._close = function () {
            this.on.close.fire(new CustomEvent("close"));
            var state = this._state;
            var idx = connections.indexOf(this);
            if (idx >= 0) connections.splice(idx, 1);
            if (this.idbdb) {
                try {
                    this.idbdb.close();
                } catch (e2) {
                }
                this.idbdb = null;
            }
            if (!state.isBeingOpened) {
                state.dbReadyPromise = new DexiePromise(function (resolve2) {
                    state.dbReadyResolve = resolve2;
                });
                state.openCanceller = new DexiePromise(function (_2, reject) {
                    state.cancelOpen = reject;
                });
            }
        };
        Dexie3.prototype.close = function (_a3) {
            var _b = _a3 === void 0 ? {
                disableAutoOpen: true
            } : _a3, disableAutoOpen = _b.disableAutoOpen;
            var state = this._state;
            if (disableAutoOpen) {
                if (state.isBeingOpened) {
                    state.cancelOpen(new exceptions.DatabaseClosed());
                }
                this._close();
                state.autoOpen = false;
                state.dbOpenError = new exceptions.DatabaseClosed();
            } else {
                this._close();
                state.autoOpen = this._options.autoOpen || state.isBeingOpened;
                state.openComplete = false;
                state.dbOpenError = null;
            }
        };
        Dexie3.prototype.delete = function (closeOptions) {
            var _this = this;
            if (closeOptions === void 0) {
                closeOptions = {
                    disableAutoOpen: true
                };
            }
            var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
            var state = this._state;
            return new DexiePromise(function (resolve2, reject) {
                var doDelete = function () {
                    _this.close(closeOptions);
                    var req = _this._deps.indexedDB.deleteDatabase(_this.name);
                    req.onsuccess = wrap(function () {
                        _onDatabaseDeleted(_this._deps, _this.name);
                        resolve2();
                    });
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = _this._fireOnBlocked;
                };
                if (hasInvalidArguments) throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
                if (state.isBeingOpened) {
                    state.dbReadyPromise.then(doDelete);
                } else {
                    doDelete();
                }
            });
        };
        Dexie3.prototype.backendDB = function () {
            return this.idbdb;
        };
        Dexie3.prototype.isOpen = function () {
            return this.idbdb !== null;
        };
        Dexie3.prototype.hasBeenClosed = function () {
            var dbOpenError = this._state.dbOpenError;
            return dbOpenError && dbOpenError.name === "DatabaseClosed";
        };
        Dexie3.prototype.hasFailed = function () {
            return this._state.dbOpenError !== null;
        };
        Dexie3.prototype.dynamicallyOpened = function () {
            return this._state.autoSchema;
        };
        Object.defineProperty(Dexie3.prototype, "tables", {
            get: function () {
                var _this = this;
                return keys(this._allTables).map(function (name) {
                    return _this._allTables[name];
                });
            },
            enumerable: false,
            configurable: true
        });
        Dexie3.prototype.transaction = function () {
            var args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
        };
        Dexie3.prototype._transaction = function (mode, tables, scopeFunc) {
            var _this = this;
            var parentTransaction = PSD.trans;
            if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1) parentTransaction = null;
            var onlyIfCompatible = mode.indexOf("?") !== -1;
            mode = mode.replace("!", "").replace("?", "");
            var idbMode, storeNames;
            try {
                storeNames = tables.map(function (table) {
                    var storeName = table instanceof _this.Table ? table.name : table;
                    if (typeof storeName !== "string") throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                    return storeName;
                });
                if (mode == "r" || mode === READONLY) idbMode = READONLY;
                else if (mode == "rw" || mode == READWRITE) idbMode = READWRITE;
                else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
                if (parentTransaction) {
                    if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                        if (onlyIfCompatible) {
                            parentTransaction = null;
                        } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(function (storeName) {
                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                                if (onlyIfCompatible) {
                                    parentTransaction = null;
                                } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                            }
                        });
                    }
                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                        parentTransaction = null;
                    }
                }
            } catch (e2) {
                return parentTransaction ? parentTransaction._promise(null, function (_2, reject) {
                    reject(e2);
                }) : rejection(e2);
            }
            var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
            return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function () {
                return _this._whenReady(enterTransaction);
            }) : this._whenReady(enterTransaction);
        };
        Dexie3.prototype.table = function (tableName) {
            if (!hasOwn(this._allTables, tableName)) {
                throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
            }
            return this._allTables[tableName];
        };
        return Dexie3;
    })();
    var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
    var Observable = (function () {
        function Observable2(subscribe) {
            this._subscribe = subscribe;
        }

        Observable2.prototype.subscribe = function (x2, error, complete) {
            return this._subscribe(!x2 || typeof x2 === "function" ? {
                next: x2,
                error,
                complete
            } : x2);
        };
        Observable2.prototype[symbolObservable] = function () {
            return this;
        };
        return Observable2;
    })();
    var domDeps;
    try {
        domDeps = {
            indexedDB: _global2.indexedDB || _global2.mozIndexedDB || _global2.webkitIndexedDB || _global2.msIndexedDB,
            IDBKeyRange: _global2.IDBKeyRange || _global2.webkitIDBKeyRange
        };
    } catch (e2) {
        domDeps = {
            indexedDB: null,
            IDBKeyRange: null
        };
    }

    function liveQuery2(querier) {
        var hasValue = false;
        var currentValue;
        var observable = new Observable(function (observer) {
            var scopeFuncIsAsync = isAsyncFunction(querier);

            function execute(ctx) {
                var wasRootExec = beginMicroTickScope();
                try {
                    if (scopeFuncIsAsync) {
                        incrementExpectedAwaits();
                    }
                    var rv = newScope(querier, ctx);
                    if (scopeFuncIsAsync) {
                        rv = rv.finally(decrementExpectedAwaits);
                    }
                    return rv;
                } finally {
                    wasRootExec && endMicroTickScope();
                }
            }

            var closed = false;
            var abortController;
            var accumMuts = {};
            var currentObs = {};
            var subscription = {
                get closed() {
                    return closed;
                },
                unsubscribe: function () {
                    if (closed) return;
                    closed = true;
                    if (abortController) abortController.abort();
                    if (startedListening) globalEvents.storagemutated.unsubscribe(mutationListener);
                }
            };
            observer.start && observer.start(subscription);
            var startedListening = false;
            var doQuery = function () {
                return execInGlobalContext(_doQuery);
            };

            function shouldNotify() {
                return obsSetsOverlap(currentObs, accumMuts);
            }

            var mutationListener = function (parts) {
                extendObservabilitySet(accumMuts, parts);
                if (shouldNotify()) {
                    doQuery();
                }
            };
            var _doQuery = function () {
                if (closed || !domDeps.indexedDB) {
                    return;
                }
                accumMuts = {};
                var subscr = {};
                if (abortController) abortController.abort();
                abortController = new AbortController();
                var ctx = {
                    subscr,
                    signal: abortController.signal,
                    requery: doQuery,
                    querier,
                    trans: null
                };
                var ret = execute(ctx);
                Promise.resolve(ret).then(function (result) {
                    hasValue = true;
                    currentValue = result;
                    if (closed || ctx.signal.aborted) {
                        return;
                    }
                    accumMuts = {};
                    currentObs = subscr;
                    if (!objectIsEmpty(currentObs) && !startedListening) {
                        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                        startedListening = true;
                    }
                    execInGlobalContext(function () {
                        return !closed && observer.next && observer.next(result);
                    });
                }, function (err) {
                    hasValue = false;
                    if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
                        if (!closed) execInGlobalContext(function () {
                            if (closed) return;
                            observer.error && observer.error(err);
                        });
                    }
                });
            };
            setTimeout(doQuery, 0);
            return subscription;
        });
        observable.hasValue = function () {
            return hasValue;
        };
        observable.getValue = function () {
            return currentValue;
        };
        return observable;
    }

    var Dexie2 = Dexie$1;
    props(Dexie2, __assign(__assign({}, fullNameExceptions), {
        delete: function (databaseName) {
            var db2 = new Dexie2(databaseName, {
                addons: []
            });
            return db2.delete();
        },
        exists: function (name) {
            return new Dexie2(name, {
                addons: []
            }).open().then(function (db2) {
                db2.close();
                return true;
            }).catch("NoSuchDatabaseError", function () {
                return false;
            });
        },
        getDatabaseNames: function (cb) {
            try {
                return getDatabaseNames(Dexie2.dependencies).then(cb);
            } catch (_a3) {
                return rejection(new exceptions.MissingAPI());
            }
        },
        defineClass: function () {
            function Class(content) {
                extend(this, content);
            }

            return Class;
        },
        ignoreTransaction: function (scopeFunc) {
            return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
        },
        vip,
        async: function (generatorFn) {
            return function () {
                try {
                    var rv = awaitIterator(generatorFn.apply(this, arguments));
                    if (!rv || typeof rv.then !== "function") return DexiePromise.resolve(rv);
                    return rv;
                } catch (e2) {
                    return rejection(e2);
                }
            };
        },
        spawn: function (generatorFn, args, thiz) {
            try {
                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
                if (!rv || typeof rv.then !== "function") return DexiePromise.resolve(rv);
                return rv;
            } catch (e2) {
                return rejection(e2);
            }
        },
        currentTransaction: {
            get: function () {
                return PSD.trans || null;
            }
        },
        waitFor: function (promiseOrFunction, optionalTimeout) {
            var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie2.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
            return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        Promise: DexiePromise,
        debug: {
            get: function () {
                return debug;
            },
            set: function (value) {
                setDebug(value);
            }
        },
        derive,
        extend,
        props,
        override,
        Events,
        on: globalEvents,
        liveQuery: liveQuery2,
        extendObservabilitySet,
        getByKeyPath,
        setByKeyPath,
        delByKeyPath,
        shallowClone,
        deepClone,
        getObjectDiff,
        cmp: cmp2,
        asap: asap$1,
        minKey,
        addons: [],
        connections,
        errnames,
        dependencies: domDeps,
        cache,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split(".").map(function (n2) {
            return parseInt(n2);
        }).reduce(function (p2, c2, i2) {
            return p2 + c2 / Math.pow(10, i2 * 2);
        })
    }));
    Dexie2.maxKey = getMaxKey(Dexie2.dependencies.IDBKeyRange);
    if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function (updatedParts) {
            if (!propagatingLocally) {
                var event_1;
                event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
                    detail: updatedParts
                });
                propagatingLocally = true;
                dispatchEvent(event_1);
                propagatingLocally = false;
            }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function (_a3) {
            var detail = _a3.detail;
            if (!propagatingLocally) {
                propagateLocally(detail);
            }
        });
    }

    function propagateLocally(updateParts) {
        var wasMe = propagatingLocally;
        try {
            propagatingLocally = true;
            globalEvents.storagemutated.fire(updateParts);
            signalSubscribersNow(updateParts, true);
        } finally {
            propagatingLocally = wasMe;
        }
    }

    var propagatingLocally = false;
    var bc;
    var createBC = function () {
    };
    if (typeof BroadcastChannel !== "undefined") {
        createBC = function () {
            bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
            bc.onmessage = function (ev) {
                return ev.data && propagateLocally(ev.data);
            };
        };
        createBC();
        if (typeof bc.unref === "function") {
            bc.unref();
        }
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function (changedParts) {
            if (!propagatingLocally) {
                bc.postMessage(changedParts);
            }
        });
    }
    if (typeof addEventListener !== "undefined") {
        addEventListener("pagehide", function (event) {
            if (!Dexie$1.disableBfCache && event.persisted) {
                if (debug) console.debug("Dexie: handling persisted pagehide");
                bc === null || bc === void 0 ? void 0 : bc.close();
                for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
                    var db2 = connections_1[_i];
                    db2.close({
                        disableAutoOpen: false
                    });
                }
            }
        });
        addEventListener("pageshow", function (event) {
            if (!Dexie$1.disableBfCache && event.persisted) {
                if (debug) console.debug("Dexie: handling persisted pageshow");
                createBC();
                propagateLocally({
                    all: new RangeSet2(-Infinity, [[]])
                });
            }
        });
    }

    function add2(value) {
        return new PropModification2({
            add: value
        });
    }

    function remove2(value) {
        return new PropModification2({
            remove: value
        });
    }

    function replacePrefix2(a2, b2) {
        return new PropModification2({
            replacePrefix: [a2, b2]
        });
    }

    DexiePromise.rejectionMapper = mapError;
    setDebug(debug);
    var namedExports = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        Dexie: Dexie$1,
        liveQuery: liveQuery2,
        Entity: Entity2,
        cmp: cmp2,
        PropModification: PropModification2,
        replacePrefix: replacePrefix2,
        add: add2,
        remove: remove2,
        "default": Dexie$1,
        RangeSet: RangeSet2,
        mergeRanges: mergeRanges2,
        rangesOverlap: rangesOverlap2
    });
    __assign(Dexie$1, namedExports, {
        default: Dexie$1
    });
    return Dexie$1;
});
exports$1.Dexie;
const _default = exports$1.default ?? exports$1;
const DexieSymbol = /* @__PURE__ */ Symbol.for("Dexie");
const Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = _default);
if (_default.semVer !== Dexie.semVer) {
    throw new Error(`Two different versions of Dexie loaded in the same app: ${_default.semVer} and ${Dexie.semVer}`);
}
const {
    liveQuery,
    mergeRanges,
    rangesOverlap,
    RangeSet,
    cmp,
    Entity,
    PropModification,
    replacePrefix,
    add,
    remove,
    DexieYProvider
} = Dexie;
if (typeof window === "undefined") {
    const {
        default: indexedDB2
    } = await import("./index-S9TZYC6K-BIL0EvdZ.mjs");
    const IDBKeyRange = (await import("./FDBKeyRange-BP9gSB4e-BkzWb3MZ.mjs").then((n2) => n2.e)).default;
    Dexie.dependencies.indexedDB = indexedDB2;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

class GitHubCacheDB extends Dexie {
    constructor() {
        super("GitHubCache");
        this.version(1).stores({
            cache: "++id, &key, timestamp"
        });
    }
}

const db = new GitHubCacheDB();
const BrowserStore = {
    /**
     * Retrieves an item from the cache if it exists and is not expired.
     * @param keyParts - Array of strings to form the key.
     * @param expiryMs - Expiry time in milliseconds (default is 1 hour).
     * @return A promise that resolves to the cached data or null if not found/expired.
     */
    async getItem(keyParts, expiryMs = 60 * 60 * 1e3) {
        try {
            const key = generateKey(keyParts);
            const result = await db.cache.where("key").equals(key).first();
            if (!result) return null;
            const now = Date.now();
            if (now - result.timestamp < expiryMs) {
                console.log(`Using cached data for key: ${key}`);
                return result.data;
            }
            await db.cache.where("key").equals(key).delete();
            return null;
        } catch (error) {
            console.error("Error reading from IndexedDB:", error);
            return null;
        }
    },
    /**
     * Stores an item in the cache with the specified key parts.
     * @param keyParts - Array of strings to form the key.
     * @param value - The data to be cached.
     * @return A promise that resolves when the operation is complete.
     */
    async setItem(keyParts, value) {
        try {
            const key = generateKey(keyParts);
            const record = {
                key,
                data: value,
                timestamp: Date.now()
            };
            await db.cache.where("key").equals(key).delete();
            await db.cache.add(record);
        } catch (error) {
            console.error("Error writing to IndexedDB:", error);
        }
    }
};

function generateKey(keyParts) {
    return keyParts.join(":");
}

async function fetchFromGitHub(endpoint, token) {
    return (await new O({
        userAgent: GITHUB.org.user_agent,
        baseUrl: GITHUB.api.url,
        headers: {
            "X-GitHub-Api-Version": GITHUB.api.version
        }
    }).request(`GET ${endpoint}`, {
        headers: {}
    })).data;
}

async function getCachedData(cacheKey, identifier, identifierType, apiEndpoint, token, cacheExpiry = GITHUB.api.members.cacheExpiry) {
    try {
        const cached = await BrowserStore.getItem([cacheKey, identifier], cacheExpiry);
        if (cached !== null) {
            console.log(`Using cached data from IndexedDB for ${cacheKey} (${identifierType}): ${identifier}`);
            return cached;
        }
        console.log(`Fetching data from GitHub for ${cacheKey} (${identifierType}): ${identifier}`);
        const data = await fetchFromGitHub(apiEndpoint, token);
        await BrowserStore.setItem([cacheKey, identifier], data);
        return data;
    } catch (e2) {
        console.error(`Error fetching or caching ${identifierType} ${cacheKey} (${identifier}):`, e2);
        throw new Error(`Failed to load ${identifierType} ${cacheKey} for ${identifier}.`);
    }
}

function createOrgDataHandler(dataType, endpoint) {
    return async (ctx) => {
        const url = new URL(ctx.req.url);
        const param = url.searchParams.get("org");
        if (!param) {
            return new Response("Missing 'org' parameter", {
                status: 400
            });
        }
        try {
            const data = await getCachedData(dataType, param, "organization", endpoint.replace("{org}", param));
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } catch (e2) {
            console.error(`Error in ${dataType} API route:`, e2);
            return new Response(e2 instanceof Error ? e2.message : String(e2), {
                status: 500
            });
        }
    };
}

function githubPlugin(app2) {
    app2.get("/api/github/org/members", createOrgDataHandler("members", "/orgs/{org}/members"));
    app2.get("/api/github/org/repos", createOrgDataHandler("repos", "/orgs/{org}/repos"));
}

async function redirectMiddleware(ctx) {
    const url = new URL(ctx.req.url);
    if (url.pathname !== "/" && !url.pathname.startsWith("/api")) {
        return Response.redirect(new URL("/", url.origin), 308);
    }
    return await ctx.next();
}

const app = new App();
const allowedOrigins = (origin) => origin === "https://xodium.org" || origin?.endsWith(".xodium.org") === true;
app.use(staticFiles$1());
app.use(redirectMiddleware);
app.use(cors({
    origin: (origin) => {
        if (!origin) return null;
        if (origin === "https://xodium.org" || /\.xodium\.org$/.test(origin)) {
            return origin;
        }
        return null;
    },
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true
}));
app.use(csrf({
    origin: allowedOrigins
}));
app.use(trailingSlashes());
githubPlugin(app);
app.fsRoutes();
const root = join(import.meta.dirname, "..");
setBuildCache(app, new ProdBuildCache(root, snapshot), "production");
const _fresh_server_entry = {
    fetch: app.handler()
};
export {
    Header as H,
    ProjectGrid as P,
    TeamGrid as T,
    _fresh_server_entry as _,
    a$4 as a,
    Typewriter as b,
    define$1 as d,
    s$5 as s,
    u$7 as u
};
