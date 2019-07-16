import attempt from 'attempt-x';

import objectKeys from 'object-keys-x';
import isFunction from 'is-function-x';
import reduce from 'array-reduce-x';
import getOwnPropertyNames from 'get-own-property-names-x';
import isObjectLike from 'is-object-like-x';

const nativeAssign = isFunction(Object.assign) && Object.assign;

const workingNativeAssign = function _nativeWorks() {
  const obj = {};
  const res = attempt(nativeAssign, obj, {0: 1}, {1: 2});

  return res.threw === false && res.value === obj && objectKeys(obj).length === 2 && obj[0] === 1 && obj[1] === 2;
};

// eslint-disable-next-line id-length
const lacksProperEnumerationOrder = function _enumOrder() {
  // https://bugs.chromium.org/p/v8/issues/detail?id=4118
  const test1 = Object('abc');
  test1[5] = 'de';

  if (getOwnPropertyNames(test1)[0] === '5') {
    return true;
  }

  const strNums = '0123456789';
  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  const test2 = reduce(
    strNums.split(''),
    function(acc, ignore, index) {
      acc[`_${String.fromCharCode(index)}`] = index;

      return acc;
    },
    {},
  );

  const order = reduce(
    getOwnPropertyNames(test2),
    function(acc, name) {
      return acc + test2[name];
    },
    '',
  );

  if (order !== strNums) {
    return true;
  }

  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  const letters = 'abcdefghijklmnopqrst';
  const test3 = reduce(
    letters.split(''),
    function(acc, letter) {
      acc[letter] = letter;

      return acc;
    },
    {},
  );

  const result = attempt(nativeAssign, {}, test3);

  return result.threw === false && objectKeys(result.value).join('') !== letters;
};

// eslint-disable-next-line id-length
const assignHasPendingExceptions = function _exceptions() {
  if (isFunction(Object.preventExtensions) === false) {
    return false;
  }

  // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.
  let result = attempt(Object.preventExtensions, {1: 2});

  if (result.threw || isObjectLike(result.value) === false) {
    return false;
  }

  const thrower = result.value;
  result = attempt(nativeAssign, thrower, 'xy');

  return result.threw ? thrower[1] === 'y' : false;
};

const shouldImplement = (function() {
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
})();

let $assign;

if (shouldImplement) {
  const toObject = require('to-object-x');
  const slice = require('array-slice-x');
  const isNil = require('is-nil-x');
  const getOEPS = require('get-own-enumerable-property-symbols-x');
  const {concat} = Array.prototype;

  // 19.1.3.1
  $assign = function assign(target) {
    return reduce(
      slice(arguments, 1),
      function _assignSources(tgt, source) {
        if (isNil(source)) {
          return tgt;
        }

        const object = Object(source);

        return reduce(
          concat.call(objectKeys(object), getOEPS(object)),
          function _assignTo(tar, key) {
            tar[key] = object[key];

            return tar;
          },
          tgt,
        );
      },
      toObject(target),
    );
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
 * @returns {object} The target object.
 */
export default $assign;
