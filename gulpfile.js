var gulp 			= require('gulp'),     
	notify 			= require("gulp-notify") 
	bower 			= require('gulp-bower')
	autoprefixer 	= require('gulp-autoprefixer')
	less 			= require('gulp-less')
	path 			= require('path')
	livereload 		= require('gulp-livereload');


var config = {
	demosPath: 		'./demos',
	demosCssPath: 	'./demos/css',
	bowerDir: 		'./bower_components' ,
	jsPath: 		'./js',
	cssPath: 		'./css',
}


// --------------------------------------------------------------------------------
// Demos tasks
// --------------------------------------------------------------------------------

gulp.task('build-bootstrap', function () {
	return gulp.src(config.demosCssPath + '/bootstrap/bootstrap.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest(config.demosCssPath))
		.pipe(notify("Bootstrap CSS Compiled!"));
});

gulp.task('build-demo-css', function () {
	return gulp.src(config.demosCssPath + '/source/main.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest(config.demosCssPath))
		.pipe(notify("Demo CSS Compiled!"));
});

// Rerun the task when a file changes
 gulp.task('watch-demo', function() {
     gulp.watch(config.demosCssPath + '/source/*.less', ['build-demo-css']); 
});


// --------------------------------------------------------------------------------
// SlideMap tasks
// --------------------------------------------------------------------------------

gulp.task('build-css', function () {
	return gulp.src(config.cssPath + '/slidemap.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest(config.cssPath))
		.pipe(livereload())
		.pipe(notify("SlideMap CSS Compiled!"));
});

// Rerun the task when a file changes
 gulp.task('watch', function() {
	livereload.listen();
	gulp.watch(config.cssPath + '/*.less', ['build-css']); 
});



// --------------------------------------------------------------------------------
// Development tasks
// --------------------------------------------------------------------------------

gulp.task('bower', function() { 
	return bower()
		.pipe(gulp.dest(config.bowerDir)) 
});

// Rerun the task when a file changes
 gulp.task('watch-all', function() {
	livereload.listen();

	gulp.watch(config.cssPath + '/*.less', ['build-css']);
	 gulp.watch(config.demosCssPath + '/source/*.less', ['build-demo-css']); 
	gulp.watch(config.demosCssPath + '/bootstrap/*.less', ['build-bootstrap']); 
	
});


//   gulp.task('default', ['bower', 'icons', 'css']);
gulp.task('default', ['build-css']);