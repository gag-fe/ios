'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var hash_src = require("gulp-hash-src");
var reload = browserSync.reload;

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var HEADER = '<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="renderer" content="webkit"><meta http-equiv="X-UA-Compatible" content="IE=edge,Chrome=1"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>main</title><link rel="stylesheet" href="/FrontFrame/Bootstrap/css/bootstrap.min.css"><![if !IE]><link rel="stylesheet" href="/FrontFrame/Bootstrap/css/ace.min.css" id="main-ace-style"><![endif]><link rel="stylesheet" href="/FrontFrame/layui/css/layui.css"><link rel="stylesheet" href="/FrontFrame/FontAwesome/css/font-awesome.min.css"><!-- bootstrap-daterangepicker --><link rel="stylesheet" href="/FrontFrame/homePages/bootstrap-daterangepicker/daterangepicker.css"><!-- Custom Theme Style  --><link rel="stylesheet" href="/FrontFrame/custom/css/custom.min.css"><link rel="stylesheet" href="/FrontFrame/jQuery/css/jquery-ui.css"><link rel="stylesheet" href="/FrontFrame/jQuery/css/ui.jqgrid.css"><link rel="stylesheet" href="/FrontFrame/jQuery/css/jstree.css"><link rel="stylesheet" href="/FrontFrame/qtip/jquery.qtip.min.css"><link rel="stylesheet" href="/FrontFrame/qtip/style.css"><link rel="stylesheet" href="/FrontFrame/departMentTree/css/zTreeStyle.css"><link rel="stylesheet" href="/FrontFrame/plUpload/queue/css/jquery.plupload.queue.css" ／><link rel="stylesheet" href="/css/common.css"><link rel="stylesheet" href="/css/style.css"><![if !IE]><script src="/FrontFrame/jQuery/jquery.min.js"></script><![endif]><!--[if ! (IE 8)]><script src="/FrontFrame/jQuery/jquery.js"></script><![endif]--><!-- 为支持 ie8 需要使用低版本 jQuery 和 html5.min.js 和 respond.min.js --><!--[if IE 8]><script src="/FrontFrame/jQuery/jquery-1.11.1.js"></script><script src="/FrontFrame/Bootstrap/js/html5.min.js"></script><![endif]--><!-- 由于 custom 主题不支持 ie6、ie7 故本系统不提供 ie6、ie7 的支持 --></head><body>';
var FOOTER = '</body></html><!-- bootStrap&jqGrid&jQueryUi --><script src="/FrontFrame/jQuery/jquery-ui.js"></script><script src="/FrontFrame/Bootstrap/js/bootstrap.min.js"></script><script src="/FrontFrame/jQuery/jquery.jqGrid.src.js"></script><script src="/FrontFrame/jQuery/grid.locale-cn.js"></script><script src="/FrontFrame/jQuery/jquery.placeholder.js"></script><script src="/FrontFrame/jQuery/jquery.ztree.all-3.5.js"></script><script src="/FrontFrame/jQuery/jstree.js"></script><!-- <script src="/FrontFrame/departMentTree/departmentTree.js"></script> --><!-- bootStrap&jqGrid --><script src="/FrontFrame/layui/layui.js"></script><!-- <script src="/FrontFrame/layui/lay/dest/layui.all.js"></script>--><script src="/FrontFrame/custom/js/custom.min.js"></script><script src="/FrontFrame/qtip/jquery.qtip.min.js"></script><!-- Aisino表单校验 --><script src="/FrontFrame/formValidate/jquery.validate.js"></script><script src="/FrontFrame/formValidate/jquery.metadata.js"></script><script src="/FrontFrame/formValidate/messages_cn.js"></script><script src="/FrontFrame/formValidate/aisino.check.js"></script><!-- bootstrap-daterangepicker --><script src="/FrontFrame/homePages/moment/moment.min.js"></script><script src="/FrontFrame/homePages/bootstrap-daterangepicker/daterangepicker.js"></script><!--<script src="/FrontFrame/My97DatePicker/WdatePicker.js"></script>--><!-- fileupload --><script src="/FrontFrame/plUpload/plupload.js"></script><script src="/FrontFrame/plUpload/plupload.html4.js"></script><script src="/FrontFrame/plUpload/plupload.html5.js"></script><script src="/FrontFrame/plUpload/plupload.flash.js"></script><script src="/FrontFrame/plUpload/zh_CN.js"></script><script src="/FrontFrame/plUpload/queue/jquery.plupload.queue.js"></script><script src="/js/main.js"></script>';

var AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// 错误处理 防止任务中断
var errorHandle = {
  errorHandler: function(err) {
    console.log(err);
    this.emit('end');
  }
};


// JavaScript 格式校验
gulp.task('jshint', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// 图片优化
gulp.task('images', function() {
  return gulp.src('app/image/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/image'))
    .pipe($.size({
      title: 'image'
    }));
});

// 拷贝相关资源
gulp.task('copy', function() {
  return gulp.src([
      'app/*',
      'app/**',
      '!app/*.html',
      '!app/**/*.html',
      '!app/js/*',
      '!app/css/*',
      '!app/image/*'
    ], {
      dot: true
    })
    .pipe(gulp.dest(function(file) {
      return 'dist';
    }))
    .pipe($.size({
      title: 'copy'
    }));
});

gulp.task('css', function() {
  return gulp.src(['app/css/*.css'])
    .pipe($.changed('dist/css', {}))
    .pipe($.autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe($.csso())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({
      title: 'css'
    }));
});

// 编译 Less，添加浏览器前缀
gulp.task('styles', ['css'], function() {
  return gulp.src(['app/css/*.less', 'app/css/*.scss'])
    .pipe($.changed('dist/css', {
      extension: '.css'
    }))
    .pipe($.plumber(errorHandle))
    .pipe($.if(function(file) {
      return file.path.indexOf('.less') > -1;
    }, $.less()))
    .pipe($.if(function(file) {
      return file.path.indexOf('.scss') > -1;
    }, $.sass()))
    .pipe($.autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe($.csso())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({
      title: 'styles'
    }));
});

// 打包 Common JS 模块
var bundleInit = function() {
  var index = watchify(browserify({
    entries: [
      'app/js/config.js',
      'app/js/tools.js',
      'app/js/common.js',
      'app/js/commonInfo.js',
      'app/js/md5.js',
      'app/js/index.js',
    ],
    basedir: __dirname,
    cache: {},
    packageCache: {}
  }))
  .transform('babelify', {
    presets: ['es2015']
  })
  // 如果你想把 jQuery 打包进去，注销掉下面一行
  .transform('browserify-shim', {
    global: true
  })
  .on('update', function() {
    bundle(index, 'index');
  })
  .on('log', $.util.log);

  var login = watchify(browserify({
    entries: [
      'app/js/md5.js',
      'app/js/login.js',
    ],
    basedir: __dirname,
    cache: {},
    packageCache: {}
  }))
  .transform('babelify', {
    presets: ['es2015']
  })
  // 如果你想把 jQuery 打包进去，注销掉下面一行
  .transform('browserify-shim', {
    global: true
  })
  .on('update', function() {
    bundle(login, 'login');
  })
  .on('log', $.util.log);

  var dashboard = watchify(browserify({
    entries: [
      'app/js/config.js',
      'app/js/tools.js',
      'app/js/common.js',
      'app/js/commonInfo.js',
      'app/js/dashboard.js',
    ],
    basedir: __dirname,
    cache: {},
    packageCache: {}
  }))
  .transform('babelify', {
    presets: ['es2015']
  })
  // 如果你想把 jQuery 打包进去，注销掉下面一行
  .transform('browserify-shim', {
    global: true
  })
  .on('update', function() {
    bundle(dashboard, 'dashboard');
  })
  .on('log', $.util.log);

  var main = watchify(browserify({
    entries: [
      'app/js/config.js',
      'app/js/tools.js',
      'app/js/common.js',
      'app/js/commonInfo.js',
      'app/pages/admin/js/role_manager.js',
      'app/pages/admin/js/user_manager.js',
      "app/pages/bmgl/js/kpdgl.js",
      "app/pages/bmgl/js/jggl.js",
      "app/pages/bmgl/js/ssflbm.js",
      "app/pages/bmgl/js/xfgl.js",
      "app/pages/bmgl/js/xxfpcx.js",
    ],
    basedir: __dirname,
    cache: {},
    packageCache: {}
  }))
  .transform('babelify', {
    presets: ['es2015']
  })
  // 如果你想把 jQuery 打包进去，注销掉下面一行
  .transform('browserify-shim', {
    global: true
  })
  .on('update', function() {
    bundle(main, 'main');
  })
  .on('log', $.util.log);

  bundle(index, 'index');
  bundle(login, 'login');
  bundle(dashboard, 'dashboard');
  bundle(main, 'main');
};

var bundle = function(b, name) {
  return b.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(name + '.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/js'))
    .pipe($.uglify())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/js'));
};

gulp.task('browserify', bundleInit);

// 压缩 HTML
gulp.task('html', function() {
  return gulp.src(['./app/*.html', './app/**/*.html'])
    .pipe($.template({
      HEADER: HEADER,
      FOOTER: FOOTER
    }))
    // Minify Any HTML
    .pipe($.htmlmin({
      collapseWhitespace: true
    }))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({
      title: 'html'
    }));
});

gulp.task("hash", function() {
  return gulp.src(["./dist/**/*.html", "./dist/*.html"])
    .pipe(hash_src({ build_dir: "./dist", src_path: "./dist", query_name: 'hash', verbose: false }))
    .pipe(gulp.dest("./dist"))
});

// 洗刷刷
gulp.task('clean', function() {
  return del(['dist/*', '!dist/.git'], {
    dot: true
  });
});

// 清空 gulp-cache 缓存
gulp.task('clearCache', function(cb) {
  return $.cache.clearAll(cb);
});

// 监视源文件变化自动cd编译
gulp.task('watch', function() {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/css/**/*', ['styles']);
  gulp.watch('app/image/**/*', ['images']);
  // 使用 watchify，不再需要使用 gulp 监视 JS 变化
  // gulp.watch('app/js/**/*', ['browserify']);
});

// 启动预览服务，并监视 Dist 目录变化自动刷新浏览器
gulp.task('serve', ['default'], function() {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'ios',
    server: 'dist'
  });

  gulp.watch(['dist/**/*'], reload);
});

// 默认任务
gulp.task('default', function(cb) {
  runSequence('clean', ['styles', 'html', 'images', 'copy', 'browserify'], 'hash', 'watch', cb);
  // runSequence('clean', ['styles', 'jshint', 'html', 'images', 'copy', 'browserify'], 'hash', 'watch', cb);
});
