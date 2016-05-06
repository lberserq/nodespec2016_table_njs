var gulp = require('gulp');
var babel = require('gulp-babel');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var eslint = require('gulp-eslint');
gulp.task('default', ['watch']);

gulp.task('build', ['libs']);


gulp.task('lint', function(){
	gulp.src('libs/**/*.js')
		.pipe(eslint())
		.pipe(eslint.formatEach('compact', process.stderr))
		.pipe(eslint.failOnError());
});

gulp.task('libs', function(){
	gulp.src('libs/**/*.js')
		.pipe(plumber())
		.pipe(changed('build'))
		.pipe(babel({
			presets: [
				'es2015-node5',
				'stage-3'
			]
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('watch', function(){
	gulp.watch('libs/**/*.js', ['libs']);
});