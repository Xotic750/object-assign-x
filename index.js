/**
 * @file Used to copy the values of all enumerable own properties from one or more source objects to a target object.
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-assign-x
 */

'use strict';

var objectKeys = require('object-keys-x');
var isFunction = require('is-function-x');
var reduce = require('array-reduce-x');
var nativeAssign = isFunction(Object.assign) && Object.assign;

var workingNativeAssign = function _nativeWorks() {
  try {
    var obj = {};
    var result = nativeAssign(obj, { 0: 1 }, { 1: 2 });
    if (result !== obj || objectKeys(obj).length !== 2 || obj[0] !== 1 || obj[1] !== 2) {
      return false;
    }
  } catch (ignore) {
    return false;
  }

  return true;
};

// eslint-disable-next-line id-length
var lacksProperEnumerationOrder = function _enumOrder() {
  if (isFunction(Object.getOwnPropertyNames)) {
    try {
      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = Object('abc');
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return true;
      }

      var strNums = '0123456789';
      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = reduce(strNums.split(''), function (acc, ignore, index) {
        acc['_' + String.fromCharCode(index)] = index;
        return acc;
      }, {});

      var names = Object.getOwnPropertyNames(test2);
      var order = reduce(names, function (acc, name) {
        return acc + test2[name];
      }, '');

      if (order !== strNums) {
        return true;
      }
    } catch (ignore) {}
  }

  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  var letters = 'abcdefghijklmnopqrst';
  var test3 = reduce(letters.split(''), function (acc, letter) {
    acc[letter] = letter;
    return acc;
  }, {});

  if (objectKeys(Object.assign({}, test3)).join('') !== letters) {
    return true;
  }

  return false;
};

// eslint-disable-next-line id-length
var assignHasPendingExceptions = function _exceptions() {
  if (isFunction(Object.preventExtensions) === false) {
    return false;
  }

  // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.
  var thrower;
  try {
    thrower = Object.preventExtensions({ 1: 2 });
  } catch (ignore) {
    return false;
  }

  try {
    Object.assign(thrower, 'xy');
  } catch (ignore) {
    return thrower[1] === 'y';
  }

  return false;
};

var shouldImplement = (function () {
  if (nativeAssign === false) {
    return true;
  }

  if (workingNativeAssign() === false) {
    return true;
  }

  if (lacksProperEnumerationOrder()) {
    return true;
  }

  if (assignHasPendingExceptions()) {
    return true;
  }

  return false;
}());

var $assign;
if (shouldImplement) {
  var toObject = require('to-object-x');
  var slice = require('array-slice-x');
  var filter = require('array-filter-x');
  var isArray = require('is-array-x');
  var isNil = require('is-nil-x');
  var getOPS = isFunction(Object.getOwnPropertySymbols) && Object.getOwnPropertySymbols;
  var isEnumerable;
  var hasWorkingGOPS = (function () {
    try {
      if (isArray(Object.getOwnPropertySymbols({}))) {
        isEnumerable = Object.prototype.propertyIsEnumerable;
        return true;
      }
    } catch (ignore) {}
    return false;
  }());

  var assignTo = function _assignTo(source) {
    return function assignToSource(target, key) {
      target[key] = source[key];
      return target;
    };
  };

  var assignReducer = function _assignReducer(target, source) {
    if (isNil(source)) {
      return target;
    }

    var object = Object(source);
    var sourceKeys = objectKeys(object);
    if (hasWorkingGOPS) {
      var symbols = filter(getOPS(object), function _filter(symbol) {
        return isEnumerable.call(object, symbol);
      });

      sourceKeys = sourceKeys.concat(symbols);
    }

    return reduce(sourceKeys, assignTo(object), target);
  };

  // 19.1.3.1
  $assign = function assign(target) {
    var to = toObject(target);
    return reduce(slice(arguments, 1), assignReducer, to);
  };
} else {
  $assign = nativeAssign;
}

/**
 * This method is used to copy the values of all enumerable own properties from
 * one or more source objects to a target object. It will return the target object.
 *
 * @param {*} target - The target object.
 * @param {*} [...source] - The source object(s).
 * @throws {TypeError} If target is null or undefined.
 * @returns {Object} The target object.
 * @example
 * var assign = require('object-assign-x');
 *
 * var obj = { a: 1 };
 * var copy = assign({}, obj);
 * console.log(copy); // { a: 1 }
 */
module.exports = $assign;
