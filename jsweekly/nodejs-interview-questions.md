```js
{
  "title": "Node.js面试问答",
  "id": null,
  "author": "Gergely Nemeth",
  "digest": "常用的Node.js面试问答题，需要的朋友可以拿去参考",
  "tags": ["nodejs"]
}
```

出自：[http://blog.risingstack.com/node-js-interview-questions](http://blog.risingstack.com/node-js-interview-questions)

本文对于招聘者和求职者均适用，作为招聘者，自己要先知道答案哦。

郑重说明三点：
1. 以下罗列的只是一些基础问题，判断面试者的能力绝不依赖于这些问题，但是可以帮你了解面试者的大概水平。
2. 解决实际的问题更能体现一个人的知识面，在国外有些公司喜欢通过结对编程来考核。
3. 最最重要的是，面试的过程千万不要太死板，想办法让它变得有趣和受欢迎。

### 常用的Node.js面试题

* 什么是错误优先的回调(error-first callback)？
* 怎样避免回调嵌套(callback hells)？
* 怎样让Node监听在80端口？
* 什么是事件循环(event loop)？
* 有哪些工具可以用来确保代码的一致性？
* 运行时错误和编程错误的区别是什么？
* 为什么要使用npm shrinkwrap？
* 什么是stub? 举个栗子。
* 什么是测试金字塔(test pyramid)？请举例说明当我们在实现HTTP APIs时该如何测试。
* 你最喜欢的HTTP框架是什么？为什么？

下面是我们最喜欢的参考答案！

### 什么是错误优先的回调(error-first callback)？

错误优先的回调用于传递错误和返回数据。回调函数的第一个参数总是error参数，这样便于检查是否有错误发生。其他参数用于返回数据，通常是在没有错误的情况下才会有数据返回，否则一般不传或传递null。
```js
fs.readFile(filePath, function(err, data) {  
  if (err) {
    //handle the error
  }
  // use the data object
});
```
该问题考察了Node中异步操作的基本知识。

### 怎样避免回调嵌套(callback hells)？

通常有以下选择:
* 模块化：将回调函数封装为独立的函数
* 使用Promises
* 结合使用Generators/Promises和yield

这个问题的回答要看面试者的知识面了，知道用ES6、ES7的至少跟得上潮流，会用async或promise的可以进一步考察细节。

### 怎样让Node监听在80端口？

这可不是一道简单的代码题。要知道在类Unix系统是需要超级用户权限才能运行在80端口的，而且也不推荐监听在80端口。然而我们可以让Node监听在其他端口，比如默认的2368，然后前置Nginx反向代理。

这个问题需要面试者有一点服务器架构的经验了，算是可以区别出初学者。

### 什么是事件循环(event loop)？

TL;DR: (太长别看/Too Long Don't Read)
从开发者的角度来讲，Node.js是单线程运行的，虽然实际上Node.js通过libuv产生了很多线程。
每一个IO都会注册一个回调，一旦IO完成，这些回调就会被放入event loop中等待执行。求职者可以看看这个视频（不会翻墙不予录用）：https://www.youtube.com/embed/8aGhZQkoFbQ

能把这个问题解释清楚的肯定是大牛了，能真听懂的也不赖😄。

### 有哪些工具可以用来确保代码的一致性？

这里有几个方面，包括一致的编码风格和代码的质量约束。相关的工具有：
* JSLint - by Douglas Crockford
* JSHint
* ESLint
* JSCS
熟练使用这些工具将大大提升开发效率，尤其是一致的编码风格和静态错误分析。通常IDE都有相关的插件，并且项目自动化工具如grunt和gulp也都提供了相应的组件集成。

在大型JavaScript项目中这些都是必不可少的工具，使用的熟练程度也可以反映出面试者的开发经验。

### 运行时错误和编程错误的区别是什么？

运行时错误不是bug，比如请求超时或者硬件错误。编程错误通常就是bug了。

压根就不是Node的问题，不过能把问题说清楚就已经算是回答问题了。

### 为什么要使用npm shrinkwrap？

shrinkwrap用来锁住依赖库的版本，这样你就可以控制package安装时所依赖的版本了。 - npmjs.com

这个命令在部署Node.js程序时非常有用，你不用担心生产环境下依赖库的版本与开发时不一致而导致的莫名其妙的bug。

这个问题涉及到Node.js的最佳实践，考察了面试者的经验丰富程度。

### 什么是stub? 举个栗子。

Stubs是用来模拟组件或模块行为的函数。在创建测试的时候，Stubs可以直接Mock函数返回而不需要实际调用所引用模块的方法，而且还可以断言(assert)被Mock的函数是否被调用。比如模拟网络请求和文件读写。
```js
var fs = require('fs');

var readFileStub = sinon.stub(fs, 'readFile', function (path, cb) {  
  return cb(null, 'filecontent'); // 不用真的读取文件
});

expect(readFileStub).to.be.called;
readFileStub.restore();
```
这个问题考察了面试者的测试知识。如果面试者不知道什么是stubs，可以问一问他是如何做单元测试(unit test)的。

### 什么是测试金字塔(test pyramid)？请举例说明当我们在实现HTTP APIs时该如何测试。

测试金字塔描述的是分层测试的思想，包括从低级别的单元测试(unit tests)到高级别的端到端测试(end-to-end tests)。

当谈到HTTP APIs时，测试可分为以下几个层次：
* 单元测试(unit tests) - 测试单个模型的基本功能
* 集成测试(integration test) - 测试模型之间的交互
* 接受测试(acceptance tests) - 测试实际的HTTP API请求

每一层测试都有多种工具可用，面试者如果能更深入地阐述测试原则和方法，将会为面试大大加分。

### 你最喜欢的HTTP框架是什么？为什么？

没有标准答案，面试者自由发挥，最重要的是对自己所使用的框架有多深的理解，最好能说出与其他框架相比有什么优势与劣势。

面试题通常都不是招聘到合适人才的最佳方法，如果能一起解决实际的问题，在此过程中发现对方的思维模式和协作能力，将是一种更好的方式。实际上，越来越多的公司通过github出题，邀请受试者按照要求给出解决方案并提交代码，真是代码面前无秘密呀！
