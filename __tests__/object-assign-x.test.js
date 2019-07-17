import assign from '../src/object-assign-x';

let supportsGetSet;
try {
  Object.defineProperty({}, 'a', {
    get() {
      return 1;
    },
    set() {},
  });

  supportsGetSet = true;
} catch (ignore) {
  // empty
}

const ifGetSet = supportsGetSet ? it : xit;

let supportsPreventExtensions;
try {
  if (typeof Object.preventExtensions === 'function') {
    const objTest = {};
    Object.preventExtensions(objTest);
    objTest[0] = 1;
    supportsPreventExtensions = objTest[0] === void 0;
  }
} catch (ignore) {
  // empty
}

const ifExtensionsPreventable = supportsPreventExtensions ? it : xit;

const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const ifSymbolsIt = hasSymbols ? it : xit;

describe('assign', function() {
  it('is a function', function() {
    expect.assertions(1);
    expect(typeof assign).toBe('function');
  });

  it('should throw when target is null or undefined', function() {
    expect.assertions(3);
    expect(function() {
      assign();
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      assign(void 0);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      assign(null);
    }).toThrowErrorMatchingSnapshot();
  });

  it('returns the modified target object', function() {
    expect.assertions(1);
    const target = {};
    const returned = assign(target, {a: 1});
    expect(returned).toStrictEqual(target);
  });

  it('should merge two objects', function() {
    expect.assertions(1);
    const target = {a: 1};
    const returned = assign(target, {b: 2});
    expect(returned).toStrictEqual({a: 1, b: 2});
  });

  it('should merge three objects', function() {
    expect.assertions(1);
    const target = {a: 1};
    const source1 = {b: 2};
    const source2 = {c: 3};
    const returned = assign(target, source1, source2);
    expect(returned).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('only iterates over own keys', function() {
    expect.assertions(2);
    const Foo = function() {};

    Foo.prototype.bar = true;
    const foo = new Foo();
    foo.baz = true;
    const target = {a: 1};
    const returned = assign(target, foo);
    expect(returned).toStrictEqual(target);
    expect(target).toStrictEqual({a: 1, baz: true});
  });

  it('coerces lone target to an object', function() {
    expect.assertions(6);
    const result = {
      bool: assign(true),
      number: assign(1),
      string: assign('1'),
    };

    expect(typeof result.bool).toStrictEqual('object');
    expect(Boolean.prototype.valueOf.call(result.bool)).toBe(true);

    expect(typeof result.number).toStrictEqual('object');
    expect(Number.prototype.valueOf.call(result.number)).toBe(1);

    expect(typeof result.string).toStrictEqual('object');
    expect(String.prototype.valueOf.call(result.string)).toBe('1');
  });

  it('coerces target to an object, assigns from sources', function() {
    expect.assertions(8);
    const sourceA = {a: 1};
    const sourceB = {b: 1};

    const result = {
      bool: assign(true, sourceA, sourceB),
      number: assign(1, sourceA, sourceB),
      string: assign('1', sourceA, sourceB),
    };

    expect(typeof result.bool).toBe('object');
    expect(Boolean.prototype.valueOf.call(result.bool)).toBe(true);
    const bool = Object(true);
    bool.a = 1;
    bool.b = 1;
    expect(result.bool).toStrictEqual(bool);

    expect(typeof result.number).toBe('object');
    expect(Number.prototype.valueOf.call(result.number)).toBe(1);

    expect(typeof result.string).toBe('object');
    expect(String.prototype.valueOf.call(result.string)).toBe('1');
    const compare = Object.keys(result.string).reduce(function(acc, key) {
      acc[key] = /\d+/.test(key) ? result.string.charAt(key) : result.string[key];

      return acc;
    }, {});

    expect(compare).toStrictEqual({
      0: '1',
      a: 1,
      b: 1,
    });
  });

  it('ignores non-object sources', function() {
    expect.assertions(3);
    expect(assign({a: 1}, null, {b: 2})).toStrictEqual({a: 1, b: 2});
    expect(assign({a: 1}, undefined, {b: 2})).toStrictEqual({a: 1, b: 2});
    expect(assign({a: 1}, {b: 2}, null)).toStrictEqual({a: 1, b: 2});
  });

  ifExtensionsPreventable('does not have pending exceptions', function() {
    // Firefox 37 still has "pending exception" logic in its assign implementation,
    // which is 72% slower than our shim, and Firefox 40's native implementation.
    const thrower = {
      1: 2,
      2: 3,
      3: 4,
    };

    const expected = {
      1: 2,
      2: 3,
      3: 4,
    };

    Object.preventExtensions(thrower);
    Object.preventExtensions(expected);
    expect(thrower).toStrictEqual(expected);

    let error;
    try {
      assign(thrower, 'wxyz');
    } catch (e) {
      error = e;
    }

    if (thrower[1] === 'x') {
      // IE 9 doesn't throw in strict mode with preventExtensions
      expect(error).toStrictEqual(jasmine.any(RangeError));
    } else {
      expect(error).toStrictEqual(jasmine.any(TypeError));
      expect(thrower).toStrictEqual(expected);
    }
  });

  ifGetSet('works with getters and setters', function() {
    const subject = {
      1: 2,
      2: 3,
      3: 4,
    };

    const props = {
      get() {
        return 3;
      },
      set(v) {
        throw new RangeError(`IE 9 does not throw on preventExtensions: ${v}`);
      },
    };

    Object.defineProperty(subject, 2, props);

    const expected = {
      1: 2,
      2: 3,
      3: 4,
    };

    Object.defineProperty(expected, 2, props);
    expect(subject).toStrictEqual(expected);
    const actual = assign({}, subject);
    expect(actual).toStrictEqual(expected);
  });

  ifSymbolsIt('includes enumerable symbols, after keys', function() {
    const visited = [];
    const obj = {};
    Object.defineProperty(obj, 'a', {
      enumerable: true,
      get() {
        visited.push('a');

        return 42;
      },
    });

    const symbol = Symbol('enumerable');
    Object.defineProperty(obj, symbol, {
      enumerable: true,
      get() {
        visited.push(symbol);

        return Infinity;
      },
    });

    const nonEnumSymbol = Symbol('non-enumerable');
    Object.defineProperty(obj, nonEnumSymbol, {
      enumerable: false,
      get() {
        visited.push(nonEnumSymbol);

        return -Infinity;
      },
    });

    const target = assign({}, obj);
    expect(visited).toStrictEqual(['a', symbol]);
    expect(target.a).toBe(42);
    expect(target[symbol]).toBe(Infinity);
    expect(target[nonEnumSymbol]).not.toBe(-Infinity);
  });
});
