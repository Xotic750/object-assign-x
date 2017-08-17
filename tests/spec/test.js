'use strict';

var assign;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  assign = require('../../index.js');
} else {
  assign = returnExports;
}

var supportsGetSet;
try {
  Object.defineProperty({}, 'a', {
    get: function () {
      return 1;
    },
    set: function () {}
  });

  supportsGetSet = true;
} catch (ignore) {}

var ifGetSet = supportsGetSet ? it : xit;

var supportsPreventExtensions;
try {
  if (typeof Object.preventExtensions === 'function') {
    var objTest = {};
    Object.preventExtensions(objTest);
    objTest[0] = 1;
    supportsPreventExtensions = objTest[0] === void 0;
  }
} catch (ignore) {}

var ifExtensionsPreventable = supportsPreventExtensions ? it : xit;

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var ifSymbolsIt = hasSymbols ? it : xit;

describe('assign', function () {
  it('is a function', function () {
    expect(typeof assign).toBe('function');
  });

  it('should throw when target is null or undefined', function () {
    expect(function () {
      assign();
    }).toThrow();

    expect(function () {
      assign(void 0);
    }).toThrow();

    expect(function () {
      assign(null);
    }).toThrow();
  });

  it('returns the modified target object', function () {
    var target = {};
    var returned = assign(target, { a: 1 });
    expect(returned).toEqual(target);
  });

  it('should merge two objects', function () {
    var target = { a: 1 };
    var returned = assign(target, { b: 2 });
    expect(returned).toEqual({ a: 1, b: 2 });
  });

  it('should merge three objects', function () {
    var target = { a: 1 };
    var source1 = { b: 2 };
    var source2 = { c: 3 };
    var returned = assign(target, source1, source2);
    expect(returned).toEqual({
      a: 1, b: 2, c: 3
    });
  });

  it('only iterates over own keys', function () {
    var Foo = function () {};
    Foo.prototype.bar = true;
    var foo = new Foo();
    foo.baz = true;
    var target = { a: 1 };
    var returned = assign(target, foo);
    expect(returned).toEqual(target);
    expect(target).toEqual({ a: 1, baz: true });
  });

  it('coerces lone target to an object', function () {
    var result = {
      bool: assign(true),
      number: assign(1),
      string: assign('1')
    };

    expect(typeof result.bool).toEqual('object');
    expect(Boolean.prototype.valueOf.call(result.bool)).toBe(true);

    expect(typeof result.number).toEqual('object');
    expect(Number.prototype.valueOf.call(result.number)).toBe(1);

    expect(typeof result.string).toEqual('object');
    expect(String.prototype.valueOf.call(result.string)).toBe('1');
  });

  it('coerces target to an object, assigns from sources', function () {
    var sourceA = { a: 1 };
    var sourceB = { b: 1 };

    var result = {
      bool: assign(true, sourceA, sourceB),
      number: assign(1, sourceA, sourceB),
      string: assign('1', sourceA, sourceB)
    };

    expect(typeof result.bool).toBe('object');
    expect(Boolean.prototype.valueOf.call(result.bool)).toBe(true);
    expect(result.bool).toEqual({ a: 1, b: 1 });

    expect(typeof result.number).toBe('object');
    expect(Number.prototype.valueOf.call(result.number)).toBe(1);

    expect(typeof result.string).toBe('object');
    expect(String.prototype.valueOf.call(result.string)).toBe('1');
    var compare = Object.keys(result.string).reduce(function (acc, key) {
      acc[key] = (/\d+/).test(key) ? result.string.charAt(key) : result.string[key];
      return acc;
    }, {});

    expect(compare).toEqual({
      0: '1', a: 1, b: 1
    });
  });

  it('ignores non-object sources', function () {
    expect(assign({ a: 1 }, null, { b: 2 })).toEqual({ a: 1, b: 2 });
    expect(assign({ a: 1 }, undefined, { b: 2 })).toEqual({ a: 1, b: 2 });
    expect(assign({ a: 1 }, { b: 2 }, null)).toEqual({ a: 1, b: 2 });
  });

  ifExtensionsPreventable('does not have pending exceptions', function () {
    // Firefox 37 still has "pending exception" logic in its assign implementation,
    // which is 72% slower than our shim, and Firefox 40's native implementation.
    var thrower = {
      1: 2,
      2: 3,
      3: 4
    };

    var expected = {
      1: 2,
      2: 3,
      3: 4
    };

    Object.preventExtensions(thrower);
    Object.preventExtensions(expected);
    expect(thrower).toEqual(expected);

    var error;
    try {
      assign(thrower, 'wxyz');
    } catch (e) {
      error = e;
    }

    if (thrower[1] === 'x') {
      // IE 9 doesn't throw in strict mode with preventExtensions
      expect(error).toEqual(jasmine.any(RangeError));
    } else {
      expect(error).toEqual(jasmine.any(TypeError));
      expect(thrower).toEqual(expected);
    }
  });

  ifGetSet('works with getters and setters', function () {
    var subject = {
      1: 2,
      2: 3,
      3: 4
    };

    var props = {
      get: function () {
        return 3;
      },
      set: function (v) {
        throw new RangeError('IE 9 does not throw on preventExtensions: ' + v);
      }
    };

    Object.defineProperty(subject, 2, props);

    var expected = {
      1: 2,
      2: 3,
      3: 4
    };

    Object.defineProperty(expected, 2, props);
    expect(subject).toEqual(expected);
    var actual = assign({}, subject);
    expect(actual).toEqual(expected);
  });

  ifSymbolsIt('includes enumerable symbols, after keys', function () {
    var visited = [];
    var obj = {};
    Object.defineProperty(obj, 'a', {
      enumerable: true,
      get: function () {
        visited.push('a');
        return 42;
      }
    });

    var symbol = Symbol('enumerable');
    Object.defineProperty(obj, symbol, {
      enumerable: true,
      get: function () {
        visited.push(symbol);
        return Infinity;
      }
    });

    var nonEnumSymbol = Symbol('non-enumerable');
    Object.defineProperty(obj, nonEnumSymbol, {
      enumerable: false,
      get: function () {
        visited.push(nonEnumSymbol);
        return -Infinity;
      }
    });

    var target = assign({}, obj);
    expect(visited).toEqual(['a', symbol]);
    expect(target.a).toBe(42);
    expect(target[symbol]).toBe(Infinity);
    expect(target[nonEnumSymbol]).not.toBe(-Infinity);
  });
});
