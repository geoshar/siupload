"use strict";
var gulp = require('gulp'),
    // $ = require('gulp-load-plugins')(),
    // sourcemaps = require('gulp-sourcemaps'),
    // rename = require('gulp-rename'),
    //   css_minify = require('gulp-minify-css'),
    // stylus = require('gulp-stylus'),
    // less = require('gulp-less'),
    // nib = require('nib'),
    //del = require('del'),
    // combiner = require('stream-combiner2').obj,
    // newer = require('gulp-newer'),
    // remember = require('gulp-remember'),
    cached = require('gulp-cached'),
    //notifier = require('node-notifier'),
    // notify = require('gulp-notify'),
    browserSync = require('browser-sync').create(),
    //uglify = require('gulp-uglify'),
    //minify = require('gulp-minify'),
    //concat = require('gulp-concat'),
    header = require('gulp-header'),
    // saveLicense = require('uglify-save-license'),
    // merge = require('merge'),
    // gulpMerge = require('gulp-merge'),
    // cssmin = require('gulp-cssmin'),
    include = require("gulp-include"),
    // path = require('path'),
    clean = require('gulp-clean'),
    inject = require('gulp-inject'),
    //injects = require('gulp-inject-string'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    // auto reload
    //argv = require('yargs').argv,
    gutil = require('gulp-util'),
    child = require('child_process');

function correctNumber(number) {
    return number < 10 ? '0' + number : number;
}
// Return timestamp
function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = correctNumber(now.getMonth() + 1);
    var day = correctNumber(now.getDate());
    var hours = correctNumber(now.getHours());
    var minutes = correctNumber(now.getMinutes());
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
}
// license header
var pkg = require('./package.json');
var banner = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @email georgewebp@gmail.com',
    ' * @homepage <%= pkg.homepage %>',
    ' * @created ' + getDateTime(),
    ' * @license <%= pkg.license %>',
    ' **/',
    ''
].join('\n');

var path_bower = 'bower_components/';
var path_appComponents = 'app/main/components/';
var path = {
    del: 'dist/',
    app: {
        app: 'app/app/**/*.*',
        html: 'app/app/**/*.html',
        css: 'app/app/**/*.css',
        js: 'app/app/**/*.js',
        php: 'app/app/**/*.php',

        components: 'app/components/**/*.*'
    },
    dist: {
        app: 'dist/app/',
        html: 'dist/app/',
        css: 'dist/app/',
        js: 'dist/app/',
        php: 'dist/app/',

        components: 'dist/components/'
    }
};
var proc;

function restart(done) {
    if (proc) {
        proc.removeListener('exit', done);
        proc.kill();
        proc = null;
    }
    proc = child.exec('gulp');
    proc.addListener('exit', done);
    proc.stdout.pipe(process.stdout);
}
gulp.task('run', function(done) {
    restart(done);
});

gulp.task('archive', function() {
    gulp.src('dist/**/*.*')
        .pipe(zip(pkg.name + '.v-' + pkg.version + '.zip'))
        .pipe(gulp.dest('archive'))
});

gulp.task('del', function() {
    return gulp.src(path.del)
        .pipe(clean());
});
gulp.task('components', function() {
    return gulp.src(path.app.components) //[dir_developing.css.stylus+'*.styl']),
        .pipe(cached(path.app.components))
        .pipe(gulp.dest(path.dist.components));
});


gulp.task('html', function() {
    return gulp.src(path.app.html) //[dir_developing.css.stylus+'*.styl']),
        .pipe(cached(path.app.html))
        .pipe(gulp.dest(path.dist.html))
        .pipe(inject(gulp.src(path.dist.components + '**/*.{css,js}', {
            read: false
        }), {
            name: 'components',
            relative: true
        }))
        .pipe(inject(gulp.src([path.dist.css + '**/*.css', path.dist.js + '**/*.js'], {
            read: false
        }), {
            name: 'head',
            relative: true
        }))
        .pipe(header('<!-- \n' + banner + ' -->\n', {
            pkg: pkg
        }))
        .pipe(gulp.dest(path.dist.html));
});

gulp.task('js', function() {
    return gulp.src(path.app.js) //[dir_developing.css.stylus+'*.styl']),
        .pipe(cached(path.app.js))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest(path.dist.js));
});
gulp.task('css', function() {
    return gulp.src(path.app.css) //[dir_developing.css.stylus+'*.styl']),
        .pipe(cached(path.app.css))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest(path.dist.css));
});
gulp.task('php', function() {

    return gulp.src(path.app.php) //[dir_developing.css.stylus+'*.styl']),
        .pipe(cached(path.app.php))
        .pipe(replace('<\?php', ''))
        .pipe(header('<?php \n' + banner, {
            pkg: pkg
        }))
        //.pipe(injects.after('<?php', '\n'+JSON.stringify(headerd)))
        .pipe(gulp.dest(path.dist.php));
});

gulp.task('build',  gulp.series('js', gulp.series('components', gulp.series('css', gulp.parallel('html', 'php')))));
//watch 
gulp.task('watch', function() {
    gulp.watch('gulpfile.js', gulp.parallel('run'));

    gulp.watch(path.app.html, gulp.parallel('html'));
    gulp.watch(path.app.js, gulp.parallel('js'));
    gulp.watch(path.app.css, gulp.parallel('css'));
    gulp.watch(path.app.php, gulp.parallel('php'));
    gulp.watch(path.app.components, gulp.parallel('components'));

});
// Static server
gulp.task('server', function() {
    browserSync.init({
        logConnections: true,
        reloadOnRestart: true,
        open: false,
        proxy: {
            target: "writings.ru/"+pkg.name+"/dist/app/",
            ws: true
        }
    });
    browserSync.watch('app/**/*.*').on('change', browserSync.reload);
});
gulp.task('default', gulp.series('del', gulp.series('build',  gulp.parallel('archive', 'watch', 'server'))));