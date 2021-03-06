<a
  href="https://travis-ci.org/Xotic750/object-assign-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/object-assign-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a
  href="https://david-dm.org/Xotic750/object-assign-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/object-assign-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/object-assign-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/object-assign-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a
  href="https://badge.fury.io/js/object-assign-x"
  title="npm version">
<img src="https://badge.fury.io/js/object-assign-x.svg"
  alt="npm version" height="18">
</a>
<a
  href="https://www.jsdelivr.com/package/npm/object-assign-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/object-assign-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>
<a
  href="https://bettercodehub.com/results/Xotic750/object-assign-x"
  title="bettercodehub score">
<img src="https://bettercodehub.com/edge/badge/Xotic750/object-assign-x?branch=master"
  alt="bettercodehub score" height="18">
</a>
<a
  href="https://coveralls.io/github/Xotic750/object-assign-x?branch=master"
  title="Coverage Status">
<img src="https://coveralls.io/repos/github/Xotic750/object-assign-x/badge.svg?branch=master"
  alt="Coverage Status" height="18">
</a>

<a name="module_object-assign-x"></a>

## object-assign-x

Used to copy the values of all enumerable own properties from one or more source objects to a target object.

<a name="exp_module_object-assign-x--module.exports"></a>

### `module.exports` ⇒ <code>Object</code> ⏏

This method is used to copy the values of all enumerable own properties from
one or more source objects to a target object. It will return the target object.

**Kind**: Exported member  
**Returns**: <code>Object</code> - The target object.  
**Throws**:

- <code>TypeError</code> If target is null or undefined.

| Param       | Type            | Description           |
| ----------- | --------------- | --------------------- |
| target      | <code>\*</code> | The target object.    |
| [...source] | <code>\*</code> | The source object(s). |

**Example**

```js
import assign from 'object-assign-x';

const obj = {a: 1};
const copy = assign({}, obj);
console.log(copy); // { a: 1 }
```
