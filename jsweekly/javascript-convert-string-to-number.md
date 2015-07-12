```js
{
  "title": "JavaScript字符串转换为数字的方法",
  "id": null,
  "author": null,
  "digest": "字符串与数字的转换，包括整数、浮点数以及非十进制数字",
  "tags": ["javascirpt"]
}
```

## 函数转换
parseInt()和parseFloat()分别用来将`数字型字符串`或`数字`转换为整数和浮点数，其他则返回NaN(Not a Number)。
parseInt()支持进制参数，表示以何进制读取字符串，返回结果均为10进制数字。
```
parseInt() => NaN
parseInt(' ') => NaN
parseInt(null) => NaN
parseInt(undefined) => NaN
parseInt(false) => NaN
parseInt(true) => NaN
parseInt(NaN) => NaN
parseInt(Infinity) => NaN
parseInt(1) => 1
parseInt('1') => 1
parseInt(' 1 ') => 1
parseInt('1x') => 1
parseInt(-1.5) => -1
parseInt('-1.5') => -1
parseInt('-1.5x') => -1
parseInt('0xA') => 10
parseInt('0xAx') => 10
parseInt('010') => 10
parseInt('x') => NaN
parseInt({}) => NaN
parseInt(new Date()) => NaN
parseInt('010') => 10 // 注意可能识别为8进制
parseInt('A', 16) => 10 // 以16进制读取，结果为10进制数字10
parseInt("012", 8) => 10 // 以8进制读取，结果为10进制数字10
parseInt('1000', 2) => 8 // 以2进制读取，结果为10进制数字8
```
建议所有转换均加上进制参数。

parseFloat()只能支持以10进制表示的浮点数，并且没有进制参数。
```
parseFloat() => NaN;
parseFloat(' ') => NaN
parseFloat(null) => NaN
parseFloat(undefined) => NaN
parseFloat(false) => NaN
parseFloat(true) => NaN
parseFloat(NaN) => NaN
parseFloat(Infinity) => Infinity
parseFloat(1) => 1
parseFloat('1') => 1
parseFloat(' 1 ') => 1
parseFloat('1x') => 1
parseFloat(-1.5) => -1.5
parseFloat('-1.5') => -1.5
parseFloat('-1.5x') => -1.5
parseFloat('0xA') => 0
parseFloat('0xAx') => 0
parseFloat('010') => 10
parseFloat({}) => NaN
parseFloat('x') => NaN
parseFloat(new Date()) => NaN
```
parseInt()和parseFloat()能识别以数字开头的字符串。

## 强制类型转换
Number()函数用于将任何对象强制转换为数字，不可转换的对象将返回NaN。
```
Number() => 0
Number(' ') => 0
Number(null) => 0
Number(undefined) => NaN
Number(false) => 0
Number(true) => 1
Number(NaN) => NaN
Number(Infinity) => Infinity
Number(1) => 1
Number('1') => 1
Number(' 1 ') => 1
Number('1x') => NaN
Number(-1.5) => -1.5
Number('-1.5') => -1.5
Number('-1.5x') => NaN
Number('0xA') => 10
Number('0xAx') => NaN
Number('010') => 10
Number('x') => NaN
Number({}) => NaN
Number(new Date()) => Date.now()
```

## 弱类型转换
通过算数运算完成类型的自动转换，以下示例与`x-0`和`+x`的结果一致。
```
'' * 1 => 0
' ' * 1 => 0
null * 1 => 0
undefined * 1 => NaN
false * 1 => 0
true * 1 => 1
NaN * 1 => NaN
Infinity * 1 => Infinity
1 * 1 => 1
'1' * 1 => 1
' 1 ' * 1 => 1
'1x' * 1 => NaN
-1.5 * 1 => -1.5
'-1.5' * 1 => -1.5
'-1.5x' * 1 => NaN
'0xA' * 1 => 10
'0xAx' * 1 => NaN
'010' * 1 => 10
'x' * 1 => NaN
{} * 1 => NaN
new Date() * 1 => Date.now()
```

## 位运算
位运算操作只返回整型结果，因此非常适合整型转换并且不需要判断NaN和Infinity的情况。
```
'' >> 0 => 0
' ' >> 0 => 0
null >> 0 => 0
undefined >> 0 => 0
false >> 0 => 0
true >> 0 => 1
NaN >> 0 => 0
Infinity >> 0 => 0
1 >> 0 => 1
'1' >> 0 => 1
' 1 ' >> 0 => 1
'1x' >> 0 => 0
-1.5 >> 0 => -1
'-1.5' >> 0 => -1
'-1.5x' >> 0 => 0
'0xA' >> 0 => 10
'0xAx' >> 0 => 0
'010' >> 0 => 10
'x' >> 0 => 0
{} >> 0 => 0
new Date() >> 0 => -2029...
```
类似的，也可以使用与运算`&0xFFFFFFFFFFFFF`做整型转换。

可以看出，以上几种方法都会自动忽略字符串的首尾空格，且能识别十六进制字符。

对于NaN，可以使用逻辑或来处理，如`NaN || 0 => 0`，不过需要注意Infinity的情况。

几种方法各有利弊，本文也没有考虑性能的问题，在实际应用中需要根据具体需求选择合适的方法。
