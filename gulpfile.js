// --------------------------------------------------------------------------------
// requires
// --------------------------------------------------------------------------------

var gulp 					= require('gulp'),     
	autoprefixer 			= require('gulp-autoprefixer'),
	bower 					= require('gulp-bower'),
	less 					= require('gulp-less'),
	livereload 				= require('gulp-livereload'),
	minifyCSS 				= require('gulp-minify-css'),
	notify 					= require("gulp-notify"), 
	rename 					= require("gulp-rename"),
	sourcemaps 				= require('gulp-sourcemaps'),
	uglify 					= require('gulp-uglify'),
	path 					= require('path');
	

// --------------------------------------------------------------------------------
// variables
// --------------------------------------------------------------------------------

var config = {
	demosPath: 		'./demos',
	demosCssPath: 	'./demos/css',
	bowerDir: 		'./bower_components' ,
	srcCssPath: 	'./less',
	srcJsPath: 		'./js',
	distCssPath: 	'./dist/css',
	distJsPath: 	'./dist/js',
}


// --------------------------------------------------------------------------------
// Demos tasks
// --------------------------------------------------------------------------------

gulp.task('build-demo-bootstrap', function () {
	
	return gulp.src(config.demosCssPath + '/bootstrap/bootstrap.less')
		
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		
		.pipe(gulp.dest(config.demosCssPath))
		
		.pipe(livereload())

		.pipe(notify("Demo bootstrap compiled!"));

});

gulp.task('build-demo-less', function () {
	
	return gulp.src(config.demosCssPath + '/less/main.less')
		
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		
		.pipe(gulp.dest(config.demosCssPath))
		
		.pipe(livereload())

		.pipe(notify("Demo less compiled!"));

});

gulp.task('build-demo-html', function () {
	
	return gulp.src(config.demosPath + '/index.html')
		
		.pipe(livereload())

		.pipe(notify("Demo Html reloaded!"));

});

gulp.task('watch-demo', function() {
	
	gulp.watch(config.demosCssPath + '/bootstrap/*.less', ['build-demo-bootstrap']); 
	
	gulp.watch(config.demosCssPath + '/less/*.less', ['build-demo-less']); 

	gulp.watch(config.demosPath + '/index.html', ['build-demo-html']);
});


// --------------------------------------------------------------------------------
// SlideMap tasks
// --------------------------------------------------------------------------------

gulp.task('build-css', function () {
	
	return gulp.src(config.srcCssPath + '/slidemap.less')
		
		.pipe(sourcemaps.init())
		
			.pipe(less({
				paths: [ path.join(__dirname, 'less', 'includes') ],
			}))

			.pipe(autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			}))
		
			.pipe(gulp.dest(config.distCssPath))
		
			.pipe(minifyCSS())

			.pipe(rename({
				suffix: ".min",
			}))
		
		.pipe(sourcemaps.write('../.'+config.distCssPath))
		
		.pipe(gulp.dest(config.distCssPath))

		.pipe(livereload())
		
		.pipe(notify({message: "SlideMap Less Compiled!", onLast: true}));

});

gulp.task('build-js', function () {
	
	return gulp.src(config.srcJsPath + '/slidemap.js')

		.pipe(gulp.dest(config.distJsPath))

		.pipe(uglify({preserveComments: 'some'}))

		.pipe(rename({
			suffix: ".min",
		}))
		
		.pipe(gulp.dest(config.distJsPath))

		.pipe(livereload())
		
		.pipe(notify({message: "SlideMap Js Compiled!", onLast: true}));

});

gulp.task('watch-dist', function() {
	
	livereload.listen();

	gulp.watch(config.srcCssPath + '/*.less', ['build-css']); 

	gulp.watch(config.srcJsPath + '/*.js', ['build-js']); 

});



// --------------------------------------------------------------------------------
// General tasks
// --------------------------------------------------------------------------------

gulp.task('bower', function() { 
	return bower()
		.pipe(gulp.dest(config.bowerDir)) 
});

gulp.task('watch', ['watch-demo', 'watch-dist'], function() {
	
	livereload.listen();
	
});

gulp.task('default', ['build-demo-bootstrap', 'build-demo-less', 'build-css', 'build-js']);
