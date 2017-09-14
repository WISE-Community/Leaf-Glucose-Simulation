var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");
var paths = {
    pages: [
        "src/*.html",
        "src/*.js",
        "src/images/*"
    ]
};

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: [
        "src/dayDisplayCorner.ts",
        "src/energyIndicatorView.ts",
        "src/event.ts",
        "src/feedback.ts",
        "src/graph.ts",
        "src/lightSwitch2.ts",
        "src/lightSwitch3.ts",
        "src/main.ts",
        "src/plantGlucoseSimulation.ts",
        "src/plantAnimationCorner.ts",
        "src/playBackControl.ts",
        "src/simulationEndFeedback.ts",
        "src/simulationSpeedSwitch.ts",
        "src/simulationState.ts",
        "src/util.ts",
        "src/wiseAPI.ts"
    ],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task("copy-html", function() {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .on('error', function(err) {
            console.log(err.stack);
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
}

gulp.task("default", ["copy-html"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);
