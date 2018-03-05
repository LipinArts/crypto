var gulp = require("gulp"),
	gutil = require("gulp-util"),
	sass = require("gulp-sass"),
	browsersync = require("browser-sync"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	cleancss = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	autoprefixer = require("gulp-autoprefixer"),
	notify = require("gulp-notify"),
	spritesmith = require("gulp.spritesmith"),
	svgSprite = require("gulp-svg-sprite"),
	svgmin = require("gulp-svgmin"),
	cheerio = require("gulp-cheerio"),
	replace = require("gulp-replace"),
	rsync = require("gulp-rsync");

gulp.task("browser-sync", function() {
	browsersync({
		server: {
			baseDir: "app"
		},
		notify: false
		// open: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task("sass", function() {
	return gulp
		.src("app/sass/**/*.sass")
		.pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
		.pipe(rename({ suffix: ".min", prefix: "" }))
		.pipe(autoprefixer(["last 15 versions"]))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulp.dest("app/css"))
		.pipe(browsersync.reload({ stream: true }));
});

gulp.task("js", function() {
	return (
		gulp
			.src([
				"app/libs/jquery/dist/jquery.min.js",
				"app/js/common.js" // Always at the end
			])
			.pipe(concat("scripts.min.js"))
	// .pipe(uglify()) // Mifify js (opt.)
			.pipe(gulp.dest("app/js"))
			.pipe(browsersync.reload({ stream: true }))
	);
});

gulp.task("rsync", function() {
	return gulp.src("app/**").pipe(
		rsync({
			root: "app/",
			hostname: "username@yousite.com",
			destination: "yousite/public_html/",
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		})
	);
});

gulp.task("sprite", function() {
	var spriteData = gulp
		.src("app/img/icons_png/*.*") // путь, откуда берем картинки для спрайта
		.pipe(
			spritesmith({
				imgName: "sprite.png",
				cssName: "_sprite.sass",
				imgPath: "../img/sprite.png",
				cssFormat: "sass",
				algorithm: "binary-tree",
				cssVarMap: function(sprite) {
					sprite.name = "icon-" + sprite.name;
				}
			})
		);

	spriteData.img.pipe(gulp.dest("app/img")); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest("app/sass")); // путь, куда сохраняем стили
});

gulp.task("sprite2x", function() {
	var spriteData = gulp
		.src("app/img/icons_@2xpng/*.*") // путь, откуда берем картинки для спрайта
		.pipe(
			spritesmith({
				imgName: "sprite@2x.png",
				cssName: "_sprite@2x.sass",
				imgPath: "../img/sprite@2x.png",
				cssFormat: "sass",
				algorithm: "binary-tree",
				cssVarMap: function(sprite) {
					sprite.name = "icon-" + sprite.name;
				}
			})
		);

	spriteData.img.pipe(gulp.dest("app/img")); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest("app/sass")); // путь, куда сохраняем стили
});
gulp.task("svgSprite", function() {
	return (
		gulp
			.src("app/img/icons_svg/*.svg")
	// minify svg
			.pipe(
				svgmin({
					js2svg: {
						pretty: true
					}
				})
			)
	// // remove all fill, style and stroke declarations in out shapes
	// 		.pipe(
	// 			cheerio({
	// 				run: function($) {
	// 					$("[fill]").removeAttr("fill");
	// 					$("[stroke]").removeAttr("stroke");
	// 					$("[style]").removeAttr("style");
	// 				},
	// 				parserOptions: { xmlMode: true }
	// 			})
	// 		)
	// cheerio plugin create unnecessary string '&gt;', so replace it.
			.pipe(replace("&gt;", ">"))
	// build svg sprite
			.pipe(
				svgSprite({
					mode: {
						symbol: {
							sprite: "../sprite.svg",
							render: {
								scss: {
									dest: "../../sass/_svgsprite"
								}
							}
						}
					}
				})
			)
			.pipe(gulp.dest("app/img/"))
	);
});

gulp.task("watch", ["sass", "js", "browser-sync"], function() {
	gulp.watch("app/sass/**/*.sass", ["sass"]);
	gulp.watch(["libs/**/*.js", "app/js/common.js"], ["js"]);
	gulp.watch("app/*.html", browsersync.reload);
});

gulp.task("default", ["watch"]);
