//导入工具包 require('node_modules里对应模块')
var gulp      = require('gulp');				    //本地安装gulp所用到的地方
var	jsmin     = require('gulp-uglify');			    //JS文件压缩 
var cssmin    = require('gulp-clean-css');         //css文件压缩
var htmlmin   = require('gulp-minify-html');        //html文件压缩
var cache     = require('gulp-cache');              //图片缓存
var imgmin    = require('gulp-imagemin');           //图片压缩
var notify    = require('gulp-notify');             //更动通知
var rename    = require('gulp-rename');             //重命名
var del       = require('del');
var sass      = require('gulp-ruby-sass');          //编译SASS
var sourcemaps= require('gulp-sourcemaps');          //使得浏览器能够直接调试SCSS
var connect   = require('gulp-connect');            //实时刷新浏览器
// var less      = require('gulp-less');			    // 编译Less
// var jshint    = require('gulp-jshint');			//js代码检查
// var contact   = require('gulp-contact');		   //合并js或css文件等

//src 开发环境
//dist 发布环境
//demo 项目名称,每做一个项目需要修改项目名称
var demo = 'demo';
//gulp.task(name[, deps], fn)   定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options])    执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options])    处理完后文件生成路径
//gulp.watch(glob[, opts], tasks) 监视文件，并且可以在文件发生改动时候做一些事情。

//**********************************//
//以下是开发过程中的需要执行各种任务//
//**********************************//

//浏览器自动刷新页面
gulp.task('connect', function() {
    connect.server({
        //地址，推荐写本地IP方便手机端同步调试，不写的话，默认localhost
        host: '14.42.1.148', 
        port: 3000, //端口号，可不写，默认8000
        root: './src/'+demo+'/', //当前项目主目录
        livereload: true //自动刷新
    });
});

//html文件有变化时，自动更新
gulp.task('html', function() {
    gulp.src('src/'+ demo + '/*.html')
        .pipe(connect.reload())
        .pipe(notify({ message: 'HTML has change' }));
});

//css文件有变化时，自动更新
gulp.task('css', function() {
    gulp.src('src/'+ demo + '/css/*.css')
        .pipe(connect.reload())
        .pipe(notify({ message: 'CSS has change' }));
});

//编译SASS  gulp sass
gulp.task('sass', function(){
    sass('src/'+ demo + '/css/scss/*.scss',{
        //为scss编译的css添加sourcemap，使得在浏览器中能显示scss文件的具体行数
        sourcemap: true,  
        //Sass to CSS 的输出样式：nested,compact,expanded,compressed。
        style:'expanded', 
        //取消scss缓存
        noCache:true
        //scss缓存文件的位置
        //cacheLocation: 'src/'+ demo + '/css/scss/', 
    })
    .pipe(sourcemaps.write())
    .on('error', sass.logError)
    .pipe(gulp.dest('src/'+ demo + '/css/'))
    .pipe(notify({ message: 'SCSS has change' }))
    .pipe(connect.reload());
})

// 编译Less ,在命令行项目目录下使用 gulp less 启动此任务
// gulp.task('less', function () {
//     gulp.src('src/*/less/*.less')            //该任务针对的文件
//         .pipe(less())                         //该任务调用的模块
//         .pipe(gulp.dest('dist/css'))          //将会在dist/css下生成对应的css文件
//         .pipe(notify({ message: 'less task complete' }));
// });
 
//js文件有变化时，自动更新
gulp.task('js', function() {
    gulp.src('src/'+ demo + '/js/*.js')
        .pipe(notify({ message: 'JavaScript has change' }))
        .pipe(connect.reload());
});

// js代码检查
// gulp.task('jshint', function() {
//     gulp.src('src/js/*.js')
//         .pipe(jshint())
//         //默认在命令行里输出结果
//         // .pipe(jshint.reporter('default')); 
//          //输出结果到自定义的html文件
//         .pipe(jshint.reporter('gulp-jshint-html-reporter', {filename:'jshint-report.html'})); 

// });


//**********************************//
//以下是开发调试过程中的各种监听任务//
//**********************************//

// 监听文件变化,在命令行项目目录下使用 gulp watch启动此任务,监听的文件有变化就自动执行
gulp.task('watch',function(){
    //监听HTML
    gulp.watch('src/'+ demo + '/*.html',['html']);
    //监听css
    gulp.watch('src/'+ demo + '/css/*.css',['css']);
    //监听scss
    gulp.watch('src/'+ demo + '/css/scss/*.scss',['sass']);
    //监听js
    gulp.watch('src/'+ demo + '/js/*.js',['js']);
});

//项目开始编码时，执行gulp命令打开服务器并监听各文件变化，浏览器实时刷新
gulp.task('default',['clean','watch','connect']);



//******************************************//
//以下是开发结束后打包到生产环境中的各种任务//
//******************************************//

//在任务执行前，最好先清除之前生成的文件： gulp clean
gulp.task('clean', function() {
     return del(['dist']);  //删除发布环境文件
});


//css文件压缩,在命令行项目目录下使用 gulp cssmin 启动此任务
gulp.task('cssmin', function () {
    gulp.src('src/'+ demo + '/css/*.css')
        .pipe(cssmin({
            //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            advanced: false,
            //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            compatibility: 'ie8',
            //类型：Boolean 默认：false [是否保留换行]
            keepBreaks: false
        }))
        .pipe(rename({ suffix: '.min' }))  //对压缩后的文件重命名
        .pipe(gulp.dest('dist/'+ demo + '/css/'))
});

// js文件压缩 ,在命令行项目目录下使用 gulp jsmin 启动此任务
gulp.task('jsmin', function() {
    gulp.src('src/'+ demo + '/js/*.js')              // 1. 找到文件
        .pipe(jsmin())                       // 2. 压缩文件
        .pipe(rename({extname:'.min.js'}))   // 3.对压缩文件重命名
        .pipe(gulp.dest('dist/'+ demo + '/js/'))             // 4. 输出压缩后的文件
});
 
//图片压缩,在命令行项目目录下使用 gulp imgmin 启动此任务
gulp.task('imgmin', function() {
    gulp.src('src/'+ demo + '/img/**/*.{png,jpg,gif,ico}')
        .pipe(cache(imgmin({
            optimizationLevel: 5,//类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true,   //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true,    //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true      //类型：Boolean 默认：false 多次优化svg直到完全优化
        })))
        .pipe(gulp.dest('dist/'+ demo + '/img/'))
});

//html文件压缩,在命令行项目目录下使用 gulp htmlmin 启动此任务
gulp.task('htmlmin', function () {
    gulp.src('src/'+ demo + '/*.html')       // 要压缩的html文件
        .pipe(htmlmin())            //压缩
        .pipe(gulp.dest('dist/'+ demo + '/'))
        .pipe(notify({ message: 'Package task complete' }));
});

//字体文件复制
// gulp.task('fonts',function(){
//     gulp.src('src/*/fonts')
//         .pipe(gulp.dest('dist'))
//         .pipe(notify({message: 'fonts task complete'}));
// })

//合并js或css文件等
// gulp.task('scripts', function() {
//     gulp.src('./js/*.js')
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('./dist'));
// });


// 开发完成执行打包任务,在命令行项目目录下使用 gulp package启动此任务
gulp.task('package',['clean','cssmin', 'jsmin', 'imgmin', 'htmlmin']);
