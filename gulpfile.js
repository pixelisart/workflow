var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Points all the files that exists in the /src folder
var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss' // Any file with .scss extension
}

// Points all the files that exists in the /app folder
var APPPATH = {
    root: 'app/',
    css : 'app/css',
    js : 'app/js'
}

gulp.task('sass', function(){
    return gulp.src(SOURCEPATHS.sassSource)
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('serve', ['sass'], function(){
    // browserSync will initialize all css, js and html when browserSync is initialized.
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

gulp.task('watch', ['serve', 'sass'], function(){
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
});

gulp.task('default', ['watch']);