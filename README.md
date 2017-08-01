> gulp plugin to minify FTL.

- minify the freemarker files (*.ftl)

- base on **[html-minifier](https://github.com/kangax/html-minifier/issues)**

- inspire from **[gulp-htmlmin](https://github.com/jonschlinkert/gulp-htmlmin)**

## Installation

```sh
npm i gulp-ftlmin --save-dev
```

## Usage

```js
var gulp = require('gulp');
var ftlmin = require('gulp-ftlmin');

gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(ftlmin({
		removeFtlComments: true,
		minifyFtl: true
		// others options for html-minifier...
	}))
    .pipe(gulp.dest('dist'));
});
```

> See the [html-minifier docs](https://github.com/kangax/html-minifier) for options.

