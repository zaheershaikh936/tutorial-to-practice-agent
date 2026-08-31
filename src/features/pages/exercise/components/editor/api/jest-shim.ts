/**
 * A minimal, dependency-free stand-in for Jest globals (describe/test/it/
 * beforeEach/expect). Piston's Node runtime has no npm packages installed,
 * so real Jest isn't available - this covers the common matchers the
 * test-case-generation prompt tends to produce, runs each test immediately
 * (no async queueing like real Jest), and prints results between two
 * marker lines that parse-test-results.ts looks for.
 */
export const JEST_SHIM_SOURCE = `
(function () {
  const __results = [];
  let __currentDescribe = "";
  const __beforeEachFns = [];

  function __stringify(value) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function __isEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }

  global.describe = function (name, fn) {
    const previous = __currentDescribe;
    __currentDescribe = name;
    fn();
    __currentDescribe = previous;
  };

  global.beforeEach = function (fn) {
    __beforeEachFns.push(fn);
  };

  function __runTest(name, fn) {
    const fullName = __currentDescribe ? __currentDescribe + " > " + name : name;
    try {
      __beforeEachFns.forEach((f) => f());
      fn();
      __results.push({ name: fullName, pass: true });
    } catch (err) {
      __results.push({
        name: fullName,
        pass: false,
        message: err && err.message ? err.message : String(err),
      });
    }
  }

  global.test = __runTest;
  global.it = __runTest;

  global.expect = function (received) {
    const fail = (msg) => {
      throw new Error(msg);
    };
    return {
      toBe(expected) {
        if (!Object.is(received, expected)) fail("Expected " + __stringify(received) + " to be " + __stringify(expected));
      },
      toEqual(expected) {
        if (!__isEqual(received, expected)) fail("Expected " + __stringify(received) + " to equal " + __stringify(expected));
      },
      toBeTruthy() {
        if (!received) fail("Expected " + __stringify(received) + " to be truthy");
      },
      toBeFalsy() {
        if (received) fail("Expected " + __stringify(received) + " to be falsy");
      },
      toBeNull() {
        if (received !== null) fail("Expected " + __stringify(received) + " to be null");
      },
      toBeUndefined() {
        if (received !== undefined) fail("Expected " + __stringify(received) + " to be undefined");
      },
      toBeDefined() {
        if (received === undefined) fail("Expected value to be defined");
      },
      toContain(item) {
        if (!received || !received.includes(item)) fail("Expected " + __stringify(received) + " to contain " + __stringify(item));
      },
      toHaveLength(len) {
        if (!received || received.length !== len) fail("Expected length " + len + ", got " + (received && received.length));
      },
      toBeGreaterThan(n) {
        if (!(received > n)) fail("Expected " + __stringify(received) + " to be greater than " + n);
      },
      toBeLessThan(n) {
        if (!(received < n)) fail("Expected " + __stringify(received) + " to be less than " + n);
      },
      toThrow() {
        let threw = false;
        try {
          received();
        } catch {
          threw = true;
        }
        if (!threw) fail("Expected function to throw");
      },
      not: {
        toBe(expected) {
          if (Object.is(received, expected)) fail("Expected " + __stringify(received) + " not to be " + __stringify(expected));
        },
      },
    };
  };

  global.__printTestResults = function () {
    console.log("__TEST_RESULTS_START__");
    console.log(JSON.stringify(__results));
    console.log("__TEST_RESULTS_END__");
  };
})();
`;
