// list of dependence
const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");

const htmlMinifier = require("gulp-htmlmin");
const purge = require("gulp-purgecss");
const browserSync = require("browser-sync").create();

/**
 * Take all the HTML files in the src folder, minify them, and put them in the public folder.
 * @returns The html files are being returned from the src folder and then being minified and then
 * being sent to the public folder.
 */
function compilehtml() {
  return src("src/**/*.html")
    .pipe(htmlMinifier({ collapseWhitespace: true }))
    .pipe(dest("public"));
}

/**
 * Compile SCSS, add vendor prefixes, remove unused CSS, minify CSS, and output to public/css
 * @returns the source of the scss files, the sourcemaps, the compiler, the pre-fixer, the purge, the
 * minifier, and the destination of the css files.
 */
function compilescss() {
  return src("src/scss/*.scss", { sourcemaps: true })
    .pipe(sass().on("error", sass.logError)) // Compiler
    .pipe(postcss([autoprefixer("last 2 versions")])) // Pre-fixer
    .pipe(purge({ content: ["src/**/*.html", "src/**/*.js"] })) // Remove Unused CSS
    .pipe(postcss([cssnano()])) //CSS minifier not running because still looking at code

    .pipe(dest("public/css", { sourcemaps: "." }));
}

// assets

function compilepng() {
  return src("src/assets/**/**/*.png").pipe(dest("public/assets/"));
}

function compileJpg() {
  return src("src/assets/**/**/*.jpg").pipe(dest("public/assets/"));
}

function compilesvg() {
  return src("src/assets/**/*.svg").pipe(dest("public/assets/"));
}

// JsCompiler
function compileJs() {
  return src("src/scripts/**/*.js").pipe(dest("public/scripts/"));
}

//BrowserSync Services
// This function tell witch folder im using for server
function browsersyncServer(cb) {
  browserSync.init({
    server: {
      baseDir: "public/",
    },
    browser: "Chrome",
  });
  cb();
}
//This function reload the browser
function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

// create watchtask, if something change it will run browserSyncReload.

function watchTask() {
  watch("src/**/*.html", series(compilehtml, compilescss, browserSyncReload));
  watch(
    "src/scripts/*.js",
    series(compilescss, compilesvg, compilepng, compileJs, browserSyncReload)
  );
  watch(
    "src/scss/**/*.scss",
    series(compilescss, compilesvg, compilepng, compileJs, browserSyncReload)
  );
}

// exports

// default gulp
exports.default = series(
  compilehtml,
  compilescss,
  compilepng,
  compileJs,
  compileJpg,
  compilesvg,
  browsersyncServer,
  browserSyncReload,
  watchTask
);

/* This is a gulp task that is being exported. */
exports.compilescss = series(compilescss, watchTask);
