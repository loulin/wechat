```js
{
  "title":"你可能不需要Underscore",
  "id":null,
  "author":null,
  "digest":"许多工具函数完全可以由JavaScript内置函数替代",
  "tags": ["javascript", "library"]
}
```

出自：[https://www.reindex.io/blog/you-might-not-need-underscore/](https://www.reindex.io/blog/you-might-not-need-underscore/)

工具型函数库如[Underscore](http://underscorejs.org/)、[lodash](https://lodash.com/)和[Ramda](http://ramdajs.com/)如今已被广泛使用，但其实很多时候并不需要引入这些工具库。我们来看看都有哪些函数可以直接用原生JavaScript函数替代的。

## 数组(Array)

### 遍历数组
Underscore:
```js
_.each(array, iteratee)
```
ES5.1:
```js
array.forEach(iteratee)
```

### 数组映射(Map)
Underscore:
```js
_.map(array, iteratee)
```
ES5.1:
```js
array.map(iteratee)
```

### 数组元素查找
Underscore:
```js
_.find(array, predicate)
```
ES2015:
```js
array.find(predicate)
```

### 获取数组每个元素的某个属性（返回数组）
Underscore:
```js
_.pluck(array, propertyName)
```
ES2015:
```js
array.map(value => value[propertyName])
```

### 检查数组是否包含某个元素
Underscore:
```js
_.contains(array, element)
```
ES5.1:
```js
array.indexOf(element) !== -1
```
ES2016:
```js
array.includes(element)
```

### 将类数组对象(array-like object)转换为数组
Underscore:
```js
_.toArray(arguments)
```
ES2015:
```js
Array.from(arguments)
```

### 去除数组中的非真元素(falsy values)
Underscore:
```js
_.compact(array)
```
ES2015:
```js
array.filter(x => !!x)
```

### 数组去重
Underscore:
```js
_.uniq(array)
```
ES2015:
```js
[...new Set(array)]
```

### 查找元素在数组中的索引
Underscore:
```js
_.indexOf(array, value)
```
ES5.1:
```js
array.indexOf(value)
```

### 创建从x开始的长度为n的数字序列
Underscore:
```js
_.range(x, x + n)
```
ES2015:
```js
Array.from({ length: n }, (v, k) => k + x)
```

## 对象(Objects)

### 列出所有可枚举的的属性名
Underscore:
```js
_.keys(object)
```
ES5.1:
```js
Object.keys(object)
```

### 列出所有可枚举的的属性名(包含继承的)
Underscore:
```js
_.allKeys(object)
```
ES2015:
```js
Reflect.enumerate(object)  // 返回一个迭代器(Iterator)
```

### 获取所有的值
Underscore:
```js
_.values(object)
```
ES5.1:
```js
Object.keys(object).map(key => object[key])
```

### 根据原型(prototype)创建对象
Underscore:
```js
_.create(proto, propertiesObject)
```
ES5.1:
```js
Object.create(proto, propertiesObject)
```

### 对象扩展(将属性合并到新的对象中)
Underscore:
```js
_.extend({}, source, { a: false })
```
ES2016:
```js
{ ...source, a: false }
```

### 浅复制对象
Underscore:
```js
_.clone(object)
```
ES2016:
```js
{ ...object }
```

### 检测对象是否是数组
Underscore:
```js
_.isArray(object) // 注意typeof [] => object
```
ES5.1:
```js
Array.isArray(object)
```

### 检查对象是否是有限的原始数字
Underscore:
```js
_.isFinite(object)
```
ES2015:
```js
Number.isFinite(object)
```

## 函数(Functions)

### 函数的对象绑定
Underscore:
```js
foo(function () {
  this.bar();
}.bind(this));

foo(_.bind(object.fun, object));
```
ES2015:
```js
foo(() => {
  this.bar();
});

foo(object.fun.bind(object));
```
ES2016:
```js
foo(() => {
  this.bar();
});

foo(::object.fun);
```

## 工具(Utility)

### Identity函数(返回第一个参数)
Underscore:
```js
_.identity
```
ES2015:
```js
value => value
```

### 返回常量的函数
Underscore:
```js
const fun = _.constant(value);
```
ES2015:
```js
const fun = () => value;
```

### 空函数
Underscore:
```js
_.noop()
```
ES2015:
```js
() => {}
```

其中，ES2015即ES6，ES2016即ES7。至于采用工具库还是原生函数，仁者见仁智者见智。原文提到，重构没有抽象过的代码要简单的多，于是当你发现大量重复的代码结构时，你可能才会得到正确的抽象。也就是说，我们没必要过早地抽象，因此不到必要时先不急于引入工具库。不过个人认为，这只是个习惯问题，当loadsh成为居家必备时，它与原生函数也没有太大差别了。
