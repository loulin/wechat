```js
{
  "title": "NPM脚本的正确打开方式",
  "id": null,
  "author": "K.Adam White",
  "digest": "妙用NPM脚本，一键完成编译部署和安装",
  "tags": ["javascirpt", "tutorial"]
}
```
出自：[https://bocoup.com/weblog/a-facade-for-tooling-with-npm-scripts](https://bocoup.com/weblog/a-facade-for-tooling-with-npm-scripts)

回想一下某个项目的初始化过程：
```shell
$ npm install -g grunt-cli
$ npm install -g bower
$ npm install
$ bower install
$ grunt build
```

想跑起来，这些命令往往一个都不能漏掉，比如在npm install之后，虽然已经安装了grunt，但是如果忘记全局安装grunt，就会出现以下错误：
```shell
$ grunt --version
-bash: /usr/local/bin/grunt: No such file or directory
```

然后又得回来全局安装一下，是不是很繁琐？当然如果已经全局安装了，这也不是事儿。不过实际的经验是，当你在配置新的环境比如使用nvm切换node版本时，你会发现这些全局安装又得重来一遍。

`npm run-script`或`npm run`命令用来运行自定义的npm脚本。脚本定义在package.json的scripts对象中，比如：
```js
{
  "name": "express",
  "version": "0.0.1",
  "scripts": {
    "start": "node ./bin/www",
    "test": "mocha test/"
  },
  "devDependencies": {
    "mocha": "^2.2.5",
    "grunt": "^0.4.5",
    "grunt-cli": "^0.1.13"
  }
}
```

于是执行`npm run start`就会启动`node ./bin/www`，执行`npm run test`就会运行`mocha test/`。npm会自动将`node_modules/.bin`添加到PATH环境变量中，因此不需要在scripts中加入命令的相对路径，比如`./node_modules/.bin/mocha test/`。使用`npm run`命令可以列出当前所有npm脚本，例如：
```
$ npm run
Available scripts in the jsweekly package:  
  start
     node ./bin/www
  test
    mocha test/
```

有了npm脚本，在很多情况下我们就没必要全局安装grunt、gulp或mocha等工具了。所以，如果我们配置好了npm脚本：
```js
"scripts": {
  "grunt": "grunt"
}
```

再通过npm执行，就会发现不需要全局安装grunt就能正确运行：
```shell
$ npm run grunt -- --version
> grunt --version

grunt-cli v0.1.13
grunt v0.4.5
```
其中`--`用来向内部命令传递参数。

那么前述命令如何简化呢？下面我们就要用上npm的钩子了。npm支持在每个脚本名前面加上pre或post前缀，表示在该脚本运行之前或之后执行的脚本。比如：
```js
"scripts": {
  "prelint": "echo 'before lint'",
  "lint": "jshint **.js",
  "postlint": "echo 'after lint'"
}
```
于是在执行`npm run lint`时会先执行`prelint`，然后在`lint`执行之后运行`postlint`。（注：prepre是不行的，会被npm忽略）

这样，上述项目初始化过程就可以通过以下脚本简化：
```js
"scripts": {
  "postinstall": "bower install",
  "build": "grunt build"
}
```
因此，只需要执行
```shell
$ npm install // 完成之后自动bower install
$ npm build // 执行./node_modules/.bin/grunt build
```

一个很好的例子是[jquery](https://github.com/jquery/jquery#how-to-build-your-own-jquery):
```js
"scripts": {
  "build": "npm install && grunt",
  "start": "grunt watch",
  "test": "grunt && grunt test"
}
```

npm提供几个常用的快捷方式：`npm test` = `npm run test`, `npm start` = `npm run start`, `npm stop` = `npm run stop`。

此外，使用`npm test`而不是`grunt test`的另一个好处是提供约定统一的test命令，尤其是某些CI系统(如Travis CI)会使用`npm test`作为默认的测试脚本运行，而不需要知道具体的测试框架。