var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');

// Points all the files that exists in the /src folder
var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss', // Any file with .scss extension
    htmlSource : 'src/*.html' // Listens to all html files inside the /src folder
}

// Points all the files that exists in the /app folder
var APPPATH = {
    root: 'app/',
    css : 'app/css',
    js : 'app/js'
}

gulp.task('sass', function(){
    return gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest(APPPATH.css));
});

// Copies html file from the /src folder to /app folder
gulp.task('copy', function(){
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

gulp.task('watch', ['serve', 'sass', 'copy'], function(){
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    gulp.watch([SOURCEPATHS.htmlSource], ['copy'])
});

gulp.task('default', ['watch']);