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

const EMPTY_STRING = '';
const StringCtr = EMPTY_STRING.constructor;
const {fromCharCode} = StringCtr;
const ObjectCtr = {}.constructor;
const nAssign = ObjectCtr.assign;
const nativeAssign = isFunction(nAssign) && nAssign;

const workingNativeAssign = function nativeWorks() {
  const obj = {};
  const res = attempt(nativeAssign, obj, {0: 1}, {1: 2});

  return res.threw === false && res.value === obj && objectKeys(obj).length === 2 && obj[0] === 1 && obj[1] === 2;
};

const lacksProperEnumerationOrder = function enumOrder() {
  // https://bugs.chromium.org/p/v8/issues/detail?id=4118
  const test1 = toObject('abc');
  test1[5] = 'de';

  if (getOwnPropertyNames(test1)[0] === '5') {
    return true;
  }

  const strNums = '0123456789';
  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  const test2 = reduce(
    strNums.split(EMPTY_STRING),
    (acc, ignore, index) => {
      acc[`_${fromCharCode(index)}`] = index;

      return acc;
    },
    {},
  );

  const order = reduce(
    getOwnPropertyNames(test2),
    (acc, name) => {
      return acc + test2[name];
    },
    EMPTY_STRING,
  );

  if (order !== strNums) {
    return true;
  }

  // https://bugs.chromium.org/p/v8/issues/detail?id=3056
  const letters = 'abcdefghijklmnopqrst';
  const test3 = reduce(
    letters.split(EMPTY_STRING),
    (acc, letter) => {
      acc[letter] = letter;

      return acc;
    },
    {},
  );

  const result = attempt(nativeAssign, {}, test3);

  return result.threw === false && objectKeys(result.value).join(EMPTY_STRING) !== letters;
};

const assignHasPendingExceptions = function exceptions() {
  if (isFunction(ObjectCtr.preventExtensions) === false) {
    return false;
  }

  // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.
  let result = attempt(ObjectCtr.preventExtensions, {1: 2});

  if (result.threw || isObjectLike(result.value) === false) {
    return false;
  }

  const thrower = result.value;
  result = attempt(nativeAssign, thrower, 'xy');

  return result.threw ? thrower[1] === 'y' : false;
};

const shouldImplement = (function getShouldImplement() {
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
})();

/**
 * This method is used to copy the values of all enumerable own properties from
 * one or more source objects to a target object. It will return the target object.
 *
 * @param {*} target - The target object.
 * @param {*} [...source] - The source object(s).
 * @throws {TypeError} If target is null or undefined.
 * @returns {object} The target object.
 */
let $assign;

if (shouldImplement) {
  const {concat} = [];

  // 19.1.3.1
  $assign = function assign(target) {
    return reduce(
      /* eslint-disable-next-line prefer-rest-params */
      slice(arguments, 1),
      (tgt, source) => {
        if (isNil(source)) {
          return tgt;
        }

        const object = toObject(source);

        return reduce(
          concat.call(objectKeys(object), getOEPS(object)),
          (tar, key) => {
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

const assign = $assign;

export default assign;
