//开发环境下使用的插件
const gulp = require('gulp'), //本地安装gulp所用到的地方
  sass = require('gulp-ruby-sass'), //编译SASS，需要安装ruby环境，
  less = require('gulp-less'),
  plumber = require('gulp-plumber') //遇到错误gulp不终止
autoprefixer = require('gulp-autoprefixer'), //自动添加css浏览器前缀
  sourcemaps = require('gulp-sourcemaps'), //使得浏览器能够直接调试SCSS
  changed = require('gulp-changed'), //忽略没有变化的文件
  notify = require('gulp-notify'), //更动通知
  webserver = require('gulp-webserver'), //开启静态服务器
  spritesmith = require('gulp.spritesmith'), //图片自动生成css sprite
  //开发好后打包发布使用插件
  htmlmin = require('gulp-htmlmin'), //html文件压缩
  cssmin = require('gulp-clean-css'), //css文件压缩
  jsmin = require('gulp-uglify'), //JS文件压缩 
  imgmin = require('gulp-imagemin'), //图片压缩
  rename = require('gulp-rename'), //重命名
  copy = require('gulp-copy'), //文件复制
  replace = require('gulp-replace'), // 替换压缩后的js和css文件名称
  rev = require('gulp-rev'); //为文件名添加hash值
revCollector = require('gulp-rev-collector'); //将html模板中的静态文件链接替换为带hash值文件


//不常用的插件
// const contact = require('gulp-concat'); //合并js或css文件等
// const del = require('del'); 
// const cache = require('gulp-cache');
//gulp-babel 
//gulp-babel-preset-nev
//gulp-base64
//gulp-if
//gulp-debug 调试现在执行到哪个任务

//获取当前ip地址
function getIPAdress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}


//src 开发环境
//dist 发布环境


//gulp.task(name[, deps], fn)   定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options])    执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options])    处理完后文件生成路径
//gulp.watch(glob[, opts], tasks) 监视文件，并且可以在文件发生改动时候做一些事情。

//**********************************//
//以下是开发过程中的需要执行各种任务//
//**********************************//

//在开发环境中开启静态服务器
gulp.task('webserver-src', function() {
  gulp.src('./src/')
    .pipe(webserver({
      //域名 推荐写内网IP方便手机端同步调试，默认localhost
      host: getIPAdress(),
      //端口 随机生成端口，方便多项目调试
      port: 3000 + Math.ceil(Math.random() * 9),
      //自动开启浏览器
      open: true,
      //实时刷新代码。
      livereload: true
      //展示目录列表，多页面时可采用此配置
      // directoryListing: {
      //     path: './src/',
      //     enable: true
      // }
    }))
});

//html文件有变化时，自动更新
gulp.task('html', function() {
  gulp.src('./src/*.html')
    .pipe(notify({
      message: 'HTML has been modified!'
    }));
});

//css文件有变化时，自动更新
gulp.task('css', function() {
  gulp.src('./src/css/*.css')
    .pipe(autoprefixer({
      // 可根据项目需要自行配置需要兼容的版本
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('./src/css/'))
    .pipe(notify({
      message: 'CSS has been modified!'
    }));
});

//将SCSS文件编译为css文件  
gulp.task('sass', function() {
  sass('./src/css/scss/*.scss', {
      //为scss编译的css添加sourcemap，使得在浏览器中能显示scss文件的具体行数
      sourcemap: true,
      //Sass to CSS 的输出样式：nested,compact,expanded,compressed。
      style: 'expanded',
      //取消scss缓存
      // noCache: true,
      //scss缓存文件的位置
      cacheLocation: './src/css/scss/'
    })
    .pipe(sourcemaps.write())
    .on('error', sass.logError)
    .pipe(gulp.dest('./src/css/'))
    .pipe(notify({
      message: 'SCSS has been modified!'
    }));
});

//将less文件编译为css文件  
gulp.task('less', function() {
  gulp.src('./src/css/less/*.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./src/css/'))
    .pipe(notify({
      message: 'less has been modified!'
    }));
});



//js文件有变化时，自动更新
gulp.task('js', function() {
  gulp.src('./src/js/*.js')
    .pipe(notify({
      message: 'JavaScript has been modified!'
    }));
});

//图片自动生成css sprite
gulp.task('sprite', function() {
  gulp.src('./src/img/sprites/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../img/sprite.png',
      cssName: '../css/scss/sprite.scss',
      cssFormat: 'scss',
      padding: 5
    }))
    .pipe(gulp.dest('./src/img/'))
    .pipe(notify({
      message: 'CSSsprite has been finished!'
    }));
});

//**********************************//
//以下是开发调试过程中的各种监听任务//
//**********************************//

// 监听文件变化,在命令行项目目录下使用 gulp watch启动此任务,监听的文件有变化就自动执行
gulp.task('watch', function() {
  //监听HTML
  gulp.watch('./src/*.html', ['html']);
  //监听css
  gulp.watch('./src/css/*.css', ['css']);
  //监听scss
  gulp.watch('./src/css/scss/*.scss', ['sass']);
  //监听less
  gulp.watch('./src/css/less/*.less', ['less']);
  //监听js
  gulp.watch('./src/js/*.js', ['js']);
});

//项目开始编码时，执行gulp命令打开服务器并监听各文件变化，浏览器实时刷新
gulp.task('default', ['webserver-src', 'watch']);



//******************************************//
//以下是开发结束后打包到生产环境中的各种任务//
//******************************************//

//在生产环境中开启静态服务器检查是否正常
gulp.task('webserver-dist', function() {
  gulp.src('./dist/')
    .pipe(webserver({
      //域名 推荐写内网IP方便手机端同步调试，默认localhost
      host: getIPAdress(),
      //端口 随机生成端口，方便多项目调试
      port: 3000 + Math.ceil(Math.random() * 9),
      //自动开启浏览器
      open: true,
      //展示目录列表，多页面时可采用此配置
      // directoryListing: {
      //     path: './dist/',
      //     enable: true
      // }
    }))
});

//将html模板中的静态文件链接替换为带hash值的
gulp.task('rev', function() {
  return gulp.src(['./src/rev/*.json', './src/*.html'])
    .pipe(revCollector({
      replaceReved: true
      // dirReplacements: {
      //   'css': '/dist/css',
      //   '/js/': '/dist/js/',
      //   'cdn/': function(manifest_value) {
      //     return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
      //   }
      // }
    }))
    .pipe(gulp.dest('./dist/'));
});

//html文件压缩,在命令行项目目录下使用 gulp htmlmin 启动此任务
gulp.task('htmlmin', function() {
  const options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };
  gulp.src('./src/*.html')
    .pipe(changed('./dist/'))
    .pipe(htmlmin(options))
    .pipe(gulp.dest('./dist/'))
    .pipe(notify({
      message: 'HTML has been packaged!'
    }));
});

//css文件压缩,在命令行项目目录下使用 gulp cssmin 启动此任务
gulp.task('cssmin', function() {
  gulp.src('./src/css/*.css')
    .pipe(changed('./dist/'))
    .pipe(cssmin({
      //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
      advanced: false,
      //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
      compatibility: 'ie8',
      //类型：Boolean 默认：false [是否保留换行]
      keepBreaks: false
    }))
    .pipe(rename({
      //对压缩后的文件添加min后缀
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(notify({
      message: 'CSS has been packaged!'
    }));
});

// js文件压缩 ,在命令行项目目录下使用 gulp jsmin 启动此任务
gulp.task('jsmin', function() {
  gulp.src('./src/js/*.js')
    .pipe(changed('./dist/'))
    .pipe(jsmin())
    .pipe(rev()) //添加hash值
    .pipe(gulp.dest('./dist/js/'))
    .pipe(rev.manifest({
      base: 'src/rev/',
      merge: true
    })) //生成hash值映射文件manifest
    .pipe(notify({
      message: 'Javascript has been packaged!'
    }));
});

//图片压缩,在命令行项目目录下使用 gulp imgmin 启动此任务
gulp.task('imgmin', function() {
  gulp.src('./src/img/**/*.{png,jpeg,gif,ico,svg}')
    .pipe(changed('./dist/'))
    .pipe(imgmin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      svgoPlugins: [{ removeViewBox: true }]
    }))
    .pipe(gulp.dest('./dist/img/'));
});

//文件复制
gulp.task('copy', function() {
  gulp.src(['./src/fonts/*', './src/libs/**/*'])
    .pipe(copy('./dist/', { prefix: 1 }));
})



//合并js或css文件等
// gulp.task('scripts', function() {
//   gulp.src('./js/*.js')
//     .pipe(concat('bundle.js'))
//     .pipe(gulp.dest('./dist'))
//     .pipe(rename('bundle.min.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('./dist'));
// });


// 开发完成执行打包任务,在命令行项目目录下使用 gulp build启动此任务
gulp.task('build', ['cssmin', 'jsmin', 'imgmin', 'copy', 'htmlmin']);
// 开发完成后执行测试任务，开启服务器查看是否最终是否正常
gulp.task('test', ['webserver-dist']);