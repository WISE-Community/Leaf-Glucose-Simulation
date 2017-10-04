const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const gutil = require('gulp-util');
const paths = {
  pages: [
    'src/*.html',
    'src/*.js',
    'src/images/*'
  ]
};

const watchedBrowserify = watchify(browserify({
  basedir: '.',
  debug: true,
  entries: [
    'src/dayDisplayCorner.ts',
    'src/energyIndicatorView.ts',
    'src/event.ts',
    'src/feedback.ts',
    'src/graph.ts',
    'src/lightSwitch2.ts',
    'src/lightSwitch3.ts',
    'src/lightSwitch5.ts',
    'src/main.ts',
    'src/plantGlucoseSimulation.ts',
    'src/plantAnimationCorner.ts',
    'src/playBackControl.ts',
    'src/simulationEndFeedback.ts',
    'src/simulationSpeedSwitch.ts',
    'src/simulationState.ts',
    'src/util.ts',
    'src/wiseAPI.ts'
  ],
  cache: {},
  packageCache: {}
}).plugin(tsify));

gulp.task("copy-resources", function() {
    return gulp.src(paths.pages, { 'base': './src/'})
        .pipe(gulp.dest("dist"));
});

gulp.task('copy-changes', function() {
  return gulp.watch(paths.pages, function(obj) {
    if ( obj.type === 'changed' || obj.type === 'added' ) {
      console.log('copying changed file: ' + obj.path + ' to dist folder');
      gulp.src( obj.path, { 'base': './src/'})
      .pipe(gulp.dest('./dist'));
    }
  })
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on('error', function(err) {
      console.log(err.stack);
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
}

gulp.task('default', ['copy-resources', 'copy-changes'], bundle);
watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', gutil.log);
