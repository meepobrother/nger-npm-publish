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
const glob_1 = __importDefault(require("glob"));
const root = process.cwd();
const lernaPath = path_1.join(root, 'lerna.json');
if (fs_1.existsSync(lernaPath)) {
    const lerna = require(lernaPath);
    const packages = lerna.packages;
    const pkg = packages[0];
    const dist = path_1.join(root, commander_1.default.output || 'dist');
    glob_1.default(path_1.join(root, pkg), (err, matches) => {
        if (err)
            throw err;
        matches.map(match => {
            const packageJson = require(path_1.join(match, 'package.json'));
            const defaultConfig = typescript_1.findConfigFile(match, (file) => {
                return fs_1.existsSync(file);
            }) || path_1.join(match, 'tsconfig.json');
            const host = commander_1.default.host || 'http://10.0.0.4:9008';
            let options = {
                src: match,
                output: path_1.join(dist, packageJson.name),
                types: path_1.join(dist, `${packageJson.name}.types`),
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
        });
    });
}
