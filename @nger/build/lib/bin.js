#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const run_1 = require("./run");
const path_1 = require("path");
const typescript_1 = require("typescript");
const fs_1 = require("fs");
const pkg = require('../package.json');
commander_1.default.version(pkg.version)
    .option(`-w, --watch`, '监听文件变化')
    .option(`-o, --output [output]`, '输出文件')
    .option(`-p, --publish`, '上传文件')
    .option(`-h, --host [host]`, '上传链接')
    .parse(process.argv);
const root = process.cwd();
const packageJson = require(path_1.join(root, 'package.json'));
const defaultConfig = typescript_1.findConfigFile(process.cwd(), (file) => {
    return fs_1.existsSync(file);
}) || path_1.join(process.cwd(), 'tsconfig.json');
const output = path_1.join(root, commander_1.default.output || 'dist', packageJson.name);
const types = path_1.join(root, commander_1.default.types || 'types', `${packageJson.name}.types`);
const host = commander_1.default.host || 'http://10.0.0.4:9008';
let options = {
    src: process.cwd(),
    output: output,
    types: types,
    tsconfig: defaultConfig,
    watch: !!commander_1.default.watch,
    name: packageJson.name,
    publish: !!commander_1.default.publish,
    host: host
};
try {
    run_1.run(options);
}
catch (e) {
    throw e;
}
