const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  scss = require('gulp-sass')(require('sass')),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('gulp-autoprefixer'),
  del = require('del'),
  panini = require('panini'),
  groupMedia = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpack = require('webpack-stream'),
  htmlmin = require('gulp-html-minifier'),
  webpcss = require('gulp-webpcss')

const project_folder = 'build'
const source_folder = 'src'

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/assets/css/',
    js: project_folder + '/assets/js/',
    img: project_folder + '/assets/img/',
    fonts: project_folder + '/assets/fonts/',
  },

  src: {
    html: source_folder + '/*.html',
    css: source_folder + '/assets/scss/style.scss',
    js: source_folder + '/assets/js/*.js',
    img: source_folder + '/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
    fonts: source_folder + '/assets/fonts/*.{woff,woff2,ttf,eot}',
  },

  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/assets/scss/**/*.scss',
    js: source_folder + '/assets/js/**/*.js',
    img: source_folder + '/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
  },

  clean: './' + project_folder + '/',
}

function html() {
  panini.refresh()
  return src(path.src.html)
    .pipe(
      panini({
        root: source_folder,
        layouts: source_folder + '/layouts/',
        partials: source_folder + '/partials/',
        helpers: source_folder + '/helpers/',
        data: source_folder + '/data/',
      })
    )
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream())
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts))
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      }).on('error', scss.logError)
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 8 version'],
        grid: true,
        cascade: true,
      })
    )
    .pipe(webpcss({ webpClass: '', noWebpClass: '.no-webp' }))
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(
      webpack({
        mode: 'development',
        output: {
          filename: 'script.js',
        },
        watch: false,
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        debug: false,
                        corejs: 3,
                        useBuiltIns: 'usage',
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.img))

    .pipe(browserSync.stream())
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

function updateBrowser() {
  browserSync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    browser: 'google chrome',
    notify: false,
  })
}

function clean() {
  return del(path.clean)
}

function Prod() {
  fonts()
  panini.refresh()
  return src(path.src.html)
    .pipe(
      panini({
        root: source_folder,
        layouts: source_folder + '/layouts/',
        partials: source_folder + '/partials/',
        helpers: source_folder + '/helpers/',
        data: source_folder + '/data/',
      })
    )
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      rename({
        extname: '.min.html',
      })
    )
    .pipe(dest(path.build.html))
}

const build = gulp.series(
  clean,
  gulp.parallel(css, js, html, images, fonts),
  updateBrowser
)
const watch = gulp.parallel(watchFiles, build)
const prod = gulp.series(Prod)

exports.prod = prod
exports.html = html
exports.css = css
exports.js = js
exports.fonts = fonts
exports.images = images
exports.build = build
exports.watch = watch
exports.default = watch
