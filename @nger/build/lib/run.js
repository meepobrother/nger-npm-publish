"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = __importDefault(require("gulp"));
const gulp_typescript_1 = require("gulp-typescript");
const path_1 = require("path");
const chokidar_1 = require("chokidar");
const fs_1 = require("fs");
const publish_1 = require("./publish");
const fs_extra_1 = require("fs-extra");
function fromEvent(event) {
    return new Promise((resolve, reject) => {
        event.on('end', () => {
            resolve();
        });
        event.on(`error`, (e) => {
            reject(e);
        });
    });
}
function run(options) {
    const pkg = JSON.parse(fs_1.readFileSync(path_1.join(options.src, 'package.json')).toString('utf8'));
    // 版本号自动加1
    const versions = pkg.version.split('.');
    const lastVersion = parseInt(versions.pop()) + 1;
    pkg.version = [...versions, lastVersion].join('.');
    fs_1.writeFileSync(path_1.join(options.src, 'package.json'), JSON.stringify(pkg, null, 2));
    const tsconfig = require(options.tsconfig);
    tsconfig.exclude = tsconfig.exclude || [];
    tsconfig.include = tsconfig.include || [];
    const exclude = [
        ...tsconfig.exclude.map((inc) => `!${path_1.join(options.src, inc, '*.ts')}`),
        ...tsconfig.exclude.map((inc) => `!${path_1.join(options.src, inc, '/**/*.ts')}`),
    ];
    const tsFiles = [];
    tsconfig.include.map((inc) => {
        tsFiles.push(path_1.join(options.src, inc, '*.ts'));
        tsFiles.push(path_1.join(options.src, inc, '**/*.ts'));
    });
    gulp_1.default.task(`dts`, (done) => {
        delete pkg.main;
        pkg.name = `${pkg.name}.types`;
        pkg.main = pkg.types;
        console.log(`i am compiling dts...`);
        const pros = tsconfig.include.map((inc) => {
            const tsProject = gulp_typescript_1.createProject(options.tsconfig, {
                declaration: true
            });
            const tsResult = gulp_1.default.src([
                path_1.join(options.src, inc, '*.ts'),
                path_1.join(options.src, inc, '**/*.ts'),
                `!${path_1.join(options.src, options.output || '')}`,
                ...exclude
            ]).pipe(tsProject());
            const dts = fromEvent(tsResult.dts.pipe(gulp_1.default.dest(path_1.join(options.types, inc))));
            return dts;
        });
        Promise.all(pros).then(res => {
            console.log(`i am compiling dts finish`);
            fs_extra_1.ensureDirSync(options.output);
            fs_1.writeFileSync(path_1.join(options.types, 'package.json'), JSON.stringify(pkg, null, 2));
            const build = () => publish_1.publish(options.types, options.host).then(res => res(`${options.host}/upload`));
            if (options.publish)
                build();
            done && done();
        });
    });
    gulp_1.default.task("compiler", (done) => {
        console.log(`i am compiling...`);
        const pros = tsconfig.include.map((inc) => {
            const tsProject = gulp_typescript_1.createProject(options.tsconfig);
            const tsResult = gulp_1.default.src([
                path_1.join(options.src, inc, '*.ts'),
                path_1.join(options.src, inc, '**/*.ts'),
                `!${path_1.join(options.src, options.output || '')}`,
                ...exclude
            ]).pipe(tsProject());
            const js = fromEvent(tsResult.pipe(gulp_1.default.dest(path_1.join(options.output, inc))));
            return js;
        });
        Promise.all(pros).then(res => {
            console.log(`i am compiling finish`);
            done && done();
        });
    });
    gulp_1.default.task("copy", (done) => {
        console.log(`i am copy...`);
        const incs = tsconfig.include.map((inc) => {
            const src = gulp_1.default.src(`${path_1.join(options.src, inc, '**/*.{json,graphql,proto,notadd,tpl,html,css,jpg,png,md,ico,svg,htm,yml,jpeg,mp4,mp3}')}`).pipe(gulp_1.default.dest(path_1.join(options.output, inc)));
            return fromEvent(src);
        });
        const inputs = [
            `!${path_1.join(options.src, '__tests__')}/**/*`,
            `!${path_1.join(options.src, '/**/__tests__')}/**/*`,
            `!${path_1.join(options.src, 'node_modules/**/*')}`,
            `!${path_1.join(options.src, '/**/node_modules')}/**/*`,
            `!${path_1.join(options.output, `/**/*`)}`,
            `!${options.tsconfig}`
        ];
        if (fs_1.existsSync(path_1.join(options.src, 'README.md'))) {
            inputs.push(path_1.join(options.src, 'README.md'));
        }
        if (fs_1.existsSync(path_1.join(options.src, 'readme.md'))) {
            inputs.push(path_1.join(options.src, 'readme.md'));
        }
        if (fs_1.existsSync(path_1.join(options.src, 'package.json'))) {
            inputs.push(path_1.join(options.src, 'package.json'));
        }
        if (fs_1.existsSync(path_1.join(options.src, 'env.back'))) {
            inputs.push(path_1.join(options.src, 'env.back'));
        }
        if (fs_1.existsSync(path_1.join(options.src, 'lerna.json'))) {
            inputs.push(path_1.join(options.src, 'lerna.json'));
        }
        incs.push(fromEvent(gulp_1.default.src(inputs).pipe(gulp_1.default.dest(options.output))).catch(e => done && done(e)));
        Promise.all(incs).then(() => {
            console.log(`i am copy finish`);
            done && done();
        });
    });
    const build = () => publish_1.publish(options.output).then(res => res('http://10.0.0.4:9008/upload'));
    gulp_1.default.task(`start`, (done) => {
        gulp_1.default.series("compiler", "dts", "copy")((done) => {
            if (options.publish)
                build();
            done && done();
        });
    });
    if (options.watch) {
        chokidar_1.watch(tsFiles).on('change', () => {
            gulp_1.default.series(`start`)(() => {
                console.log(`文件变化`);
            });
        });
    }
    else {
        gulp_1.default.series("compiler", "dts", "copy")((done) => {
            if (options.publish)
                build();
            done && done();
        });
    }
}
exports.run = run;
