/* import necessary npm packages */
const gulp = require('gulp');
const rtlcss = require('gulp-rtlcss');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify-es').default;
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const autoPrefixer = require('gulp-autoprefixer');
const gulpInject = require('gulp-inject');
const series = require('stream-series');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const gulpfilter = require('gulp-filter');
const fileInclude = require('gulp-file-include');

// Assets sources
const vendor = './src/assets/vendor_assets';
const theme = './src/assets/theme_assets';

// ★★★ 원본 소스 정의 (빌드 작업용) ★★★
// (이 부분은 'build:optimize'에서만 사용되므로 그대로 둡니다)
const vendorAssets = gulp.src(
    [
        `${vendor}/css/bootstrap/*.css`,
        `${vendor}/css/*.css`,
        `${vendor}/js/jquery/*.js`,
        `${vendor}/js/bootstrap/popper.js`,
        `${vendor}/js/bootstrap/bootstrap.min.js`,
        `${vendor}/js/moment/moment.min.js`,
        `${vendor}/js/*.js`,
    ],
    { read: true }
);
const themeAssets = gulp.src(['src/style.css', `${theme}/js/*.js`], { read: true });

/* scss to css compilation */
// (참고: sassCompiler 함수는 동일합니다)
function sassCompiler(src, dest) {
    return function (done) {
        gulp.src(src)
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
            .pipe(sourcemaps.write('maps'))
            .pipe(gulp.dest(dest)) // 목적지로 컴파일
            .pipe(browserSync.reload({
                stream: true
            })); // 브라우저 리로드
        done();
    }
}

gulp.task('scss:bs', sassCompiler(
    './src/assets/vendor_assets/css/bootstrap/bootstrap.scss',
    './dist/assets/vendor_assets/css/bootstrap/'
    )
);

gulp.task('scss:theme', sassCompiler(
    './src/assets/theme_assets/sass/style.scss',
    './dist'
    )
);

gulp.task('copy:assets', function() {
    return gulp.src([
        'src/assets/**/!(*.scss)', // assets 안의 모든 파일 (scss 제외)
        'src/img/**',             // img 안의 모든 파일
        'src/json/**'            // ★★★ json 폴더 추가 ★★★
    ], { base: 'src' }) // 'src'의 폴더 구조를 유지하면서
        .pipe(gulp.dest('dist')); // 'dist'로 복사
});

gulp.task('html:include', function() {
    return gulp.src(['src/*.html', '!src/include/*.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('serve', function(done) {
    browserSync.init({
        server: {
            baseDir: './dist' // 'dist' 폴더를 기준으로 서버 실행 (동일)
        },
        port: 3010
    })
    done();
});

// 1. 'scss:theme', 'scss:bs', 'copy:assets'를 병렬(parallel)로 먼저 실행 (파일 준비)
// 2. 'html:include'를 실행 (HTML 조립)
// 3. 'serve'를 실행 (서버 켜기)
gulp.task('default', gulp.series(
    gulp.parallel('scss:theme', 'scss:bs', 'copy:assets'),
    'html:include',
    'serve',
    function () { // 4. 'watch' (파일 감시) 시작

        // SASS 파일 감시 -> 'dist'로 바로 컴파일
        gulp.watch(
            './src/assets/theme_assets/sass/**/*',
            gulp.series('scss:theme')
        );
        gulp.watch(
            './src/assets/vendor_assets/css/bootstrap/*.scss',
            gulp.series('scss:bs')
        );

        // HTML 파일 감시 -> 'dist'로 조립
        gulp.watch(
            ['src/*.html', 'src/include/*.html'],
            gulp.series('html:include')
        );

        // [수정됨] 'copy:assets'가 감시하는 모든 폴더를 동일하게 감시
        gulp.watch([
            'src/assets/**/!(*.scss)', // assets 안의 모든 파일 (scss 제외)
            'src/img/**',             // img 안의 모든 파일
            'src/json/**'            // ★★★ json 폴더 추가 ★★★
        ], gulp.series('copy:assets', browserSync.reload)); // 변경 시, 복사하고 새로고침
    }));

// --- (참고) ---
// 아래 'build' 및 'build:optimize' 작업들은
// 'default' 작업과 별개이므로(개발 시 사용 안 함)
// 원본 코드를 그대로 두셔도 됩니다.
// (하지만 'html:include'를 사용하도록 수정하는 것이 좋습니다)
// (일단 404 에러 해결을 위해 'default'만 확실히 수정했습니다)

// gulp build task: generate an upladable version of the template
var filesToMove = [
    vendor+'/**',
    '!src/assets/vendor_assets/css/**/!(*.css)',
    theme+'/**',
    '!src/assets/theme_assets/{sass,sass/**}',
    // './src/*.html', // html:build가 처리하도록 제외
    './src/*.css',
    './src/img/**'
];
gulp.task('move', function(done){
    gulp.src(filesToMove, {base: './src'})
        .pipe(gulp.dest('build'));
    done();
});

// [새로 추가] Build용 HTML 조립
gulp.task('html:build', function() {
    return gulp.src(['src/*.html', '!src/include/*.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('build'));
});

// [수정됨] build 작업
gulp.task('build', gulp.series('scss:bs','scss:theme', 'move', 'html:build'));


// eject optimized  version for demo
gulp.task('distAssets', function (done) {
    var jsFilter = gulpfilter(['**/*.js'], {restore: true}),
        cssFilter = gulpfilter(['**/*css'], {restore: true}),
        thmis = gulpfilter(['**/*.js'], {restore: true});

    var va = vendorAssets
        .pipe(jsFilter)
        .pipe(uglify())
        .on('error', function (e) {
            console.log(e);
        })
        .pipe(concat('plugins.min.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(cleancss(
            {
                compatibility: 'ie8',
                rebase: false
            }))
        .pipe(concat('plugin.min.css'))
        .pipe(gulp.dest('./dist/css'));

    var ta = themeAssets
        .pipe(thmis)
        .pipe(uglify())
        .on('error', function (e) {
            console.log(e);
        })
        .pipe(concat('script.min.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(thmis.restore)
        .pipe(gulpfilter(['**/*.css']))
        .pipe(cleancss({compatibility: 'ie8'}))
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./dist'));

    var fonts = gulp.src('./src/assets/vendor_assets/fonts/**')
        .pipe(gulp.dest('dist/fonts'));

    // HTML 처리는 build:optimize에서 별도로 수행
    return merge(va, ta, fonts);
    done();
});

// [새로 추가] Optimize용 HTML 조립
gulp.task('html:dist', function() {
    return gulp.src(['src/*.html', '!src/include/*.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'));
});


//'imgoptimize'
// [수정됨] distAssets 전에 html:dist 먼저 실행
gulp.task('build:optimize', gulp.series('html:dist', 'distAssets', function (done) {
    gulp.src('dist/*.html')
        .pipe(gulpInject(
            gulp.src(['dist/css/*.css', 'dist/js/*.js', 'dist/*.css']),
            {relative: true}
        ))
        .pipe(gulp.dest('dist'));
    done();
}));

//rtl css generator (변경 없음)
gulp.task('rtl', function (done) {
    var bootstrap = gulpfilter('**/bootstrap.css', {restore: true}),
        style = gulpfilter('**/style.css', {restore: true});

    gulp.src(['./src/assets/vendor_assets/css/bootstrap/bootstrap.css', './src/style.css'])
        .pipe(rtlcss({
            'stringMap': [
                {
                    'name': 'left-right',
                    'priority': 100,
                    'search': ['left', 'Left', 'LEFT'],
                    'replace': ['right', 'Right', 'RIGHT'],
                    'options': {
                        'scope': '*',
                        'ignoreCase': false
                    }
                },
                {
                    'name': 'ltr-rtl',
                    'priority': 100,
                    'search': ['ltr', 'Ltr', 'LTR'],
                    'replace': ['rtl', 'Rtl', 'RTL'],
                    'options': {
                        'scope': '*',
                        'ignoreCase': false
                    }
                }
            ]
        }))
        .pipe(bootstrap)
        .pipe(rename({suffix: '-rtl', extname: '.css'}))
        .pipe(gulp.dest('./src/assets/vendor_assets/css/bootstrap/'))
        .pipe(bootstrap.restore)
        .pipe(style)
        .pipe(rename({suffix: '-rtl', extname: '.css'}))
        .pipe(gulp.dest('./src'));
    done();
});