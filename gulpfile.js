var gulp = require("gulp");
var gutil = require("gulp-util");
var minifyHtml = require("gulp-minify-html");
var ngHtml2Js = require("gulp-ng-html2js");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var styl = require('gulp-styl');
var watch = require('gulp-watch');

var angularPartials = "./angularpartials/*.html";
var scripts = "./public/scripts/**/*.js";
var styles = "./public/style/**/*.css";

var bowerScripts = [
    "./bower_components/angular/angular.min.js",
    "./bower_components/angular-moment/angular-moment.min.js",
    "./bower_components/angular-resource/angular-resource.min.js",
    "./bower_components/angular-route/angular-route.min.js",
    "./bower_components/moment/min/moment.min.js",
    "./bower_components/ng-table/ng-table.js"
];

gulp.task("angular", function () {
    gulp.src(angularPartials)
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            moduleName: "PlexWWWatchPartials",
            prefix: "partials/"
        }))
        .pipe(concat("partials.min.js"))
        //.pipe(uglify())
        .pipe(gulp.dest("public/build"));
});

gulp.task("scripts", function(){
    gulp.src(scripts)
        .pipe(concat("script.js"))
        //.pipe(uglify())
        .pipe(gulp.dest("public/build"));
});

gulp.task("styles", function() {
    gulp.src(styles)
        /*.pipe(styl({
            compress : true
        }))*/
        .pipe(concat("style.css"))
        .pipe(gulp.dest("public/build"));
});

gulp.task("bower", function () {
    gulp.src(bowerScripts)
        .pipe(concat("bower.js"))
        .pipe(gulp.dest("public/build"));
});

gulp.task("default", ["angular", "scripts", "styles", "bower"], function() {
    gulp.watch("public/scripts/**", function (event) {
        gulp.run("scripts");
    });
    gulp.watch("public/style/**", function (event) {
        gulp.run("styles");
    });
    gulp.watch("angularPartials/**", function (event) {
        gulp.run("angular");
    });
    gulp.watch("public/bower_components/**", function (event) {
        gulp.run("bower");
    });
});
