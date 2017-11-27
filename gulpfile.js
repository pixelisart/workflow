var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');  
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var injectPartials = require('gulp-inject-partials');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var inject = require('gulp-inject');

// Points all the files that exists in the /src folder
var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss', // Any file with .scss extension
    //htmlSource : 'src/*.html', // Listens to all html files inside the /src folder
    htmlSource : 'src/**/*.html',
    htmlPartialSource : 'src/partial/*.html',  // These are include files
    jsSource : 'src/js/**', // Listens to any JavaScript files in the /js folder.
    imgSource : 'src/img/**' // This means all folders that are under /img folder. Looks for all types of images: jpg, jpeg, svg, gif etc.

}

// Points all the files that exists in the /app folder
var APPPATH = {
    root: 'app/',
    css : 'app/css',
    js : 'app/js',
    fonts : 'app/fonts',
    img : 'app/img'
}

gulp.task('subfolder-index', function () {
    //var target = gulp.src('subfolder/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    //var sources = gulp.src(['./src/**/*.js', './src/**/*.css'], {read: false});
    //var sources = gulp.src([SOURCEPATHS.jsSource, SOURCEPATHS.sassSource], {read: false});
    //return target.pipe(inject(sources))
    //    .pipe(gulp.dest(APPPATH.root));

    gulp.src('./src/subfolder/index.html')
        .pipe(inject(gulp.src(SOURCEPATHS.jsSource), { starttag: '<!-- inject:js:{{ext}} -->'}))
        .pipe(gulp.dest(APPPATH.root));
});


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

    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.min.css');
    var sassFiles;

    /* this.emit('end') - Tells Gulp to stop running the rest of the process in the task but keep running Gulp. */
    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        // .pipe(plumber(function(){
        //     console.log('Styles Task Error.');
        //     console.log(err);
        //     this.emit('end');  
        // }))
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        return merge(bootstrapCSS, sassFiles)
            .pipe(concat('app.css'))
            .pipe(gulp.dest(APPPATH.css));
});

gulp.task('images', function(){
    return gulp.src(SOURCEPATHS.imgSource)
        .pipe(newer(APPPATH.img)) // Checks if a new image is added to /src/img, it is copied over to the /app/img prod folder.
        .pipe(imagemin())
        .pipe(gulp.dest(APPPATH.img));
});

gulp.task('moveFonts', function(){
    gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(APPPATH.fonts));
});

gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(gulp.dest(APPPATH.js))
});

/** PRODUCTION TASKS */
gulp.task('scripts-compressed', function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest(APPPATH.js))
});

gulp.task('css-compressed', function(){
    
    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.min.css');
    var sassFiles;

    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        return merge(bootstrapCSS, sassFiles)
            .pipe(concat('app.css'))
            .pipe(cssmin())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(APPPATH.css));
});

gulp.task('html-compressed', function(){
    return gulp.src(SOURCEPATHS.htmlSource)
        .pipe(injectPartials())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(APPPATH.root))
});
/** END OF PRODUCTION TASKS */

gulp.task('htmlPartials', function(){
    return gulp.src(SOURCEPATHS.htmlSource)
        .pipe(injectPartials())
        .pipe(gulp.dest(APPPATH.root))
});

// COMMENTED OUT BECAUSE OF htmlPartials
// Copies html file from the /src folder to /app folder
/*
gulp.task('copy', ['clean-html'], function(){
    gulp.src(SOURCEPATHS.htmlSource)
        .pipe(gulp.dest(APPPATH.root))
});
*/




gulp.task('serve', ['sass'], function(){
    // browserSync will initialize all css, js and html when browserSync is initialized.
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

//  COMMENTED OUT: 'copy',
gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images', 'htmlPartials', 'subfolder-index'], function(){
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    //gulp.watch([SOURCEPATHS.htmlSource], ['copy']);  // commented out because of htmlPartials.  Not needed.  Doing the same thing.
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
    gulp.watch([SOURCEPATHS.imgSource], ['images']);
    gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialSource], ['htmlPartials']);
});

gulp.task('default', ['watch']);

gulp.task('production', ['scripts-compressed', 'css-compressed', 'html-compressed']);