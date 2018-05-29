var gulp          = require( "gulp" )
	gutil         = require( "gulp-util" )
	scss          = require( "gulp-sass" )
	concat        = require( "gulp-concat" )
	uglify        = require( "gulp-uglify" )
	cleancss      = require( "gulp-clean-css" )
	rename        = require( "gulp-rename" )
	autoprefixer  = require( "gulp-autoprefixer" )
	notify        = require( "gulp-notify" )
	gcmq          = require( "gulp-group-css-media-queries" )
	htmlmin		  = require( "gulp-htmlmin" )

gulp.task( "scss", function() {
	return gulp.src( "app/scss/**/*.scss" )
	.pipe( scss( { outputStyle: "expand" } ).on( "error", notify.onError() ) )
	.pipe( rename( { suffix: ".min", prefix : "" }))
	.pipe( autoprefixer( [ "last 15 versions" ] ) )
	.pipe( cleancss( { level: { 1: { specialComments: 0 } } } ) ) // Opt., comment out when debugging
	.pipe( gulp.dest( "app/css" ) )
} )

gulp.task( "js", function() {
	return gulp.src( [
		"../node_modules/vue/dist/vue.min.js",
		"../node_modules/axios/dist/axios.min.js",
		"../node_modules/wowjs/dist/wow.min.js",
		"../node_modules/qs/dist/qs.js",
		"app/js/common.js", // Always at the end
		] )
	.pipe( concat( "scripts.min.js" ) )
	.pipe( uglify().on( "error", notify.onError() ) ) // Mifify js (opt.) - mifify hahaha
	.pipe( gulp.dest( "app/js" ) )
} )



gulp.task( "watch", [ "scss", "js" ], function() {
	gulp.watch( "app/scss/**/*.scss", [ "scss"] )
	gulp.watch( [ "libs/**/*.js", "app/js/common.js" ], [ "js" ] )
})

gulp.task( "default", [ "watch" ] )
