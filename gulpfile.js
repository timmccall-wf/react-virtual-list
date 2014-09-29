var browserify = require('gulp-browserify');
var colors = require('colors');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodeStatic = require('node-static');

var paths = {
    src: './src/**/*.js',
    examples: './examples/**/*.js'
};

gulp.task('lint', function() {
    return gulp.src([paths.src, paths.examples])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish-recolor'));
});

gulp.task('bundle', function() {
    gulp.src('./examples/demo/demo.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('serve', function() {
    var fileServer = new nodeStatic.Server();
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }).listen(8080);
    console.log(colors.yellow('Serving on http://localhost:8080/'));
});

gulp.task('watch', function() {
    return gulp.watch([paths.src, paths.examples], ['lint', 'bundle']);
});

gulp.task('default', ['watch', 'lint', 'bundle', 'serve']);