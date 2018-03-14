import gulp from 'gulp';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import gutil from 'gulp-util';
import through from 'through2';
import solc from 'solc';

var paths = {
  src: [
    'src/contracts/**/_Owned.sol',
    'src/contracts/**/_*.sol',
    'src/contracts/**/*.sol',
  ],
  build: 'build',
};

gulp.task('concat', function() {
  return gulp
    .src(paths.src)
    .pipe(concat('contracts.concat.sol'))
    .pipe(gulp.dest(paths.build))
    .on('error', gutil.log);
});

gulp.task('compile', ['concat'], function() {
  return gulp
    .src(paths.build + '/*.sol')
    .pipe(solCompile())
    .pipe(
      rename(function(path) {
        path.basename = path.basename.replace('.concat', '.compiled');
        path.extname = '.json';
      })
    )
    .pipe(gulp.dest(paths.build))
    .on('error', gutil.log);
});

function solCompile() {
  return through.obj(function CompilePlugin(file, encoding, done) {
    this.push(file);
    if (file.isBuffer()) {
      var source = file.contents.toString('utf8');
      var compiled = solc.compile(source, 1);
      file.contents = new Buffer(JSON.stringify(compiled));
    }
    return done();
  });
}

gulp.task('default', ['concat', 'compile']);
