const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  scss = require('gulp-sass')(require('sass')),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('gulp-autoprefixer'),
  del = require('del'),
  groupMedia = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  webp = require('gulp-webp'),
  webpack = require('webpack-stream'),
  htmlmin = require('gulp-html-minifier'),
  webpcss = require('gulp-webpcss'),
  gulpif = require('gulp-if'),
  panini = require('panini'),
  imagemin = require('gulp-imagemin')

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
    img: source_folder + '/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,mp4}',
    fonts: source_folder + '/assets/fonts/*.{woff,woff2,ttf,eot}',
  },

  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/assets/scss/**/*.scss',
    js: source_folder + '/assets/js/**/*.js',
    img: source_folder + '/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,mp4}',
  },

  clean: './' + project_folder + '/',
}

const isDev = process.env.NODE_ENV === 'development'

const html = () => {
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
    .pipe(dest(path.build.html))
    .pipe(gulpif(!isDev, htmlmin({ collapseWhitespace: true })))
    .pipe(
      gulpif(
        !isDev,
        rename({
          extname: '.min.html',
        })
      )
    )
    .pipe(gulpif(!isDev, dest(path.build.html)))
    .pipe(gulpif(isDev, browserSync.stream()))
}

const css = () => {
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
    .pipe(gulpif(isDev, browserSync.stream()))
}

const js = () => {
  return src(path.src.js)
    .pipe(
      webpack({
        mode: isDev ? 'development' : 'production',
        output: {
          filename: 'script.js',
        },
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
    .pipe(gulpif(isDev, browserSync.stream()))
}

const images = () => {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(
      webp({
        quality: 90,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(
      gulpif(
        !isDev,
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 75, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
          }),
        ])
      )
    )
    .pipe(gulpif(!isDev, dest(path.build.img)))
    .pipe(gulpif(isDev, browserSync.stream()))
}

const fonts = () => src(path.src.fonts).pipe(dest(path.build.fonts))

const clean = () => del(path.clean)

const watchFiles = () => {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

const updateBrowser = () => {
  if (isDev) {
    browserSync.init({
      server: {
        baseDir: './' + project_folder + '/',
      },
      browser: 'google chrome',
      notify: false,
    })
  }
}

const dev = gulp.series(clean, gulp.parallel(html, css, js, images, fonts), updateBrowser)
const watch = gulp.parallel(watchFiles, dev)

exports.html = html
exports.css = css
exports.js = js
exports.fonts = fonts
exports.images = images
exports.dev = dev
exports.watch = watch
exports.default = watch
