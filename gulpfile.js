const { gulp, src, dest, lastRun, series, parallel, watch } = require("gulp");
const plumber = require("gulp-plumber");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const fileInclude = require("gulp-file-include");
const newer = require("gulp-newer");
const spritesmith = require("gulp.spritesmith");
const merge = require("merge-stream");
const browserSync = require("browser-sync").create();
const del = require("del");
const beautify = require("gulp-beautify");

const sourceMobile = {
    html: "sources/html/**/*.html",
    css: "sources/resources/assets/scss/",
    js: "sources/resources/assets/js/",
    img: "sources/resources/assets/images/",
    sprite: "sources/resources/assets/scss/sprite/",
    ir: "sources/resources/assets/ir/",
    commonResource: "sources/resources/common/",
};

const distMobile = {
    path: "dist/_path/",
    html: "dist/html/",
    css: "dist/resources/assets/css/",
    scss: "dist/resources/assets/scss/",
    js: "dist/resources/assets/js/",
    img: "dist/resources/assets/images/",
    sprite: "dist/resources/assets/css/sprite/",
    commonResource: "dist/resources/common/",
};

const dist = {
    path: "dist/_path/",
};

/****************** Mobile [s] ******************/

// html include
const htmlMobileTask = () => {
    return src(
        sourceMobile.html,
        { base: "sources/html/" },
        { since: lastRun(htmlMobileTask) }
    )
        .pipe(
            fileInclude({
                prefix: "@@",
                basepath: "@file",
            })
        )
        .pipe(beautify.html({ indent_size: 4 }))
        .pipe(dest(distMobile.html))
        .pipe(browserSync.reload({ stream: true }))
        .on("end", () => {
            return del(["dist/html/**/__include"]);
        });
};

// CSS
const cssMobileTask = () => {
    return src(sourceMobile.css + "*.{scss,css}")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                outputStyle: "compact",
                indentType: "space",
                indentWidth: 4,
                precision: 8,
                sourceComments: false,
            }).on("error", sass.logError)
        )
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(sourcemaps.write())
        .pipe(dest(distMobile.css))
        .pipe(browserSync.reload({ stream: true }));
};

// JS
const jsMobileTask = () => {
    return src(sourceMobile.js + "*.js", { since: lastRun(jsMobileTask) })
        .pipe(uglify())
        .pipe(dest(distMobile.js))
        .pipe(beautify.js({ indent_size: 4 }))
        .pipe(browserSync.reload({ stream: true }));
};

//Image Minify
const imgMinMobileTask = () => {
    return src([sourceMobile.img + "**/*.{png,gif,jpg,mp4,svg}"], {
        since: lastRun(imgMinMobileTask),
    })
        .pipe(newer(distMobile.img))
        .pipe(dest(distMobile.img))
        .pipe(browserSync.reload({ stream: true }));
};

//Sprite
const autoSpriteMobile = (done) => {
    const spriteData = src(sourceMobile.ir + "*.png").pipe(
        spritesmith({
            retinaSrcFilter: [sourceMobile.ir + "*@2x.png"],
            imgName: "sprite.png",
            retinaImgName: "sprite@2x.png",
            cssName: "./sprite/_sprite.css",
            imgPath: "../images/sprite/sprite.png",
            retinaImgPath: "../images/sprite/sprite@2x.png",
            padding: 10,
        })
    );

    const imgStream = spriteData.img.pipe(dest(distMobile.img + "sprite"));

    const cssStream = spriteData.css
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(dest(sourceMobile.css))
        .pipe(browserSync.reload({ stream: true }));

    return merge(imgStream, cssStream);
};

//Sprite resources file move
const spriteMobileTask = () => {
    return src([sourceMobile.sprite + "**/*.*"])
        .pipe(dest(distMobile.sprite))
        .pipe(browserSync.reload({ stream: true }));
};

// watch
const watchMobileTask = () => {
    watch(sourceMobile.commonResource, commonMobileMove);
    watch(sourceMobile.html, htmlMobileTask);
    watch(sourceMobile.sprite, spriteMobileTask);
    watch(sourceMobile.css, cssMobileTask);
    watch(sourceMobile.js, jsMobileTask);
    watch(sourceMobile.img, imgMinMobileTask);
    watch(sourceMobile.ir, autoSpriteMobile);
};
/****************** Mobile [e] ******************/

/****************** Common [s] ******************/
const commonMobileMove = () => {
    return src([sourceMobile.commonResource + "**/*.*"])
        .pipe(dest(distMobile.commonResource))
        .pipe(browserSync.reload({ stream: true }));
};
const indexMove = () => {
    return src(["sources/*.html"])
        .pipe(dest("dist/"))
        .pipe(browserSync.reload({ stream: true }));
};
/****************** Common [e] ******************/

const cleanAllTask = () => {
    return del(["dist/"]);
};

// Server
const server = () => {
    return browserSync.init({
        port: 5500,
        server: {
            baseDir: "dist/",
        },
    });
};

/****************** Common [e] *****************/

// exports
exports.clean = cleanAllTask;
//Mobile
exports.front = series(
    cleanAllTask,
    indexMove,
    commonMobileMove,
    htmlMobileTask,
    autoSpriteMobile,
    cssMobileTask,
    jsMobileTask,
    imgMinMobileTask,
    spriteMobileTask,
    parallel(server, watchMobileTask)
);

exports.build = series(
    cleanAllTask,
    indexMove,
    commonMobileMove,
    htmlMobileTask,
    autoSpriteMobile,
    cssMobileTask,
    jsMobileTask,
    imgMinMobileTask,
    spriteMobileTask
);
