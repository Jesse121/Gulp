##1.安装准备
####1.1 Node.js安装
在安装Gulp之前首先的安装Node.js,
安装教程详见[Node.js 安装配置](http://www.runoob.com/nodejs/nodejs-install-setup.html)
####1.2 npm安装
在安装node的时候会自动安装npm模块管理器，详见[npm模块管理器](http://javascript.ruanyifeng.com/nodejs/npm.html)

win+r输入cmd打开命令终端

* `node -v`查看所安装的node的版本号
* `npm -v`查看所安装的npm的版本号

用win系统终端命令进入项目根目录

1. d:  进入d盘
2. dir d盘下文件列表
3. cd www  进入www文件夹,直至根目录
4. cd ..  退回上一级文件夹

##2. 安装Gulp
####2.1 全局安装
在全局安装gulp`npm install gulp -g `
####2.2 新建package.json文件
npm init 配置package.json文件
####2.3 本地安装
进入项目根目录再安装一遍`npm install gulp --save-dev `  
npm从3.0.0开始，架包的依赖不再安装在每个架包的node_modules文件夹内，而是安装在顶层的node_modules文件夹中。所以安装的时候会生成许多文件包，如果要启用之前的风格，则可以添加命令参数legacy-bundling，如下：
`npm install gulp --save-dev --legacy-bundling ` 

##3. 安装插件
我们将要使用Gulp插件来完成以下任务：

* less的编译（gulp-less）
* sass的编译（gulp-ruby-sass）
* 压缩js代码（gulp-uglify）
* 压缩css（gulp-minify-css）
* 压缩html（gulp-minify-html）
* 压缩图片（gulp-imagemin）
* 图片缓存（gulp-cache）
* 文件重命名（gulp-rename）
* 浏览器实时刷新（gulp-connect）
* 更改提醒（gulp-notify）
* 清除文件（del）

安装以上插件

```npm install gulp-less gulp-ruby-sass gulp-connect gulp-uglify gulp-minify-css gulp-minify-html gulp-imagemin gulp-cache gulp-rename gulp-notify  del --save-dev --legacy-bundling
```
安装完成后可通过'gulp ls --depth=0'命令查看是否安装成功  
如果不需要某个插件可通过'gulp uninstall <插件名称> --save-dev'进行删除

##4. 新建gulpfile.js文件
说明：gulpfile.js是gulp项目的配置文件，是位于项目根目录的普通js文件
```javascript
//导入工具包 require('node_modules里对应模块')
var gulp      = require('gulp');                    //本地安装gulp所用到的地方
var less      = require('gulp-less');               // 获取 gulp-less 模块（用于编译Less）
var jsmin     = require('gulp-uglify');             //JS文件压缩 
var cssmin    = require('gulp-minify-css');         //css文件压缩
var htmlmin   = require('gulp-minify-html');        //html文件压缩
var cache     = require('gulp-cache');              //图片缓存
var imgmin    = require('gulp-imagemin');           //图片压缩
var notify    = require('gulp-notify');             //更动通知
var rename    = require('gulp-rename');             //重命名
var del       = require('del');
//var sass      = require('gulp-ruby-sass');          //编译SASS
// var jshint    = require('gulp-jshint');          //js代码检查
// var contact   = require('gulp-contact');        //合并js或css文件等

 
//gulp.task(name[, deps], fn)   定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options])    执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options])    处理完后文件生成路径
//gulp.watch(glob[, opts], tasks) 监视文件，并且可以在文件发生改动时候做一些事情。

//定义一个less任务（自定义任务名称）
// 编译Less ,在命令行项目目录下使用 gulp less 启动此任务
// gulp.task('less', function () {
//     gulp.src('docs/*/less/*.less')            //该任务针对的文件
//         .pipe(less())                         //该任务调用的模块
//         .pipe(gulp.dest('dist/css'))          //将会在dist/css下生成对应的css文件
//         .pipe(notify({ message: 'less task complete' }));
// });

//css文件压缩,在命令行项目目录下使用 gulp cssmin 启动此任务
gulp.task('cssmin', function () {
    gulp.src('docs/*/css/*.css')
        .pipe(cssmin({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false//类型：Boolean 默认：false [是否保留换行]
        }))
        .pipe(rename({ suffix: '.min' }))  //对压缩后的文件重命名
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'cssmin task complete' }));
});

// js文件压缩 ,在命令行项目目录下使用 gulp jsmin 启动此任务
gulp.task('jsmin', function() {
    gulp.src('docs/**/js/*.js')              // 1. 找到文件
        .pipe(jsmin())                       // 2. 压缩文件
        .pipe(rename({extname:'.min.js'}))   // 3.对压缩文件重命名
        .pipe(gulp.dest('dist'))             // 4. 输出压缩后的文件
        .pipe(notify({ message: 'jsmin task complete' }));
});
 
//图片压缩,在命令行项目目录下使用 gulp imgmin 启动此任务
gulp.task('imgmin', function() {
    gulp.src('docs/*/img/**/*.{png,jpg,gif,ico}')
        .pipe(cache(imgmin({
            optimizationLevel: 5,//类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true,   //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true,    //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true      //类型：Boolean 默认：false 多次优化svg直到完全优化
        })))
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'imagemin task complete' }));
});

//html文件压缩,在命令行项目目录下使用 gulp htmlmin 启动此任务
gulp.task('htmlmin', function () {
    gulp.src('docs/*/*.html')       // 要压缩的html文件
        .pipe(htmlmin())            //压缩
        .pipe(gulp.dest('dist'))
        .pipe(notify({ message: 'htmlmin task complete' }));
});

//字体文件复制
gulp.task('fonts',function(){
    gulp.src('docs/*/fonts')
        .pipe(gulp.dest('dist'))
        .pipe(notify({message: 'fonts task complete'}));
})

// js代码检查
// gulp.task('jshint', function() {
//     gulp.src('docs/js/*.js')
//         .pipe(jshint())
//         // .pipe(jshint.reporter('default')); //默认在命令行里输出结果
//         .pipe(jshint.reporter('gulp-jshint-html-reporter', {filename:'jshint-report.html'}));    //输出结果到自定义的html文件

// });

//合并js或css文件等
// gulp.task('scripts', function() {
//     gulp.src('./js/*.js')
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('./dist'));
// });
// 
// 编译SASS
// gulp.task('sass', function(){
//      
// 
// 
// })
// 
// 
//在任务执行前，最好先清除之前生成的文件：
gulp.task('clean', function() {
     return del(['dist']);  //删除发布环境文件
});



// 默认任务,在命令行项目目录下使用 gulp 启动此任务
gulp.task('default',['clean'],function(){  //在默认任务执行前，先执行清除任务
    gulp.start('cssmin', 'jsmin', 'imgmin', 'htmlmin');
});

 //监听文件变化,在命令行项目目录下使用 gulp watch启动此任务,监听的文件有变化就自动执行
 gulp.task('watch',function(){
     //监听css
     gulp.watch('docs/*/css/*.css',['cssmin']);
     //监听js
     gulp.watch('docs/*/js/*.js',['jsmin']);
     //监听img
     gulp.watch('docs/*/img/*/*.{png,jpg,gif,ico}',['imgmin']);
     //监听HTML
     gulp.watch('docs/*/*.html',['htmlmin']);
 });


```
##5. 运行Gulp
1. 通过终端命令行进入项目根目录
2. `gulp default`或`default` (说明：命令提示符执行gulp 任务名称)


如有不明之处，还请参阅[gulp详细入门教程](http://www.ydcss.com/archives/18)