import attempt from 'attempt-x';
import objectKeys from 'object-keys-x';
import isFunction from 'is-function-x';
import reduce from 'array-reduce-x';
import getOwnPropertyNames from 'get-own-property-names-x';
import isObjectLike from 'is-object-like-x';
import toObject from 'to-object-x';
import slice from 'array-slice-x';
import isNil from 'is-nil-x';
import getOEPS from 'get-own-enumerable-property-symbols-x';
import methodize from 'simple-methodize-x';
var EMPTY_STRING = '';
var StringCtr = EMPTY_STRING.constructor;
var fromCharCode = StringCtr.fromCharCode,
    preventExtensions = StringCtr.preventExtensions;
var split = methodize(EMPTY_STRING.split);
var ObjectCtr = {}.constructor;
var nAssign = ObjectCtr.assign;
var nativeAssign = isFunction(nAssign) && nAssign;
var concat = methodize([].concat);

var workingNativeAssign = function nativeWorks() {
  var obj = {};
  var res = attempt(nativeAssign, obj, {
    0: 1
  }, {
    1: 2
  });
  return res.threw === false && res.value === obj && objectKeys(obj).length === 2 && obj[0] === 1 && obj[1] === 2;
};

var lacksProperEnumerationOrder = function enumOrder() {
  // https://bugs.chromium.org/p/v8/issues/detail?id=4118
  var test1 = toObject('abc');
  test1[5] = 'de';

  if (getOwnPropertyNames(test1)[0] === '5') {
    return true;
  }

  var strNums = '0123456789';

  var iteratee1 = function iteratee1(acc) {
    /* eslint-disable-next-line prefer-rest-params */
    var index = arguments[2];
    acc["_".concat(fromCharCode(index))] = index;
    return acc;
  }; // https://bugs.chromium.org/p/v8/issues/detail?id=3056


  var test2 = reduce(strNums.split(EMPTY_STRING), iteratee1, {});

  var iteratee2 = function iteratee2(acc, name) {
    return acc + test2[name];
  };

  var order = reduce(getOwnPropertyNames(test2), iteratee2, EMPTY_STRING);

  if (order !== strNums) {
    return true;
  } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


  var letters = 'abcdefghijklmnopqrst';

  var iteratee3 = function iteratee3(acc, letter) {
    acc[letter] = letter;
    return acc;
  };

  var test3 = reduce(split(letters, EMPTY_STRING), iteratee3, {});
  var result = attempt(nativeAssign, {}, test3);
  return result.threw === false && objectKeys(result.value).join(EMPTY_STRING) !== letters;
};

var assignHasPendingExceptions = function exceptions() {
  if (isFunction(preventExtensions) === false) {
    return false;
  } // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.


  var result = attempt(preventExtensions, {
    1: 2
  });

  if (result.threw || isObjectLike(result.value) === false) {
    return false;
  }

  var thrower = result.value;
  result = attempt(nativeAssign, thrower, 'xy');
  return result.threw ? thrower[1] === 'y' : false;
};

var shouldImplement = function getShouldImplement() {
  if (nativeAssign === false) {
    return true;
  }

  if (workingNativeAssign() === false) {
    return true;
  }

  if (lacksProperEnumerationOrder()) {
    return true;
  }

  return assignHasPendingExceptions();
}(); // 19.1.3.1


export var implementation = function assign(target) {
  var outerIteratee = function outerIteratee(tgt, source) {
    if (isNil(source)) {
      return tgt;
    }

    var object = toObject(source);

    var innerIteratee = function innerIteratee(tar, key) {
      tar[key] = object[key];
      return tar;
    };

    return reduce(concat(objectKeys(object), getOEPS(object)), innerIteratee, tgt);
  };
  /* eslint-disable-next-line prefer-rest-params */


  return reduce(slice(arguments, 1), outerIteratee, toObject(target));
};
/**
 * This method is used to copy the values of all enumerable own properties from
 * one or more source objects to a target object. It will return the target object.
 *
 * @param {*} target - The target object.
 * @param {*} [...source] - The source object(s).
 * @throws {TypeError} If target is null or undefined.
 * @returns {object} The target object.
 */

var $assign = shouldImplement ? implementation : nativeAssign;
export default $assign;

//# sourceMappingURL=object-assign-x.esm.js.map