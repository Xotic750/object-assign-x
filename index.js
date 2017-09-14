/**
 * @file Used to copy the values of all enumerable own properties from one or more source objects to a target object.
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-assign-x
 */

'use strict';

var attempt = require('attempt-x');
var objectKeys = require('object-keys-x');
var isFunction = require('is-function-x');
var reduce = require('array-reduce-x');
var getOwnPropertyNames = require('get-own-property-names-x');
var isObjectLike = require('is-object-like-x');
var nativeAssign = isFunction(Object.assign) && Object.assign;

var workingNativeAssign = function _nativeWorks() {
  var obj = {};
  var res = attempt(nativeAssign, obj, { 0: 1 }, { 1: 2 });
  return res.threw === false && res.value === obj && objectKeys(obj).length === 2 && obj[0] === 1 && obj[1] === 2;
};

// eslint-disable-next-line id-length
var lacksProperEnumerationOrder = function _enumOrder() {
  // https://bugs.chromium.org/p/v8/issues/detail?id=4118
  var test1 = Object('abc');
  test1[5] = 'de';
  if (getOwnPropertyNames(test1)[0] === '5') {
    return true;
  }

  var strNums = '0123456789';
  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  var test2 = reduce(strNums.split(''), function (acc, ignore, index) {
    acc['_' + String.fromCharCode(index)] = index;
    return acc;
  }, {});

  var order = reduce(getOwnPropertyNames(test2), function (acc, name) {
    return acc + test2[name];
  }, '');

  if (order !== strNums) {
    return true;
  }

  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  var letters = 'abcdefghijklmnopqrst';
  var test3 = reduce(letters.split(''), function (acc, letter) {
    acc[letter] = letter;
    return acc;
  }, {});

  var result = attempt(nativeAssign, {}, test3);
  return result.threw === false && objectKeys(result.value).join('') !== letters;
};

// eslint-disable-next-line id-length
var assignHasPendingExceptions = function _exceptions() {
  if (isFunction(Object.preventExtensions) === false) {
    return false;
  }

  // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.
  var result = attempt(Object.preventExtensions, { 1: 2 });
  if (result.threw || isObjectLike(result.value) === false) {
    return false;
  }

  var thrower = result.value;
  result = attempt(nativeAssign, thrower, 'xy');
  return result.threw ? thrower[1] === 'y' : false;
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
  var isNil = require('is-nil-x');
  var getOEPS = require('get-own-enumerable-property-symbols-x');
  var concat = Array.prototype.concat;

  // 19.1.3.1
  $assign = function assign(target) {
    return reduce(slice(arguments, 1), function _assignSources(tgt, source) {
      if (isNil(source)) {
        return tgt;
      }

      var object = Object(source);
      return reduce(concat.call(objectKeys(object), getOEPS(object)), function _assignTo(tar, key) {
        tar[key] = object[key];
        return tar;
      }, tgt);
    }, toObject(target));
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
