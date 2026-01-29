const messages = {
    AbortError: "A request was aborted, for example through a call to IDBTransaction.abort.",
    ConstraintError: "A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one.",
    DataError: "Data provided to an operation does not meet requirements.",
    InvalidAccessError: "An invalid operation was performed on an object. For example transaction creation attempt was made, but an empty scope was provided.",
    InvalidStateError: "An operation was called on an object on which it is not allowed or at a time when it is not allowed. Also occurs if a request is made on a source object that has been deleted or removed. Use TransactionInactiveError or ReadOnlyError when possible, as they are more specific variations of InvalidStateError.",
    NotFoundError: "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",
    ReadOnlyError: 'The mutating operation was attempted in a "readonly" transaction.',
    TransactionInactiveError: "A request was placed against a transaction which is currently not active, or which is finished.",
    VersionError: "An attempt was made to open a database using a lower version than the existing version."
};
const setErrorCode = (error, value) => {
    Object.defineProperty(error, "code", {
        value,
        writable: false,
        enumerable: true,
        configurable: false
    });
};

class AbortError extends DOMException {
    constructor(message = messages.AbortError) {
        super(message, "AbortError");
    }
}

class ConstraintError extends DOMException {
    constructor(message = messages.ConstraintError) {
        super(message, "ConstraintError");
    }
}

class DataError extends DOMException {
    constructor(message = messages.DataError) {
        super(message, "DataError");
        setErrorCode(this, 0);
    }
}

class InvalidAccessError extends DOMException {
    constructor(message = messages.InvalidAccessError) {
        super(message, "InvalidAccessError");
    }
}

class InvalidStateError extends DOMException {
    constructor(message = messages.InvalidStateError) {
        super(message, "InvalidStateError");
        setErrorCode(this, 11);
    }
}

class NotFoundError extends DOMException {
    constructor(message = messages.NotFoundError) {
        super(message, "NotFoundError");
    }
}

class ReadOnlyError extends DOMException {
    constructor(message = messages.ReadOnlyError) {
        super(message, "ReadOnlyError");
    }
}

class SyntaxError extends DOMException {
    constructor(message = messages.VersionError) {
        super(message, "SyntaxError");
        setErrorCode(this, 12);
    }
}

class TransactionInactiveError extends DOMException {
    constructor(message = messages.TransactionInactiveError) {
        super(message, "TransactionInactiveError");
        setErrorCode(this, 0);
    }
}

class VersionError extends DOMException {
    constructor(message = messages.VersionError) {
        super(message, "VersionError");
    }
}

function isSharedArrayBuffer(input) {
    return typeof SharedArrayBuffer !== "undefined" && input instanceof SharedArrayBuffer;
}

const INVALID_TYPE = /* @__PURE__ */ Symbol("INVALID_TYPE");
const INVALID_VALUE = /* @__PURE__ */ Symbol("INVALID_VALUE");
const valueToKeyWithoutThrowing = (input, seen) => {
    if (typeof input === "number") {
        if (isNaN(input)) {
            return INVALID_VALUE;
        }
        return input;
    } else if (Object.prototype.toString.call(input) === "[object Date]") {
        const ms = input.valueOf();
        if (isNaN(ms)) {
            return INVALID_VALUE;
        }
        return new Date(ms);
    } else if (typeof input === "string") {
        return input;
    } else if (
        // https://w3c.github.io/IndexedDB/#ref-for-dfn-buffer-source-type
        input instanceof ArrayBuffer || isSharedArrayBuffer(input) || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(input)
    ) {
        if ("detached" in input ? input.detached : input.byteLength === 0) {
            return INVALID_VALUE;
        }
        let arrayBuffer;
        let offset = 0;
        let length = 0;
        if (input instanceof ArrayBuffer || isSharedArrayBuffer(input)) {
            arrayBuffer = input;
            length = input.byteLength;
        } else {
            arrayBuffer = input.buffer;
            offset = input.byteOffset;
            length = input.byteLength;
        }
        return arrayBuffer.slice(offset, offset + length);
    } else if (Array.isArray(input)) {
        if (seen === void 0) {
            seen = /* @__PURE__ */ new Set();
        } else if (seen.has(input)) {
            return INVALID_VALUE;
        }
        seen.add(input);
        let hasInvalid = false;
        const keys = Array.from({
            length: input.length
        }, (_, i) => {
            if (hasInvalid) {
                return;
            }
            const hop = Object.hasOwn(input, i);
            if (!hop) {
                hasInvalid = true;
                return;
            }
            const entry = input[i];
            const key = valueToKeyWithoutThrowing(entry, seen);
            if (key === INVALID_VALUE || key === INVALID_TYPE) {
                hasInvalid = true;
                return;
            }
            return key;
        });
        if (hasInvalid) {
            return INVALID_VALUE;
        }
        return keys;
    } else {
        return INVALID_TYPE;
    }
};
const valueToKey = (input, seen) => {
    const result = valueToKeyWithoutThrowing(input, seen);
    if (result === INVALID_VALUE || result === INVALID_TYPE) {
        throw new DataError();
    }
    return result;
};
const getType = (x) => {
    if (typeof x === "number") {
        return "Number";
    }
    if (Object.prototype.toString.call(x) === "[object Date]") {
        return "Date";
    }
    if (Array.isArray(x)) {
        return "Array";
    }
    if (typeof x === "string") {
        return "String";
    }
    if (x instanceof ArrayBuffer) {
        return "Binary";
    }
    throw new DataError();
};
const cmp = (first, second) => {
    if (second === void 0) {
        throw new TypeError();
    }
    first = valueToKey(first);
    second = valueToKey(second);
    const t1 = getType(first);
    const t2 = getType(second);
    if (t1 !== t2) {
        if (t1 === "Array") {
            return 1;
        }
        if (t1 === "Binary" && (t2 === "String" || t2 === "Date" || t2 === "Number")) {
            return 1;
        }
        if (t1 === "String" && (t2 === "Date" || t2 === "Number")) {
            return 1;
        }
        if (t1 === "Date" && t2 === "Number") {
            return 1;
        }
        return -1;
    }
    if (t1 === "Binary") {
        first = new Uint8Array(first);
        second = new Uint8Array(second);
    }
    if (t1 === "Array" || t1 === "Binary") {
        const length = Math.min(first.length, second.length);
        for (let i = 0; i < length; i++) {
            const result = cmp(first[i], second[i]);
            if (result !== 0) {
                return result;
            }
        }
        if (first.length > second.length) {
            return 1;
        }
        if (first.length < second.length) {
            return -1;
        }
        return 0;
    }
    if (t1 === "Date") {
        if (first.getTime() === second.getTime()) {
            return 0;
        }
    } else {
        if (first === second) {
            return 0;
        }
    }
    return first > second ? 1 : -1;
};

class FDBKeyRange {
    constructor(lower, upper, lowerOpen, upperOpen) {
        this.lower = lower;
        this.upper = upper;
        this.lowerOpen = lowerOpen;
        this.upperOpen = upperOpen;
    }

    get [Symbol.toStringTag]() {
        return "IDBKeyRange";
    }

    static only(value) {
        if (arguments.length === 0) {
            throw new TypeError();
        }
        value = valueToKey(value);
        return new FDBKeyRange(value, value, false, false);
    }

    static lowerBound(lower, open = false) {
        if (arguments.length === 0) {
            throw new TypeError();
        }
        lower = valueToKey(lower);
        return new FDBKeyRange(lower, void 0, open, true);
    }

    static upperBound(upper, open = false) {
        if (arguments.length === 0) {
            throw new TypeError();
        }
        upper = valueToKey(upper);
        return new FDBKeyRange(void 0, upper, true, open);
    }

    static bound(lower, upper, lowerOpen = false, upperOpen = false) {
        if (arguments.length < 2) {
            throw new TypeError();
        }
        const cmpResult = cmp(lower, upper);
        if (cmpResult === 1 || cmpResult === 0 && (lowerOpen || upperOpen)) {
            throw new DataError();
        }
        lower = valueToKey(lower);
        upper = valueToKey(upper);
        return new FDBKeyRange(lower, upper, lowerOpen, upperOpen);
    }

    // https://w3c.github.io/IndexedDB/#dom-idbkeyrange-includes
    includes(key) {
        if (arguments.length === 0) {
            throw new TypeError();
        }
        key = valueToKey(key);
        if (this.lower !== void 0) {
            const cmpResult = cmp(this.lower, key);
            if (cmpResult === 1 || cmpResult === 0 && this.lowerOpen) {
                return false;
            }
        }
        if (this.upper !== void 0) {
            const cmpResult = cmp(this.upper, key);
            if (cmpResult === -1 || cmpResult === 0 && this.upperOpen) {
                return false;
            }
        }
        return true;
    }
}

const FDBKeyRange$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: FDBKeyRange
}, Symbol.toStringTag, {
    value: "Module"
}));
export {
    AbortError as A,
    ConstraintError as C,
    DataError as D,
    FDBKeyRange as F,
    InvalidStateError as I,
    NotFoundError as N,
    ReadOnlyError as R,
    SyntaxError as S,
    TransactionInactiveError as T,
    VersionError as V,
    InvalidAccessError as a,
    valueToKeyWithoutThrowing as b,
    cmp as c,
    INVALID_TYPE as d,
    FDBKeyRange$1 as e,
    valueToKey as v
};
