function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

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
var EMPTY_STRING = '';
var StringCtr = EMPTY_STRING.constructor;
var fromCharCode = StringCtr.fromCharCode;
var ObjectCtr = {}.constructor;
var nAssign = ObjectCtr.assign;
var nativeAssign = isFunction(nAssign) && nAssign;

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
  var _this = this;

  // https://bugs.chromium.org/p/v8/issues/detail?id=4118
  var test1 = toObject('abc');
  test1[5] = 'de';

  if (getOwnPropertyNames(test1)[0] === '5') {
    return true;
  }

  var strNums = '0123456789'; // https://bugs.chromium.org/p/v8/issues/detail?id=3056

  var test2 = reduce(strNums.split(EMPTY_STRING), function (acc, ignore, index) {
    _newArrowCheck(this, _this);

    acc["_".concat(fromCharCode(index))] = index;
    return acc;
  }.bind(this), {});
  var order = reduce(getOwnPropertyNames(test2), function (acc, name) {
    _newArrowCheck(this, _this);

    return acc + test2[name];
  }.bind(this), EMPTY_STRING);

  if (order !== strNums) {
    return true;
  } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


  var letters = 'abcdefghijklmnopqrst';
  var test3 = reduce(letters.split(EMPTY_STRING), function (acc, letter) {
    _newArrowCheck(this, _this);

    acc[letter] = letter;
    return acc;
  }.bind(this), {});
  var result = attempt(nativeAssign, {}, test3);
  return result.threw === false && objectKeys(result.value).join(EMPTY_STRING) !== letters;
};

var assignHasPendingExceptions = function exceptions() {
  if (isFunction(ObjectCtr.preventExtensions) === false) {
    return false;
  } // Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  // which is 72% slower than our shim, and Firefox 40's native implementation.


  var result = attempt(ObjectCtr.preventExtensions, {
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
}();
/**
 * This method is used to copy the values of all enumerable own properties from
 * one or more source objects to a target object. It will return the target object.
 *
 * @param {*} target - The target object.
 * @param {*} [...source] - The source object(s).
 * @throws {TypeError} If target is null or undefined.
 * @returns {object} The target object.
 */


var $assign;

if (shouldImplement) {
  var concat = [].concat; // 19.1.3.1

  $assign = function assign(target) {
    var _this2 = this;

    return reduce(
    /* eslint-disable-next-line prefer-rest-params */
    slice(arguments, 1), function (tgt, source) {
      var _this3 = this;

      _newArrowCheck(this, _this2);

      if (isNil(source)) {
        return tgt;
      }

      var object = toObject(source);
      return reduce(concat.call(objectKeys(object), getOEPS(object)), function (tar, key) {
        _newArrowCheck(this, _this3);

        tar[key] = object[key];
        return tar;
      }.bind(this), tgt);
    }.bind(this), toObject(target));
  };
} else {
  $assign = nativeAssign;
}

var assign = $assign;
export default assign;

//# sourceMappingURL=object-assign-x.esm.js.map