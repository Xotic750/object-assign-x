<a href="https://travis-ci.org/Xotic750/object-assign-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/object-assign-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/object-assign-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/object-assign-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/object-assign-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/object-assign-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/object-assign-x" title="npm version">
<img src="https://badge.fury.io/js/object-assign-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_object-assign-x"></a>

## object-assign-x
Used to copy the values of all enumerable own properties from one or more source objects to a target object.

**Version**: 1.1.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_object-assign-x--module.exports"></a>

### `module.exports` ⇒ <code>Object</code> ⏏
This method is used to copy the values of all enumerable own properties from
one or more source objects to a target object. It will return the target object.

**Kind**: Exported member  
**Returns**: <code>Object</code> - The target object.  
**Throws**:

- <code>TypeError</code> If target is null or undefined.


| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> | The target object. |
| [...source] | <code>\*</code> | The source object(s). |

**Example**  
```js
var assign = require('object-assign-x');

var obj = { a: 1 };
var copy = assign({}, obj);
console.log(copy); // { a: 1 }
```
