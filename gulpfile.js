var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');

// Points all the files that exists in the /src folder
var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss', // Any file with .scss extension
    htmlSource : 'src/*.html', // Listens to all html files inside the /src folder
    jsSource : 'src/js/**/*.js' // Listens to any JavaScript files in the /js folder.
}

// Points all the files that exists in the /app folder
var APPPATH = {
    root: 'app/',
    css : 'app/css',
    js : 'app/js'
}

// This task is to remove file(s) from /app folder when its corresponding file is removed from the /src folder.
gulp.task('clean-html', function(){
    return gulp.src(APPPATH.root + '/*.html', {read: false, force: true}) // This is to look for html files and not read the contents.
        .pipe(clean());
});

gulp.task('clean-scripts', function(){
    return gulp.src(APPPATH.js + '/*.js', {read: false, force: true}) // This is to look for html files and not read the contents.
        .pipe(clean());
});

gulp.task('sass', function(){
    return gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(gulp.dest(APPPATH.js))
});

// Copies html file from the /src folder to /app folder
gulp.task('copy', ['clean-html'], function(){
    gulp.src(SOURCEPATHS.htmlSource)
        .pipe(gulp.dest(APPPATH.root))
});

gulp.task('serve', ['sass'], function(){
    // browserSync will initialize all css, js and html when browserSync is initialized.
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

gulp.task('watch', ['serve', 'sass', 'copy', 'clean-html', 'clean-scripts', 'scripts'], function(){
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
});

gulp.task('default', ['watch']);